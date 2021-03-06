const width = 100;
const height = 1;
let layers = 4

//#region setup
const scene = new THREE.Scene();
let pickingScene = new THREE.Scene();
scene.rotation.set(0, 0, -Math.PI/2);
pickingScene.rotation.copy(scene.rotation);
const renderer = new THREE.WebGLRenderer({
    antialias: true
});
scene.background = new THREE.Color(0,0,0);
const cv = document.getElementById('canvas')

let camera = new THREE.PerspectiveCamera( 75, cv.clientWidth / window.innerHeight, 0.1, 1000 );

cv.appendChild(renderer.domElement);
//Done twice to prevent mismatch
renderer.setSize(cv.clientWidth, window.innerHeight);
renderer.setSize(cv.clientWidth, window.innerHeight);

window.addEventListener('resize', () => {
    renderer.setSize(cv.clientWidth, window.innerHeight);
    camera.aspect = cv.clientWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    Network.Materials.sphereMaterial.uniforms.screen.value.set(cv.clientWidth, window.innerHeight);
    Network.Materials.lineMaterial.uniforms.screen.value.set(cv.clientWidth, window.innerHeight);
    pickingTexture = new THREE.WebGLRenderTarget(renderer.getSize().width, renderer.getSize().height);
});
Network.Materials.sphereMaterial.uniforms.screen.value.set(cv.clientWidth, window.innerHeight);
Network.Materials.lineMaterial.uniforms.screen.value.set(cv.clientWidth, window.innerHeight);


let currentlySelected = null;
const GUI = new dat.GUI();
GUI.width = cv.clientWidth / 4;
let GUIOptions = [];
GUIOptions.push(GUI.add(window, 'minimizeCrossing'));




function getImageSrc(i){
    return "https://fakeimg.pl/64/";
}

let imageGroup = new THREE.Group();
let imageLayer1 = new Array(64);

//#region graph setup
let graph = new Network.LayeredGraph(layers, [imageLayer1.length, 256, 256, 128]);
graph.directed = true;
graph.position.set(-(layers-1)*width/2, -(256-1)*height/2, 0);
graph.scale.set(width, height, 1);
for(let i = 0; i < graph.nodesPerLayer[0]; ++i){
    graph.layout[0][i].data1 = true;
}
graph.nodeVisFunction = function(node){
    let width = node.data1 ? 0 : 1;
    return {color: node.color, width: width};
}

let graph2 = new Network.PickableGraph();
graph2.position.copy(graph.position);
graph2.scale.copy(graph.scale);
graph2.rotation.copy(graph.rotation);
graph2.nodeVisFunction = graph.nodeVisFunction;

let renderGraph = graph;

//add edges
for(let layer = 0; layer < layers-1; ++layer){
    for(let src = 0; src < graph.nodesPerLayer[layer]; ++src){
        for(let num = 0; num < 2; ++num){
            let tgt = Math.floor(Math.random() * graph.nodesPerLayer[layer+1]);
            graph.addEdge(`l${layer}n${src}`, `l${layer+1}n${tgt}`);
        }
        // for(let tgt = 0; tgt < graph.nodesPerLayer[layer+1]; ++tgt){
        //     graph.addEdge(`l${layer}n${src}`, `l${layer+1}n${tgt}`);
        // }
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
//#endregion


imageGroup.position.copy(graph.position);
imageGroup.rotation.copy(graph.rotation);
for(i = 0; i < imageLayer1.length; ++i){
    imageLayer1[i] = new Network.ImageSquare(getImageSrc(i));
    imageLayer1[i].position.copy(graph.layout[0][i].position.threeVec());
    imageLayer1[i].scale.set(3,3,2);
    imageLayer1[i].rotation.set(0,0,Math.PI/2);
    imageGroup.add(imageLayer1[i]);
}

scene.add(imageGroup);





camera.position.set(0,0,200);

const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.screenSpacePanning = true;

async function animate(){
    requestAnimationFrame(animate);

    renderer.render(scene, camera);
    controls.update();
    // console.log(camera.local);
}
animate();

//#endregion

//#region selection buffer
const w = window.innerHeight;
const h = cv.clientWidth;
let pickingTexture = new THREE.WebGLRenderTarget(renderer.getSize().width, renderer.getSize().height);
// pickingTexture.texture.minFilter = THREE.LinearFilter;
let canvas = document.querySelector('canvas');

canvas.addEventListener('dblclick', function(e){
    pick(e);
});

function pick(event){
    //Setup and render graph using picking material
    let _savedVis = renderGraph.nodeVisFunction;
    renderGraph.nodeVisFunction = function(node){
        return {color: node.color, width: node.data1 ? 3.2 : 1};
    };
    renderGraph.prepareForPicking();
    pickingScene.add(renderGraph);
    renderer.render(pickingScene, camera, pickingTexture);
    renderGraph.revertToNormal();
    renderGraph.nodeVisFunction = _savedVis;
    renderGraph.updateVis();
    scene.add(renderGraph);

    //get id and display info for selected node / remove info if blank
    let pixelBuffer = new Uint8Array(4);
    renderer.readRenderTargetPixels(pickingTexture, event.clientX, pickingTexture.height - event.clientY, 1, 1, pixelBuffer);
    let id = (pixelBuffer[0]<<16)|(pixelBuffer[1]<<8)|(pixelBuffer[2]);
    if(id){
        currentlySelected = graph.nodes[id-1];
        setGUI(currentlySelected);
        console.log(id, pixelBuffer);
        // console.log(graph.nodes[id-1], graph.getConnectedReverse(graph.nodes[id-1]));
    }
    else{
        renderGraph = graph;
        scene.remove(graph2);
        scene.add(graph);
        setGUI();
    }
}
//#endregion

//#region datGUI
function setGUI(node){
    console.log(node);
    for(let pop of GUIOptions){
        GUI.remove(pop);
    }
    GUIOptions = [];
    if(node){
        GUIOptions.push(GUI.add(node, 'name'));
        GUIOptions.push(GUI.add(window, 'displayAffectedNodes'));
        GUIOptions.push(GUI.add(window, 'displayAffectingNodes'));
        GUIOptions.push(GUI.add(window, 'displayConnectedNodes'));
        GUIOptions.push(GUI.add(window, 'resetDisplay'));
    }
    else{
        GUIOptions.push(GUI.add(window, 'minimizeCrossing'));
    }
}

function displayAffectedNodes(){
    let ng = graph.getConnected(currentlySelected);
    graph2.nodes = ng.nodes;
    graph2.edges = ng.edges;
    graph2.setEdgeGeom();
    graph2.setNodeGeom();

    renderGraph = graph2;
    scene.remove(graph);
    scene.add(graph2);
}

function displayAffectingNodes(){
    let ng = graph.getConnectedReverse(currentlySelected);
    graph2.nodes = ng.nodes;
    graph2.edges = ng.edges;
    graph2.setEdgeGeom();
    graph2.setNodeGeom();

    renderGraph = graph2;
    scene.remove(graph);
    scene.add(graph2);
}

function displayConnectedNodes(){
    let ng = graph.getConnected(currentlySelected);
    let ng2 = graph.getConnectedReverse(currentlySelected);
    graph2.nodes = ng.nodes.concat(ng2.nodes);
    graph2.edges = ng.edges.concat(ng2.edges);
    graph2.setEdgeGeom();
    graph2.setNodeGeom();

    renderGraph = graph2;
    scene.remove(graph);
    scene.add(graph2);
}

function resetDisplay(){
    renderGraph = graph;
    scene.remove(graph2);
    scene.add(graph);
}

function minimizeCrossing(){
    graph.oscm();
    graph.updateNodeGeom();
    graph.updateEdgeGeom();
}
//#endregion

//#region Material modification

document.getElementById("LINE_CLIP_SPACE").addEventListener('click', () => {
    let element = document.getElementById("LINE_CLIP_SPACE");
    let active = element.classList.contains('selected');
    if(active){
        element.classList.remove('selected');
        Network.Materials.lineMaterial.defines.CLIP_SPACE = false;
    }
    else{
        element.classList.add('selected');
        Network.Materials.lineMaterial.defines.CLIP_SPACE = true;
    }
    graph.edgeObject.material.needsUpdate = true;
});

document.getElementById("LINE_FAKE_DEPTH").addEventListener('click', () => {
    let element = document.getElementById("LINE_FAKE_DEPTH");
    let active = element.classList.contains('selected');
    if(active){
        element.classList.remove('selected');
        Network.Materials.lineMaterial.defines.FAKE_DEPTH = false;
    }
    else{
        element.classList.add('selected');
        Network.Materials.lineMaterial.defines.FAKE_DEPTH = true;
    }
    graph.edgeObject.material.needsUpdate = true;
});

document.getElementById("NODE_FAKE_DEPTH").addEventListener('click', () => {
    let element = document.getElementById("NODE_FAKE_DEPTH");
    let active = element.classList.contains('selected');
    if(active){
        element.classList.remove('selected');
        Network.Materials.sphereMaterial.defines.FAKE_DEPTH = false;
    }
    else{
        element.classList.add('selected');
        Network.Materials.sphereMaterial.defines.FAKE_DEPTH = true;
    }
    graph.nodesObject.material.needsUpdate = true;
    graph2.nodesObject.material.needsUpdate = true;
});

//#endregion