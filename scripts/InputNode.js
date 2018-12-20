let INPUTNODE_loadTexture = new THREE.TextureLoader().load('/textures/lg.comet-spinner.gif');
let INPUTNODE_loadTextureMat = new THREE.MeshBasicMaterial({map: INPUTNODE_loadTexture});

class InputNode extends GraphNode {
    constructor(name, shape = "ico", info = {}) {
        super(name, shape, info);
        this.msgData = { Image: "/imageDATA/VG_100K/2.jpg", Question: "what color is the car" };
        if(info.answer){
            this.answerNode = info.answer;
        }
        if(info.heatmap){
            this.heatmapNode = info.heatmap;
        }
        if(info.question){
            this.questionNode = info.question;
        }
    }

    static get loadingMaterial() {
        return INPUTNODE_loadTextureMat;
    }

    clicked(event) {

        let gui = new dat.GUI()
        gui.domElement.style.position = "absolute";
        gui.domElement.style.left = `${event.clientX}px`
        gui.domElement.style.top = `${event.clientY}px`

        gui.add(this.msgData, 'Image');
        gui.add(this.msgData, 'Question');
        gui.add(this, 'sendRequest');
        //Assign to global gui
        window.globalGUI = gui;

    }

    sendRequest() {
        let tempmat = this.nodeMesh.material;
        this.nodeMesh.material = InputNode.loadingMaterial;
        $.ajax({type: 'POST',
            data: JSON.stringify(this.msgData),
            contentType: 'application/json',
            url: 'https://xai.nautilus.optiputer.net/Predict',
            success: (data) =>
            {
                this.nodeMesh.material = tempmat;
                this.receiveResponse(data)
            }

        });
        
        
        if (window.globalGUI) {
            window.globalGUI.destroy();
            window.globalGUI = null;
        }
    }

    receiveResponse(body) {

        let texturesrc = `data:image/jpeg;base64,${body.htmpRGB}`;
        let texture = new THREE.TextureLoader().load(texturesrc);
        texture.minFilter = THREE.LinearFilter;

        let textureMat = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide });
        if(!this.heatmapNode){
            if(this.currImage){
                this.currImage.material = textureMat;
            }
            else{
                let textureGeom = new THREE.PlaneGeometry(1.0, 1.0);
                let textureMesh = new THREE.Mesh(textureGeom, textureMat);   
                let textureObj = new THREE.Object3D();
                textureObj.add(textureMesh);
                textureObj.position.set(0, 0, 1);
        
                this.currImage = textureObj;
                this.add(textureObj);
            }
            this.lookAt(window.globalCamera.position);    
        }
        else{
            let node = this.parentGraph.nodes[this.parentGraph.lookup[this.heatmapNode]];
            console.log(node);
            node.nodeMesh.material = textureMat;
            node.lookAt(window.globalCamera.position);
        }
        if(this.answerNode){
            let node = this.parentGraph.nodes[this.parentGraph.lookup[this.answerNode]];
            node.setText(body.answer)
            node.lookAt(window.globalCamera.position);
        }
        else{
            if(!this.currText){
                let textnode = new TextNode("text", {text: body.answer});
                textnode.position.set(0, -0.75, 1)
                this.currText = textnode;
                this.add(textnode);    
            }
            else{
                this.currText.setText(body.answer);
            }
        }
        if(this.questionNode){
            let node = this.parentGraph.nodes[this.parentGraph.lookup[this.questionNode]];
            node.setText(this.msgData.Question);
            node.lookAt(window.globalCamera.position);
        }
        
    }
}