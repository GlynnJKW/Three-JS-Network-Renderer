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
        this._visQueued = 0;
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
        let colors = [];
        let width = [];
        
        for(let i = 0; i < this.nodes.length; i += 1){
            let pos = this.nodes[i].position;
            let info = this.nodeVisFunction(this.nodes[i]);
            let col = info.color;
            let w = info.width;


            //3 vertices per node
            vertices.push(pos.x, pos.y, pos.z);
            vertices.push(pos.x, pos.y, pos.z);
            vertices.push(pos.x, pos.y, pos.z);
            // vertices.push(pos.x, pos.y, pos.z);

            //1 color per vertex
            colors.push(col.x, col.y, col.z);
            colors.push(col.x, col.y, col.z);
            colors.push(col.x, col.y, col.z);


            // 2 uvs per vertex
            uvs.push(0, 2, 1.73205080757, -1, -1.73205080757, -1);

            // 1 width per vertex
            width.push(w,w,w);
        }

        this.nodesObject = {};

        this.nodesObject.geometry = new THREE.BufferGeometry();
        
        this.nodesObject.geometry.addAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        this.nodesObject.position = this.nodesObject.geometry.attributes.position.array;
        
        this.nodesObject.geometry.addAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
        this.nodesObject.uv = this.nodesObject.geometry.attributes.uv.array;

        this.nodesObject.geometry.addAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        this.nodesObject.color = this.nodesObject.geometry.attributes.color.array;

        this.nodesObject.geometry.addAttribute('width', new THREE.Float32BufferAttribute(width, 1));
        this.nodesObject.width = this.nodesObject.geometry.attributes.width.array;

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
        let width = new Float32Array(this.edges.length * 4);
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


            //#region width/color
            let info = this.edgeVisFunction(this.edges[i])

            width[i*4] = width[i*4+1] = width[i*4+2] = width[i*4+3] = info.width;

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

        this.edgeObject = {indices};

        this.edgeObject.geometry = new THREE.BufferGeometry();
        this.edgeObject.geometry.setIndex(this.edgeObject.indices);

        this.edgeObject.geometry.addAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        this.edgeObject.position = this.edgeObject.geometry.attributes.position.array;

        this.edgeObject.geometry.addAttribute('direction', new THREE.Float32BufferAttribute(directions, 3));
        this.edgeObject.direction = this.edgeObject.geometry.attributes.direction.array;

        this.edgeObject.geometry.addAttribute('width', new THREE.Float32BufferAttribute(width, 1));
        this.edgeObject.width = this.edgeObject.geometry.attributes.width.array;

        this.edgeObject.geometry.addAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
        this.edgeObject.uv = this.edgeObject.geometry.attributes.uv.array;


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
        if(this.edgeObject.width.length != this.edges.length * 4){
            this.edgeObject.width = new Float32Array(this.edges.length * 4);
            this.edgeObject.width.fill(0);
            this.edgeObject.geometry.addAttribute('width', new THREE.Float32BufferAttribute(this.edgeObject.width, 1)); 
        }
        let width = this.edgeObject.geometry.attributes.width.array;

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
        this.edgeObject.width = width;

        this.edgeObject.geometry.attributes.position.needsUpdate = true;
        this.edgeObject.geometry.attributes.width.needsUpdate = true;
        this.edgeObject.geometry.attributes.direction.needsUpdate = true;
    }

    /**
     * Update visualization data (attribute buffers) for nodes and edges
     */
    updateVis(){
        // update node arrays first, because edge vis function can take nodes into account
        let nodeColors = this.nodesObject.geometry.attributes.color.array;
        let nodeWidths = this.nodesObject.geometry.attributes.width.array;

        for(let i = 0, len = this.nodes.length; i < len; ++i){
            let info = (this.nodeVisFunction(this.nodes[i]));
            let col = info.color;
            let w = info.width;

            let c = i * 9;
            nodeColors[c] = nodeColors[c+3] = nodeColors[c+6] = col.r;
            nodeColors[c+1] = nodeColors[c+4] = nodeColors[c+7] = col.g;
            nodeColors[c+2] = nodeColors[c+5] = nodeColors[c+8] = col.b;

            let d = i * 3
            nodeWidths[d] = nodeWidths[d+1] = nodeWidths[d+2] = w;
        }

        // update edge arrays
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

        let edgeWidths = this.edgeObject.geometry.attributes.width.array;
        for(let i = 0, len = this.edges.length; i < len; ++i){
            let info = this.edgeVisFunction(this.edges[i])

            edgeWidths[i*4] = edgeWidths[i*4+1] = edgeWidths[i*4+2] = edgeWidths[i*4+3] = info.width;

            if(edgeColors != null){
                let d = i * 12;
                edgeColors[d] = edgeColors[d+3] = edgeColors[d+6] = edgeColors[d+9] = info.color.r;
                edgeColors[d+1] = edgeColors[d+4] = edgeColors[d+7] = edgeColors[d+10] = info.color.g;
                edgeColors[d+2] = edgeColors[d+5] = edgeColors[d+8] = edgeColors[d+11] = info.color.b;    
            }
        }




        //set update flags
        this.edgeObject.geometry.attributes.width.needsUpdate = true;
        if(edgeColors) this.edgeObject.geometry.attributes.color.needsUpdate = true;
        this.nodesObject.geometry.attributes.color.needsUpdate = true;
        this.nodesObject.geometry.attributes.width.needsUpdate = true;
    }

    /**
     * Queues an update for the visualization data
     * If queue is empty after <input> milliseconds, runs updateVis
     * Use when there is a lot of data to process and you don't want to cause UI to become unresponsive
     * @param {number} ms the amount of time to wait in ms
     */
    updateVisDelayed(ms){
        this._visQueued++;
        setTimeout(() => {
            this._visQueued--;
            if(this._visQueued == 0){
                this.updateVis();
            }
        }, ms);
    }

};