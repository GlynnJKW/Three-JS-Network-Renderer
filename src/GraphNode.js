import * as THREE from 'three';

const icoGeometry = new THREE.IcosahedronGeometry(0.5, 0);
const dodGeometry = new THREE.DodecahedronGeometry(0.5, 0);
const cubeGeometry = new THREE.CubeGeometry(0.5, 0.5, 0.5);
const planeGeometry = new THREE.PlaneGeometry(0.5,0.5);
const nodeMaterial = new THREE.MeshNormalMaterial({ color: 0x00ff00 });
const planeMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00, side: THREE.DoubleSide})

const sphereGeometry = new THREE.Geometry();
sphereGeometry.vertices.push(new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3());
sphereGeometry.faces.push(new THREE.Face3(0,2,1), new THREE.Face3(2,3,1));
sphereGeometry.faceVertexUvs = [
    [
        [
            {x:0,y:1},
            {x:0,y:0},
            {x:1,y:1}
        ],
        [
            {x:0,y:0},
            {x:1,y:0},
            {x:1,y:1}
        ]
    ]
];
sphereGeometry.uvsNeedUpdate = true;
sphereGeometry.elementsNeedUpdate = true;
sphereGeometry.verticesNeedUpdate = true;

const textureMap = [];

/**
 * @class
 * @extends THREE.Object3D
 */
export default class GraphNode extends THREE.Object3D {
    /**
     * 
     * @param {string} [name]
     * @param {string} [shape=ico]
     * @param {*} info 
     */
    constructor(name, shape="ico", info={}){
        super();
        this.edges = [];
        if(name){
            this.name = name;
        }
        else{
            this.name = this.uuid;
        }
        this.visited = false;
        this.locked = false;
        this.velocity = new Vec3(0,0,0);
        this.forces = new Vec3(0,0,0);
        this.gnid = 0;

        let texture = false;
        if(info.texture){
            if(textureMap[info.texture]){
                texture = textureMap[info.texture]
            }
            else{
                texture = new THREE.TextureLoader().load(info.texture);
                textureMap[info.texture] = texture;
            }
        }
        if(shape == "dod"){
            if(texture){
                this.nodeMesh = new THREE.Mesh(dodGeometry, new THREE.MeshBasicMaterial({ map: texture }));
            }
            else{
                this.nodeMesh = new THREE.Mesh(dodGeometry, nodeMaterial);
            }
        }
        else if(shape === "ico"){
            if(texture){
                this.nodeMesh = new THREE.Mesh(icoGeometry, new THREE.MeshBasicMaterial({ map: texture }));
            }
            else{
                this.nodeMesh = new THREE.Mesh(icoGeometry, nodeMaterial);
            }
        }
        else if(shape === "cube"){
            if(texture){
                // console.log(texture);
                this.nodeMesh = new THREE.Mesh(cubeGeometry, new THREE.MeshBasicMaterial({ map: texture }));
            }
            else{
                this.nodeMesh = new THREE.Mesh(cubeGeometry, nodeMaterial);
            }
        }
        else if(shape === "plane"){
            if(texture){
                this.nodeMesh = new THREE.Mesh(planeGeometry, new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, map: texture }));
            }
            else{
                this.nodeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
            }
        }
        else if(shape === "sphere"){
            this.nodeMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
        }
        if(this.nodeMesh){
            this.add(this.nodeMesh);
        }
    }

    clicked(event){
        let gui = new dat.GUI()
        gui.domElement.style.position = "absolute";
        gui.domElement.style.left = `${event.clientX}px`
        gui.domElement.style.top = `${event.clientY}px`

        gui.add(this, 'name');
        gui.add(this, 'locked');
        gui.add(this.position, 'x', -50, 50).listen();
        gui.add(this.position, 'y', -50, 50).listen();
        gui.add(this.position, 'z', -50, 50).listen();

        console.log(this.parentGraph.sendPulse);

        gui.add({sendPulse: () => {this.parentGraph.sendPulse(this.name, "n0", {r:1,g:0,b:0})}}, 'sendPulse');

        //Assign to global gui
        window.globalGUI = gui;
    }
};