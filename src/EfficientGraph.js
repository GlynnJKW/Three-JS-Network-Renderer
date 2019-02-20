import * as THREE from 'three';
import Graph from './Graph';
import { sphereMaterial, lineMaterial } from './Materials';
import { EfficientNode, VisFunctions } from '.';

/**
 * @extends Graph 
 */
export default class EfficientGraph extends Graph {

    /**
     * Converts node info into visualization info
     * @param {EfficientNode} node 
     * @return {NodeVisInfo} the visual info
     */
    nodeVisFunction(node){}

    /**
     * Converts edge info into visualization info
     * @param {GraphEdge} edge 
     * @returns {EdgeVisInfo}
     */
    edgeVisFunction(edge){}

    constructor(){
        super();

        this.nodeVisFunction = VisFunctions.StandardNodeVisFunction;
        this.edgeVisFunction = VisFunctions.StandardEdgeVisFunction;
    }

    /**
     * @param {EfficientNode} node the node to add to this graph
     */
    addNode(node){
        if(this.lookup[node.name]){
            return;
        }
        let gnid = this.nodes.length;
        this.nodes[gnid] = node;
        this.lookup[node.name] = gnid;
        node.gnid = gnid;
        node.parentGraph = this;
    }

    /**
     * Creates/resets the geometry for all the nodes inside this graph
     */
    setNodeGeom(){
        if(this.nodesObject && this.nodesObject.mesh){
            this.remove(this.nodesObject.mesh);
        }
        let vertices = [];
        let uvs = [];
        let indices = [];
        let colors = [];
        
        for(let i = 0; i < this.nodes.length; i += 1){
            let pos = this.nodes[i].position;
            let col = this.nodeVisFunction(this.nodes[i]).color;


            //4 vertices per node
            vertices.push(pos.x, pos.y, pos.z);
            vertices.push(pos.x, pos.y, pos.z);
            vertices.push(pos.x, pos.y, pos.z);
            // vertices.push(pos.x, pos.y, pos.z);

            //1 color per vertex
            if(col){
                colors.push(col.x, col.y, col.z);
                colors.push(col.x, col.y, col.z);
                colors.push(col.x, col.y, col.z);
                // colors.push(col.x, col.y, col.z);
            }
            else{
                colors.push(1,1,1,1,1,1,1,1,1);
            }

            // uvs.push(0, 1.5, 0.86602540378, -1, -0.86602540378, -1);
            uvs.push(0, 2, 1.73205080757, -1, -1.73205080757, -1);

            let bind = i * 3;
            // indices.push(bind, bind+2, bind+1,  bind+2, bind+3, bind+1);
            indices.push(bind, bind+2, bind+1);
        }

        this.nodesObject = {vertices, uvs, colors, indices};

        this.nodesObject.geometry = new THREE.BufferGeometry();
        this.nodesObject.geometry.addAttribute('position', new THREE.Float32BufferAttribute(this.nodesObject.vertices, 3));
        this.nodesObject.geometry.addAttribute('uv', new THREE.Float32BufferAttribute(this.nodesObject.uvs, 2));
        this.nodesObject.geometry.addAttribute('color', new THREE.Float32BufferAttribute(this.nodesObject.colors, 3));
        // this.nodesObject.geometry.setIndex(this.nodesObject.indices);

        this.nodesObject.material = sphereMaterial;
        this.nodesObject.mesh = new THREE.Mesh(this.nodesObject.geometry, this.nodesObject.material);
        this.add(this.nodesObject.mesh);
    }

    /**
     * Updates the geometry with new positions/colors of the nodes inside
     */
    updateNodeGeom(){
        for(let i = 0; i < this.nodes.length; i += 1){
            let bind = i * 9;
            let pos = this.nodes[i].position;

            let update = [pos.x, pos.y, pos.z];

            for(let j = 0; j < 9; ++j){
                this.nodesObject.vertices[bind + j] = update[j % 3];
            }

            let col = this.nodes[i].color;
            if(col){
                let updatecolor = [col.r, col.g, col.b];
                for(let j = 0; j < 9; ++j){
                    this.nodesObject.colors[bind + j] = updatecolor[j % 3];
                }
            }
        }

        this.nodesObject.geometry.addAttribute('position', new THREE.Float32BufferAttribute(this.nodesObject.vertices, 3));
    }

    /**
     * Creates/resets the edge geometry for all edges inside of this graph
     */
    setEdgeGeom(){
        if(this.edgeObject && this.edgeObject.mesh){
            this.remove(this.edgeObject.mesh);
        }

        let colors = null;
        // Only use colors if edgevisfunction returns color
        if(this.edgeVisFunction({}).color != undefined){
            colors = new Float32Array(this.edges.length * 4 * 3);
        }

        let vertices = new Float32Array(this.edges.length * 4 * 3);
        let uvs = new Float32Array(this.edges.length * 4 * 2);
        let intensity = new Float32Array(this.edges.length * 4);
        let directions = new Float32Array(this.edges.length * 4 * 3);
        let indices = [];

        for(let i = 0; i < this.edges.length; i += 1){
            let n1 = this.edges[i].source;
            let n2 = this.edges[i].target;

            let d = i * 12;
            let v = i * 4;
            indices.push(v,v+1,v+2, v+1,v+3,v+2);

            //#region position/uvs
            vertices[v*3] = n1.position.x;
            vertices[v*3+1] = n1.position.y;
            vertices[v*3+2] = n1.position.z;

            uvs[v*2] = -1;
            uvs[v*2+1] = 1;


            ++v;
            vertices[v*3] = n1.position.x;
            vertices[v*3+1] = n1.position.y;
            vertices[v*3+2] = n1.position.z;

            uvs[v*2] = -1;
            uvs[v*2+1] = -1;


            ++v;
            vertices[v*3] = n2.position.x;
            vertices[v*3+1] = n2.position.y;
            vertices[v*3+2] = n2.position.z;

            uvs[v*2] = 1;
            uvs[v*2+1] = 1;


            ++v;
            vertices[v*3] = n2.position.x;
            vertices[v*3+1] = n2.position.y;
            vertices[v*3+2] = n2.position.z;

            uvs[v*2] = 1;
            uvs[v*2+1] = -1;
            //#endregion


            //#region intensity/color
            let info = this.edgeVisFunction(this.edges[i])

            intensity[i*4] = intensity[i*4+1] = intensity[i*4+2] = intensity[i*4+3] = info.intensity;

            if(colors != null){
                colors[d] = colors[d+3] = colors[d+6] = colors[d+9] = info.color.r;
                colors[d+1] = colors[d+4] = colors[d+7] = colors[d+10] = info.color.g;
                colors[d+2] = colors[d+5] = colors[d+8] = colors[d+11] = info.color.b;    
            }
            //#endregion

            directions[d] = directions[d+3] = directions[d+6] = directions[d+9] = n2.position.x - n1.position.x;
            directions[d+1] = directions[d+4] = directions[d+7] = directions[d+10] = n2.position.y - n1.position.y;
            directions[d+2] = directions[d+5] = directions[d+8] = directions[d+11] = n2.position.z - n1.position.z;

        }

        this.edgeObject = {vertices, indices, uvs, intensity, directions};

        this.edgeObject.geometry = new THREE.BufferGeometry();
        this.edgeObject.geometry.setIndex(this.edgeObject.indices);

        this.edgeObject.geometry.addAttribute('position', new THREE.Float32BufferAttribute(this.edgeObject.vertices, 3));
        this.edgeObject.geometry.addAttribute('direction', new THREE.Float32BufferAttribute(this.edgeObject.directions, 3));
        this.edgeObject.geometry.addAttribute('intensity', new THREE.Float32BufferAttribute(this.edgeObject.intensity, 1));
        this.edgeObject.geometry.addAttribute('uv', new THREE.Float32BufferAttribute(this.edgeObject.uvs, 2));
        this.edgeObject.material = lineMaterial;
        this.edgeObject.mesh = new THREE.Mesh(this.edgeObject.geometry, this.edgeObject.material);

        //If the vis function returns colors, enable colors in the shader and use them
        if(colors != null){
            this.edgeObject.colors = colors;
            this.edgeObject.geometry.addAttribute('color', new THREE.Float32BufferAttribute(this.edgeObject.colors, 3));
            this.edgeObject.material.vertexColors = THREE.VertexColors;
        }
        

        this.add(this.edgeObject.mesh);

    }

    /**
     * updates the edge geometry with new positions/directions
     */
    updateEdgeGeom(){
        //Update vertices array size if necessary
        let vertices;
        if(this.edgeObject.vertices.length != this.edges.length * 4 * 3){
            vertices = new Float32Array(this.edges.length * 4 * 3);
            this.edgeObject.geometry.addAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        }
        vertices = this.edgeObject.geometry.attributes.position.array;

        //update colors buffer and array size if necessary
        if(this.edgeObject.intensity.length != this.edges.length * 4){
            this.edgeObject.intensity = new Float32Array(this.edges.length * 4);
            this.edgeObject.intensity.fill(0.5);
            this.edgeObject.geometry.addAttribute('intensity', new THREE.Float32BufferAttribute(this.edgeObject.intensity, 1)); 
        }
        let intensity = this.edgeObject.geometry.attributes.intensity.array;

        if(this.edgeObject.directions.length != this.edges.length * 4){
            this.edgeObject.directions = new Float32Array(this.edges.length * 4 * 3);
            this.edgeObject.geometry.addAttribute('direction', new THREE.Float32BufferAttribute(this.edgeObject.directions, 3));
        }
        let directions = this.edgeObject.geometry.attributes.direction.array;


        //Update vertices array
        for(let i = 0; i < this.edges.length; i += 1){
            let srcInd = this.edges[i].sourceIndex;
            let tgtInd = this.edges[i].targetIndex;
            let n1 = this.nodes[srcInd];
            let n2 = this.nodes[tgtInd];


            let v = i * 4;

            vertices[v*3] = vertices[v*3+3] = n1.position.x;
            vertices[v*3+1] = vertices[v*3+4] = n1.position.y;
            vertices[v*3+2] = vertices[v*3+5] = n1.position.z;

            v += 2;
            vertices[v*3] = vertices[v*3+3] = n2.position.x;
            vertices[v*3+1] = vertices[v*3+4] = n2.position.y;
            vertices[v*3+2] = vertices[v*3+5] = n2.position.z;


            let d = i * 12;
            directions[d] = directions[d+3] = directions[d+6] = directions[d+9] = n2.position.x - n1.position.x;
            directions[d+1] = directions[d+4] = directions[d+7] = directions[d+10] = n2.position.y - n1.position.y;
            directions[d+2] = directions[d+5] = directions[d+8] = directions[d+11] = n2.position.z - n1.position.z;
        }

        //update buffer
        this.edgeObject.vertices = vertices;
        this.edgeObject.directions = directions;
        this.edgeObject.intensity = intensity;

        this.edgeObject.geometry.attributes.position.needsUpdate = true;
        this.edgeObject.geometry.attributes.intensity.needsUpdate = true;
        this.edgeObject.geometry.attributes.direction.needsUpdate = true;
    }

    updateVis(){
        //update edge arrays
        let edgeColors = null;
        if(this.edgeVisFunction({}).color != undefined){
            if(this.edgeObject.geometry.attributes.color){
                edgeColors = this.edgeObject.geometry.attributes.color.array;
            }
            else{
                this.edgeObject.colors = new Float32Array(this.edges.length * 4 * 3); 
                this.edgeObject.geometry.addAttribute('color', new THREE.Float32BufferAttribute(this.edgeObject.colors, 3));
            }
            this.edgeObject.material.vertexColors = THREE.VertexColors;
        }
        else{
            this.edgeObject.material.vertexColors = THREE.NoColors;
        }
        this.edgeObject.material.needsUpdate = true;

        let edgeIntensities = this.edgeObject.geometry.attributes.intensity.array;
        for(let i = 0, len = this.edges.length; i < len; ++i){
            let info = this.edgeVisFunction(this.edges[i])

            edgeIntensities[i*4] = edgeIntensities[i*4+1] = edgeIntensities[i*4+2] = edgeIntensities[i*4+3] = info.intensity;

            if(edgeColors != null){
                let d = i * 12;
                edgeColors[d] = edgeColors[d+3] = edgeColors[d+6] = edgeColors[d+9] = info.color.r;
                edgeColors[d+1] = edgeColors[d+4] = edgeColors[d+7] = edgeColors[d+10] = info.color.g;
                edgeColors[d+2] = edgeColors[d+5] = edgeColors[d+8] = edgeColors[d+11] = info.color.b;    
            }
        }


        //update node arrays
        let nodeColors = this.nodesObject.geometry.attributes.color.array;

        for(let i = 0, len = this.nodes.length; i < len; ++i){
            let col = (this.nodeVisFunction(this.nodes[i])).color;

            let c = i * 9;
            nodeColors[c] = nodeColors[c+3] = nodeColors[c+6] = col.r;
            nodeColors[c+1] = nodeColors[c+4] = nodeColors[c+7] = col.g;
            nodeColors[c+2] = nodeColors[c+5] = nodeColors[c+8] = col.b;
        }

        //set update flags
        this.edgeObject.geometry.attributes.intensity.needsUpdate = true;
        if(edgeColors) this.edgeObject.geometry.attributes.color.needsUpdate = true;
        this.nodesObject.geometry.attributes.color.needsUpdate = true;
    }

};