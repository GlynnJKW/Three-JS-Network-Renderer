const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer();
let camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
renderer.setSize(window.innerWidth, window.innerHeight);
Network.Materials.sphereMaterial.uniforms.screen.value.set(window.innerWidth, window.innerHeight);
window.globalCamera = camera;
document.body.appendChild(renderer.domElement);





let len = 1000;
let graph = new Network.EfficientGraph();



graph.addNode({name: `n0`, position: new Vec3(0,0,0), edges: []});
for(let i = 1; i < len; ++i){
    let node = new Network.EfficientNode({name: `n${i}`, position: new Vec3(0,0,0)});
    graph.addNode(node);
    graph.addEdge(`n${i-1}`, `n${i}`);
}

// for(let i = 0; i < len/2; ++i){
//     let a = Math.floor(Math.random() * len);
//     let b = Math.floor(Math.random() * len);
//     graph.addEdge(`n${a}`, `n${b}`, Math.random() * len/10 + 2);
// }

for(let e = 0; e < graph.edges.length; ++e){
    let intensity = (Math.random());
    graph.edges[e].intensity = intensity;
}

for(let n = 0; n < graph.nodes.length; ++n){
    let intensity = Math.random();
    let col = new Network.Vec3(1, 0.65, 0).multiplyScalar(1 - intensity).add(new Network.Vec3(0, 0, 1).multiplyScalar(intensity));
    graph.nodes[n].color = col;
}

graph.AddFidget();
// graph.setEdgeGeom();
graph.setNodeGeom();
scene.add(graph);

camera.position.z = 50;

const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.screenSpacePanning = true;


window.addmore = function(num){
    for(let i = 0; i < num; ++i){
        const n = len + i;

        let node = new Network.EfficientNode({name: `n${n}`, position: new Vec3(0,0,0)});
        graph.addNode(node);

        let intensity = Math.random();
        let col = new Network.Vec3(1, 0.65, 0).multiplyScalar(1 - intensity).add(new Network.Vec3(0, 0, 1).multiplyScalar(intensity));
        graph.nodes[n].color = col;  

        graph.addEdge(`n${i-1}`, `n${i}`);
        graph.edges[graph.edges.length-1].intensity = Math.random();
    }
    len += num;
    graph.AddFidget();
    // graph.updateEdgeGeom();
    graph.setNodeGeom();
    // graph.updateNodeGeom();
    return len;
}

window.graph = graph;

function animate(){
    requestAnimationFrame(animate);
    
    controls.update();
    renderer.render(scene, camera);
}
animate();