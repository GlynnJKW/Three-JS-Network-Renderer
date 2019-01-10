import * as THREE from 'three';
import GraphNode from './GraphNode';

export default class TextNode extends GraphNode{
    constructor(name, info={}){
        super(name, "none", info);
        let text = info.text ? info.text : "x";
        let loader = new THREE.FontLoader();
        let that = this;
        loader.load('fonts/helvetiker_regular.typeface.json', function(font){
            that.textFont = font;
            let geometry = new THREE.TextGeometry(text, {
                font: font,
                size: 0.2,
                height: 0.01
            });
            let material = new THREE.MeshBasicMaterial({color: 0xffffff});
            let mesh = new THREE.Mesh(geometry, material);

            geometry.computeBoundingBox()
            let centerOffset = -0.5 * ( geometry.boundingBox.max.x - geometry.boundingBox.min.x );
            mesh.position.x = centerOffset;

            that.nodeMesh = mesh;
            that.add(mesh);
        });
    }

    setText(text){
        this.nodeMesh.geometry = new THREE.TextGeometry(text, {
            font: this.textFont,
            size: 0.2,
            height: 0.01
        });
        this.nodeMesh.geometry.computeBoundingBox()
        let centerOffset = -0.5 * ( this.nodeMesh.geometry.boundingBox.max.x - this.nodeMesh.geometry.boundingBox.min.x );
        this.nodeMesh.position.x = centerOffset;
    }
}