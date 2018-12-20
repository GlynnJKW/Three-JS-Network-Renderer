const pickingSphereMaterial = new THREE.ShaderMaterial(
    {
        "vertexShader": document.getElementById('pickingSphereVert').textContent,
        "fragmentShader": document.getElementById('pickingSphereFrag').textContent,
        "side": THREE.DoubleSide,
        "vertexColors": THREE.VertexColors,
        "uniforms": {
            "screen": {value: new THREE.Vector2(1920, 1080)},
            "radius": {value: 100}
        }
    });

class PickableGraph extends LayeredGraph{
    prepareForPicking(){
        if(this.edgeObject && this.edgeObject.mesh){
            this.remove(this.edgeObject.mesh);
        }

        if(this.nodesObject && this.nodesObject.mesh){
            this.nodesObject.mesh.material = pickingSphereMaterial;
        }
    }

    revertToNormal(){
        if(this.edgeObject && this.edgeObject.mesh){
            this.add(this.edgeObject.mesh);
        }

        if(this.nodesObject && this.nodesObject.mesh){
            this.nodesObject.mesh.material = sphereMaterial;
        }
    }

    setNodeGeom(){
        super.setNodeGeom();
        let ids = [];
        let color = new THREE.Color();
        for(let i = 0; i < this.nodes.length; ++i){
            let rgb = color.setHex(i+1);
            ids.push(rgb.r, rgb.g, rgb.b);
            ids.push(rgb.r, rgb.g, rgb.b);
            ids.push(rgb.r, rgb.g, rgb.b);
        }
        this.nodesObject.ids = ids;
        this.nodesObject.geometry.addAttribute('colorid', new THREE.Float32BufferAttribute(this.nodesObject.ids, 3));
    }

    updateNodeGeom(){
        super.updateNodeGeom();
        if(this.nodesObject.ids.length != this.nodesObject.vertices.length){
            //update
        }
        this.nodesObject.geometry.attributes.colorid.needsUpdate = true;
    }
}