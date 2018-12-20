const lineMaterial = new THREE.ShaderMaterial(
    {
        "vertexShader": document.getElementById('lineVert').textContent,
        "fragmentShader": document.getElementById('lineFrag').textContent,
        "side": THREE.DoubleSide,
        "transparent": true,
        "uniforms": {
            "screen": {value: new THREE.Vector2(1920, 1080)},
            "color0": {value: new THREE.Vector3(1, 0.65, 0)},
            "color1": {value: new THREE.Vector3(0,0,1)}
        }
    });

class EfficientGraph extends Graph {
    addNode(node){
        if(this.lookup[node.name]){
            return;
        }
        let gnid = this.nodes.length;
        this.nodes[gnid] = node;
        this.lookup[node.name] = gnid;
        // this.nodePositions[gnid] = [node.position.x, node.position.y, node.position.z];
        node.gnid = gnid;
        // this.add(node);
        node.parentGraph = this;
    }

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
            let col = this.nodes[i].color;


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

    setEdgeGeom(){
        if(this.edgeObject && this.edgeObject.mesh){
            this.remove(this.edgeObject.mesh);
        }

        let vertices = new Float32Array(this.edges.length * 4 * 3);
        let uvs = new Float32Array(this.edges.length * 4 * 2);
        let intensity = new Float32Array(this.edges.length * 4);
        let directions = new Float32Array(this.edges.length * 4 * 3);
        let indices = [];
        intensity.fill(0.0);
        //intensity = intensity.map(Math.random);

        for(let i = 0; i < this.edges.length; i += 1){
            let srcInd = this.edges[i].sourceIndex;
            let tgtInd = this.edges[i].targetIndex;
            let n1 = this.nodes[srcInd];
            let n2 = this.nodes[tgtInd];
            //console.log(n1, n2);

            let v = i * 4;
            indices.push(v,v+1,v+2, v+1,v+3,v+2);


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


            if(this.edges[i].intensity != undefined){
                intensity[i*4] = intensity[i*4+1] = intensity[i*4+2] = intensity[i*4+3] = this.edges[i].intensity;
            }


            let d = i * 12;
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
        //console.log(vertices, indices, geometry);
        
        //this.edgeObject.material = new THREE.LineBasicMaterial({ vertexColors: THREE.VertexColors });
        this.edgeObject.material = lineMaterial;
        this.edgeObject.mesh = new THREE.Mesh(this.edgeObject.geometry, this.edgeObject.material);

        this.add(this.edgeObject.mesh);

    }

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

    updateAllIntensities(){
        //Get array object from buffer
        let intensities = this.edgeObject.geometry.attributes.intensity.array;
        //Iterate through edges, updating the buffer if appropriate
        for(let i = 0; i < this.edges.length; i += 1){
            if(this.edges[i].intensity != undefined){
                const v = i * 4
                intensities[v] = intensities[v + 1] = intensities[v + 2] = intensities[v + 3] = this.edges[i].intensity;
            }
        }
        //Set 'dirty' tag on buffer so that buffer in vram will be updated
        this.edgeObject.geometry.attributes.intensity.needsUpdate = true;
        this.edgeObject.intensity = intensities;
    }

    updateIntensity(index, intensity){
        //Update appropriate indices in buffer and set dirty tag
        let i = this.edgeObject.geometry.attributes.intensity.array;
        const v = index * 4;
        i[v] = i[v + 1] = i[v + 2] = i[v + 3] = intensity;
        this.edgeObject.geometry.attributes.intensity.needsUpdate = true;
    }

};