import * as THREE from 'three';
import { EasingFunctions, LerpColor, sleep } from './Util';
import GraphEdge from './GraphEdge';

export default class Graph extends THREE.Object3D {
    constructor(){
        super();
        this.nodes = [];
        this.edges = [];
        this.lookup = [];
        this.directed = false;
    }

    AddFidget(){
        const scale = Math.pow(this.nodes.length/10, 0.5);
        for(let n of this.nodes.filter(n => !n.locked)){
            n.position.set(Math.random() * scale - scale/2, Math.random()  * scale - scale/2, Math.random() * scale - scale/2);
        }
    }

    createFromJSON({nodes=[], edges=[]}){
        for(let node of nodes){
            this.addNode(this.createNodeFromJSON(node));
        }
        for(let edge of edges){
            this.addEdge(edge.src, edge.tgt, edge.edgeLength);
        }
    }

    createNodeFromJSON({name="", type="default", shape="dod", locked, position, scale, info={}}){
        let node;
        switch(type){
            case "input":
                node = new InputNode(name, shape, info);
                break;
            case "text":
                node = new TextNode(name, info);
                break;
            default:
                node = new GraphNode(name, shape, info);
                break;
        }
        node.locked = false;
        node.pictures = info.pictures;
        if(position){
            node.position.set(position.x, position.y, position.z);
            node.locked = locked === undefined ? true : false;
        }
        if(scale && typeof scale === "object"){
            node.scale.set(scale.x, scale.y, scale.z);
        }
        else if(scale && typeof scale === "number"){
            node.scale.set(scale, scale, scale);
        }

        return node;
    }

    addEdge(src, tgt, edgeLength){
        let source = typeof src == "string" ? this.nodes[this.lookup[src]] : src;
        let target = typeof tgt == "string" ? this.nodes[this.lookup[tgt]] : tgt;

        if(!source || !target){
            return new Error("source or target is not valid");
        }
        //If edge already exists, do nothing
        if(source.edges.concat(target.edges).find(e => (e.target == target && e.source == source) || (e.target == source && e.source == target))){
            return;
        }
        let edge = new GraphEdge(source, target);
        if(edgeLength != undefined) edge.edgeLength = edgeLength;
        edge.setSourceIndex(this.lookup[src]);
        edge.setTargetIndex(this.lookup[tgt]);

        source.edges.push(edge);
        if(!this.directed){
            target.edges.push(edge);
        }

        edge.index = this.edges.length;
        this.edges.push(edge);
    }

    addNode(node){
        if(this.lookup[node.name]){
            return;
        }
        let gnid = this.nodes.length;
        this.nodes[gnid] = node;
        this.lookup[node.name] = gnid;
        // this.nodePositions[gnid] = [node.position.x, node.position.y, node.position.z];
        node.gnid = gnid;
        this.add(node);
        node.parentGraph = this;
    }


    findNodePath(source, target){
        if(source == target){
            return [target];
        }
        else{
            if(source.edges.length > 0){
                for(let edge of source.edges){
                    let step = this.findNodePath(edge.target, target);
                    if(step.length > 0){
                        step.unshift(source);
                        return step;
                    }
                }
            }
            return [];
        }
    }

    findEdgePath(source, target){
        if(typeof source == "string"){
            source = this.nodes.find(n => n.name == source);
        }
        if(typeof target == "string"){
            target = this.nodes.find(n => n.name == target);
        }
        if(source == target){
            return [];
        }

        let queue = source.edges.map(e => {return {"path": [e], "src": source};});
        let discovered = [];

        while(queue.length > 0){
            let curr = queue.shift();
            let path = curr.path;
            let vertex;
            if(!this.directed){
                vertex = path[path.length - 1].getNode(curr.src);
            }
            else{
                vertex = path[path.length - 1].target;
            }

            if(vertex == target){
                return path;
            }
            if(discovered[vertex.gnid]){
                continue;
            }
            discovered[vertex.gnid] = true;
            
            for(let e of vertex.edges){
                let newpath = path.slice().concat(e);
                queue.push({"path": newpath, "src": vertex});
            }
        }
        return [];
    }

    highlightEdges(source, target, color){

        if(typeof source == "string"){
            source = this.nodes.find(n => n.name == source);
        }
        if(typeof target == "string"){
            target = this.nodes.find(n => n.name == target);
        }

        let path = this.findEdgePath(source, target);
        let ids = path.map(e => e.index * 2);
        for(let i of ids){
            if(color){
                this.setEdgeColor(i, i + 1, color);
            }
            else{
                this.toggleEdgeColor(i, i + 1);
            }
        }
    }

    async sendPulse(source, target, color, pulseTime=0.4, waitTime=0.1){

        let path = this.findEdgePath(source, target);
        let ids = path.map(e => e.index * 2);

        for(let i of ids){
            // console.log("pulsing " + i);
            this.edgePulse(i, color, pulseTime);
            // console.log("sleeping");
            await sleep(waitTime * 1000);
        }
        // console.log("done");
    }

    async edgePulse(edgeId, color, time, numsteps=20){
        const step = (time/2)/numsteps;
        const originalColor = this.getEdgeColor(edgeId);

        let realtime = 0;
        let timepercent = 0;
        //Interp from original color to 
        while(timepercent < 1){
            let t = EasingFunctions.easeInOutQuart(timepercent);
            let c = LerpColor(originalColor, color, t)
            // console.log(c);
            this.setEdgeColor(edgeId, edgeId + 1, c);

            realtime += step;
            timepercent = realtime / (time/2);
            await sleep(step * 1000);
        }

        realtime -= time/2;
        timepercent = realtime / (time/2);

        //Back the other way
        while(timepercent < 1){
            let t = EasingFunctions.easeInOutQuart(timepercent);
            this.setEdgeColor(edgeId, edgeId + 1, LerpColor(color, originalColor, t));

            realtime += step;
            timepercent = realtime / (time/2);
            await sleep(step * 1000);
        }
    }



    //Call circlelayout on nonvisited nodes, update edge geometry
    circleLayout(){
        for(let node of this.nodes){
            if(node && !node.visited){
                this.visitAndCircleLayout(node, {xmin: 0, xmax: Math.PI, ymin: 0, ymax: Math.PI*2, radius: 2, addition: 2});
            }
        }
        if(this.edgeObject){
            this.updateEdgeGeom()
        }
        else{
            this.setEdgeGeom();
        }
    }

    setEdgeGeom(){
        let vertices = new Float32Array(this.edges.length * 2 * 3);
        let colors = new Float32Array(this.edges.length * 2 * 3);
        colors.fill(1.0);

        for(let i = 0; i < this.edges.length; i += 1){
            let srcInd = this.edges[i].sourceIndex;
            let tgtInd = this.edges[i].targetIndex;
            let n1 = this.nodes[srcInd];
            let n2 = this.nodes[tgtInd];
            //console.log(n1, n2);

            let v = i * 2;
            vertices[v*3] = n1.position.x;
            vertices[v*3+1] = n1.position.y;
            vertices[v*3+2] = n1.position.z;

            ++v;
            vertices[v*3] = n2.position.x;
            vertices[v*3+1] = n2.position.y;
            vertices[v*3+2] = n2.position.z;

            if(this.edges[i].color){
                colors[i*2] = colors[i*2+3] = this.edges[i].color.r;
                colors[i*2+1] = colors[i*2+4] = this.edges[i].color.g;
                colors[i*2+2] = colors[i*2+5] = this.edges[i].color.b;                
            }
        }

        this.edgeObject = {vertices, colors};

        this.edgeObject.geometry = new THREE.BufferGeometry();
        this.edgeObject.geometry.addAttribute('position', new THREE.Float32BufferAttribute(this.edgeObject.vertices, 3));
        this.edgeObject.geometry.addAttribute('color', new THREE.Float32BufferAttribute(this.edgeObject.colors, 3));
        //console.log(vertices, indices, geometry);
        
        this.edgeObject.material = new THREE.LineBasicMaterial({ vertexColors: THREE.VertexColors });
        this.edgeObject.mesh = new THREE.LineSegments(this.edgeObject.geometry, this.edgeObject.material);

        this.add(this.edgeObject.mesh);

    }

    updateEdgeGeom(){

        //Update vertices array size if necessary
        let vertices;
        if(this.edgeObject.vertices.length != this.edges.length * 2 * 3){
            vertices = new Float32Array(this.edges.length * 2 * 3);
        }
        else{
            vertices = this.edgeObject.vertices;
        }

        //update colors buffer and array size if necessary
        if(this.edgeObject.colors.length != this.edges.length * 2 * 3){
            this.edgeObject.colors = new Float32Array(this.edges.length * 2 * 3);
            this.edgeObject.colors.fill(1.0);
        }


        //Update vertices array
        for(let i = 0; i < this.edges.length; i += 1){
            let srcInd = this.edges[i].sourceIndex;
            let tgtInd = this.edges[i].targetIndex;
            let n1 = this.nodes[srcInd];
            let n2 = this.nodes[tgtInd];

            let v = i * 2;
            vertices[v*3] = n1.position.x;
            vertices[v*3+1] = n1.position.y;
            vertices[v*3+2] = n1.position.z;

            ++v;
            vertices[v*3] = n2.position.x;
            vertices[v*3+1] = n2.position.y;
            vertices[v*3+2] = n2.position.z;
        }

        //update buffer
        this.edgeObject.vertices = vertices;
        this.edgeObject.geometry.addAttribute('color', new THREE.Float32BufferAttribute(this.edgeObject.colors, 3)); 
        this.edgeObject.geometry.addAttribute('position', new THREE.Float32BufferAttribute(this.edgeObject.vertices, 3));
    }

    setEdgeColor(srcVert, tgtVert, color){
        //Update color array
        this.edgeObject.colors[srcVert*3] = color.r;
        this.edgeObject.colors[srcVert*3 + 1] = color.g;
        this.edgeObject.colors[srcVert*3 + 2] = color.b;
        this.edgeObject.colors[tgtVert*3] = color.r;
        this.edgeObject.colors[tgtVert*3 + 1] = color.g;
        this.edgeObject.colors[tgtVert*3 + 2] = color.b;

        //Update buffer
        this.edgeObject.geometry.addAttribute('color', new THREE.Float32BufferAttribute(this.edgeObject.colors, 3));
    }

    setEdgeColors(edges, colors){
        for(let i = 0; i < edges.length; ++i){
            let edge = edges[i];
            let col = colors[i];
            
            this.edgeObject.colors[edge*3] = col.r;
            this.edgeObject.colors[edge*3 + 1] = col.g;
            this.edgeObject.colors[edge*3 + 2] = col.b;

            ++edge;
            this.edgeObject.colors[edge*3] = col.r;
            this.edgeObject.colors[edge*3 + 1] = col.g;
            this.edgeObject.colors[edge*3 + 2] = col.b;
        }

        this.edgeObject.geometry.addAttribute('color', new THREE.Float32BufferAttribute(this.edgeObject.colors, 3));
    }

    getEdgeColor(srcVert){
        let c = {};
        c.r = this.edgeObject.colors[srcVert*3];
        c.g = this.edgeObject.colors[srcVert*3 + 1];
        c.b = this.edgeObject.colors[srcVert*3 + 2];
        return c;        
    }

    toggleEdgeColor(srcVert, tgtVert){
        //Update color array
        this.edgeObject.colors[srcVert*3] = 1 - this.edgeObject.colors[srcVert*3];
        this.edgeObject.colors[tgtVert*3] = 1 - this.edgeObject.colors[tgtVert*3];

        //Update buffer
        this.edgeObject.geometry.addAttribute('color', new THREE.Float32BufferAttribute(this.edgeObject.colors, 3));
    }

    //Layout technique taken from GML plugin for CalVR
    visitAndCircleLayout(node, parameters){
        node.visited = true;


        let tempaddition = parameters.addition * 0.9;
        let tempradius = parameters.radius + tempaddition;

        let px = (parameters.xmin + parameters.xmax) / 2;
        let py = (parameters.ymin + parameters.ymax) / 2;
        node.position.set(tempradius * Math.sin(px) * Math.cos(py), tempradius * Math.sin(px) * Math.sin(py), tempradius * Math.cos(px));

        let numChildren = node.edges.length;

        if(numChildren > 0){
            let sqri = Math.ceil(Math.sqrt(numChildren));
            let difx = (parameters.xmax - parameters.xmin) / sqri;
            let dify = (parameters.ymax - parameters.ymin) / sqri;
    


            let tempymin = parameters.ymin;
            let tempymax = parameters.ymin + dify;
            for(let i = 0; i < sqri; ++i){
                let tempxmin = parameters.xmin;
                let tempxmax = parameters.xmin + difx;
                for(let j = 0; j < sqri; ++j){
                    let n = i * sqri + j;
                    if(n >= numChildren){
                        continue;
                    }
                    
                    let newNode = node.edges[n].target;

                    this.visitAndCircleLayout(newNode, 
                        {
                            "xmin": tempxmin, 
                            "xmax": tempxmax, 
                            "ymin": tempymin, 
                            "ymax": tempymax, 
                            "radius": tempradius,
                            "addition": tempaddition
                        }
                    );
                    tempxmax += difx;
                    tempxmin += difx;
                }
                tempymax += dify;
                tempymin += dify;
            }
        }
    }
};