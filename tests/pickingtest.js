const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer({
    antialias: true
});
scene.background = new THREE.Color(0,0,0);

let camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
window.globalCamera = camera;

renderer.setSize(window.innerWidth, window.innerHeight);
Network.Materials.sphereMaterial.uniforms.screen.value.set(window.innerWidth, window.innerHeight);
Network.Materials.lineMaterial.uniforms.screen.value.set(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);








const nodes = 20;
const layers = 60;
const width = 1;
const height = 1;

let graph = new Network.LayeredGraph(layers, nodes);
graph.directed = true;
graph.position.set(-(layers-1)*width/2, -(nodes-1)*height/2, 0);
graph.scale.set(width, height, 1);

let graph2 = new Network.PickableGraph();
graph2.position.copy(graph.position);
graph2.scale.copy(graph2.scale);

let renderGraph = graph;

//add nodes
for(let layer = 0; layer < layers; ++layer){
    for(let e = 0; e < nodes * 1.5; ++e){
        let src = Math.floor(Math.random() * nodes);
        let tgt = Math.floor(Math.random() * nodes);
        graph.addEdge(`l${layer-1}n${src}`, `l${layer}n${tgt}`);
    }
}



for(let e = 0; e < graph.edges.length; ++e){
    let intensity = Math.round(Math.random());
    graph.edges[e].intensity = intensity;
}

for(let n = 0; n < graph.nodes.length; ++n){
    let intensity = Math.random();
    let col = new Network.Vec3(1, 0.65, 0).multiplyScalar(1 - intensity).add(new Network.Vec3(0, 0, 1).multiplyScalar(intensity));
    graph.nodes[n].color = col;
}

graph.setEdgeGeom();
graph.setNodeGeom();


scene.add(graph);
window.graph = graph;



// camera.position.z = 50;
camera.position.set(0,0,50);

const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.screenSpacePanning = true;

async function animate(){
    requestAnimationFrame(animate);
    
    renderer.render(scene, camera);
    controls.update();
}
animate();

const w = window.innerHeight;
const h = window.innerWidth;
let pickingScene = new THREE.Scene();
let pickingTexture = new THREE.WebGLRenderTarget(renderer.getSize().width, renderer.getSize().height);
// pickingTexture.texture.minFilter = THREE.LinearFilter;
let canvas = document.querySelector('canvas');

canvas.addEventListener('click', function(e){
    pick(e);
});

function pick(event){
    
    renderGraph.prepareForPicking();
    pickingScene.add(renderGraph);
    renderer.render(pickingScene, camera, pickingTexture);
    renderGraph.revertToNormal();
    scene.add(renderGraph);


    let pixelBuffer = new Uint8Array(4);
    renderer.readRenderTargetPixels(pickingTexture, event.clientX, pickingTexture.height - event.clientY, 1, 1, pixelBuffer);
    let id = (pixelBuffer[0]<<16)|(pixelBuffer[1]<<8)|(pixelBuffer[2]);
    // console.log(event, pixelBuffer, id);
    if(id){
        console.log(id, pixelBuffer);
        console.log(graph.nodes[id-1], graph.getConnected(graph.nodes[id-1]));

        let ng = graph.getConnected(graph.nodes[id-1]);
        graph2.nodes = ng.nodes;
        graph2.edges = ng.edges;
        graph2.setEdgeGeom();
        graph2.setNodeGeom();

        renderGraph = graph2;
        scene.remove(graph);
        scene.add(graph2);
    }
    else{
        renderGraph = graph;
        scene.remove(graph2);
        scene.add(graph);
    }
}