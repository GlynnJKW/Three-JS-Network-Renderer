class Graph extends THREE.Object3D {
    constructor(){
        super();
        this.movableNodes = [];
        this.nodes = [];
        this.edges = [];
        this.lookup = [];
        this.repulsion = 0.1;
        this.damping = 0.5;
        this.springconstant = 0.1;
    }

    AddFidget(){
        for(let n of this.nodes.filter(n => !n.locked)){
            n.position.add(new THREE.Vector3(Math.random()*2.0 - 1.0, Math.random()*2.0 - 1.0, Math.random()*2.0 - 1.0));
        }
    }

    TickForceLayout(num=1){
        this.movableNodes = this.nodes.filter(n => !n.locked);
        for(let i = 0; i < num; ++i){
            this.applyCoulombsLaw();
            this.applyHookesLaw();
            this.attractToCenter();
            //console.log(this.nodes.map(n => n.forces.x), this.nodes.map(n => n.forces.y), this.nodes.map(n => n.forces.z));
            this.updateVelocity();
            this.updatePosition();
        }
        if(this.edgeObject){
            this.updateEdgeGeom()
        }
        else{
            this.setEdgeGeom();
        }    
    }

    applyCoulombsLaw(){
        for(let n1 of this.movableNodes){
            for(let n2 of this.nodes){
                if(n1 !== n2){
                    let p1 = Vec3.fromThreeVec(n1.position);
                    let p2 = Vec3.fromThreeVec(n2.position);
                    let direction = p1.sub(p2).normalized();
                    let distance = p1.sub(p2).magnitude();
                    if(distance === 0) distance = 0.01;
                    let scalar = 1.0 / (distance * distance * 0.5)
                    let force = direction.multiplyScalar(this.repulsion).multiplyScalar(scalar);
                    n1.forces = n1.forces.add(force);
                    n2.forces = n2.forces.add(force.multiplyScalar(-1));
                }
            }
        }
    }

    applyHookesLaw(){
        for(let e of this.edges){
            let n1 = e.source;
            let n2 = e.target;
            let p1 = Vec3.fromThreeVec(n1.position);
            let p2 = Vec3.fromThreeVec(n2.position);
            let direction = p1.sub(p2).normalized();
            let distance = p1.sub(p2).magnitude();
            let l = e.edgeLength ? e.edgeLength : 5.0;
            let displacement = l - distance;

            let force = direction.multiplyScalar(this.springconstant * displacement * 0.5);
            n1.forces = n1.forces.add(force);
            n2.forces = n2.forces.add(force.multiplyScalar(-1));
        }
    }

    attractToCenter(){
        for(let n of this.movableNodes){
            let p = Vec3.fromThreeVec(n.position);
            let direction = p.multiplyScalar(-1.0);
			n.forces = n.forces.add(direction.multiplyScalar(this.repulsion / 50));
        }
    }

    updateVelocity(){
        for(let n of this.movableNodes){
            n.velocity = n.velocity.add(n.forces).multiplyScalar(this.damping);
        }
        for(let n of this.nodes){
            n.forces.set(0,0,0);
        }
    }

    updatePosition(){
        for(let n of this.movableNodes){
            n.position.add(n.velocity);
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

    createNodeFromJSON({name="", type="default", shape="dod", locked, position, info={}}){
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

        return node;
    }

    addEdge(src, tgt, edgeLength){
        let source = this.nodes[this.lookup[src]];
        let target = this.nodes[this.lookup[tgt]];

        if(!source || !target){
            return new Error("source or target is not valid");
        }
        let edge = new GraphEdge(source, target);
        edge.edgeLength = edgeLength;
        edge.setSourceIndex(this.lookup[src]);
        edge.setTargetIndex(this.lookup[tgt]);
        //console.log(this.lookup[src], this.lookup[tgt], edge);
        source.edges.push(edge);
        this.edges.push(edge);
    }

    addNode(node){
        if(this.lookup[node.name]){
            return;
        }
        let gnid = this.nodes.length;
        this.nodes[gnid] = node;
        this.lookup[node.name] = gnid;
        this.add(node);
    }

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
            console.log(n1, n2);

            let v = i * 2;
            vertices[v*3] = n1.position.x;
            vertices[v*3+1] = n1.position.y;
            vertices[v*3+2] = n1.position.z;

            ++v;
            vertices[v*3] = n2.position.x;
            vertices[v*3+1] = n2.position.y;
            vertices[v*3+2] = n2.position.z;
        }


        let geometry = new THREE.BufferGeometry();
        geometry.addAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        geometry.addAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        //console.log(vertices, indices, geometry);
        
        let material = new THREE.LineBasicMaterial({ vertexColors: THREE.VertexColors });
        let mesh = new THREE.LineSegments(geometry, material);

        this.add(mesh);

        this.edgeObject = {vertices, colors, geometry, material, mesh};
    }

    updateEdgeGeom(){
        let vertices = new Float32Array(this.edges.length * 2 * 3);
        let colors = new Float32Array(this.edges.length * 2 * 3);
        colors.fill(1.0);

        for(let i = 0; i < this.edges.length; i += 1){
            let srcInd = this.edges[i].sourceIndex;
            let tgtInd = this.edges[i].targetIndex;
            let n1 = this.nodes[srcInd];
            let n2 = this.nodes[tgtInd];
            console.log(n1, n2);

            let v = i * 2;
            vertices[v*3] = n1.position.x;
            vertices[v*3+1] = n1.position.y;
            vertices[v*3+2] = n1.position.z;

            ++v;
            vertices[v*3] = n2.position.x;
            vertices[v*3+1] = n2.position.y;
            vertices[v*3+2] = n2.position.z;
        }

        let geometry = this.edgeObject.geometry;
        geometry.addAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        geometry.addAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        this.edgeObject.vertices = vertices;
        this.edgeObject.colors = colors;
    }

    toggleEdgeColor(srcVert, tgtVert){
        this.edgeObject.colors[srcVert*3] = 1.0 - this.edgeObject.colors[srcVert*3];
        this.edgeObject.colors[tgtVert*3] = 1.0 - this.edgeObject.colors[tgtVert*3];
        // console.log(this.edgeObject.colors);
        this.edgeObject.geometry.addAttribute('color', new THREE.Float32BufferAttribute(this.edgeObject.colors, 3));
    }

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