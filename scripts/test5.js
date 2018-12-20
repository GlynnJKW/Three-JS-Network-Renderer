const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer({
    antialias: true
});
scene.background = new THREE.Color(1,1,1);
var raycaster = new THREE.Raycaster();
raycaster.linePrecision = 0.1;
var mouse = new THREE.Vector2();
let camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
renderer.setSize(window.innerWidth, window.innerHeight);
sphereMaterial.uniforms.screen.value.set(window.innerWidth, window.innerHeight);
window.globalCamera = camera;
document.body.appendChild(renderer.domElement);












const nodes = 100;
const layers = 10;
const width = 10;
const height = 1;

var graph = new EfficientGraph();
graph.directed = true;

//add nodes
for(let layer = 0; layer < layers; ++layer){
    for(let n = 0; n < nodes; ++n){
        let node = {name: `l${layer}n${n}`, edges: [], position: new Vec3(layer*width - layers*width/2, n*height - nodes*height/2, 0)};
        graph.addNode(node);
    }
    for(let e = 0; e < nodes*5; ++e){
        let src = Math.floor(Math.random() * nodes);
        let tgt = Math.floor(Math.random() * nodes);
        graph.addEdge(`l${layer-1}n${src}`, `l${layer}n${tgt}`);
    }
}

graph.setEdgeGeom();

for(let n = 0; n < graph.nodes.length; ++n){
    let intensity = Math.random();
    let str = Math.abs(intensity - 0.5) * 2;
    let col = new Vec3(1, 0.65, 0).multiplyScalar(1 - intensity).add(new Vec3(0, 0, 1).multiplyScalar(intensity));
    graph.nodes[n].color = col;
}

//              gen random intensity           orange * 1 - intensity        added to          blue * intensity
let colors = graph.edges.map(Math.random).map(e => new Vec3(1,0.65,0).multiplyScalar(1-e).add(new Vec3(0,0,1).multiplyScalar(e)));
graph.setEdgeColors(graph.edges.map((e,i) => i*2), colors);

graph.setNodeGeom();


scene.add(graph);














camera.position.z = 50;

const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.screenSpacePanning = true;

function animate(){
    requestAnimationFrame(animate);
    
    //graph.TickForceLayout(1);
    controls.update();
    renderer.render(scene, camera);
}
animate();