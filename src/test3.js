const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer();
var raycaster = new THREE.Raycaster();
raycaster.linePrecision = 0.1;
var mouse = new THREE.Vector2();
let camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
renderer.setSize(window.innerWidth, window.innerHeight);
sphereMaterial.uniforms.screen.value.set(window.innerWidth, window.innerHeight);
window.globalCamera = camera;
document.body.appendChild(renderer.domElement);

var graph = new Graph();

let snode = new GraphNode("n0", "cube", {});
snode.locked = false;
graph.addNode(snode);



const len = 200;

for(let i = 1; i < len; ++i){
    graph.addNode(new GraphNode(`n${i}`, "ico", {}));
    graph.addEdge(`n${i-1}`, `n${i}`, Math.random() * len/10 + 2);
}
for(let i = 0; i < len/2; ++i){
    let a = Math.floor(Math.random() * len);
    let b = Math.floor(Math.random() * len);
    graph.addEdge(`n${a}`, `n${b}`, Math.random() * len/10 + 2);
}
scene.add(graph);


camera.position.z = 50;

const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.screenSpacePanning = true;

function raycast(mouse, event){
    raycaster.setFromCamera(mouse, camera);
    let intersections = raycaster.intersectObjects(graph.nodes, true);
    if(intersections[0]){
        let obj = intersections[0].object;
        let node = obj.parent;
        if(node instanceof GraphNode){
            node.clicked(event);
        }
    }
}

function onMouseClick(event){
    let mouse = new THREE.Vector2();
    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    raycast(mouse, event);
}
renderer.domElement.addEventListener('click', onMouseClick, false);

function onMouseDown(event){
    if(window.globalGUI){
        window.globalGUI.destroy();
        window.globalGUI = null;
    }
}
renderer.domElement.addEventListener('mousedown', onMouseDown, false);

function animate(){
    requestAnimationFrame(animate);
    
    //graph.TickForceLayout(1);
    controls.update();
    renderer.render(scene, camera);
}
animate();