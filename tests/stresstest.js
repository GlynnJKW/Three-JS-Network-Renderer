//#region setup
let displayEdges = true;
let displayNodes = true;
const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer();

const cv = document.getElementById('canvas')
let camera = new THREE.PerspectiveCamera( 75, cv.clientWidth / window.innerHeight, 0.1, 1000000 );
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

let len = 1;
let graph = new Network.EfficientGraph();
graph.nodeVisFunction = function(node){
    return {color: node.color, width: 100}
}
scene.add(new THREE.Mesh(new THREE.CubeGeometry(100,100,100), new THREE.MeshBasicMaterial()));
scene.add(new THREE.GridHelper(10));

graph.addNode({name: `n0`, position: new Network.Vec3(0,0,100), edges: []});
for(let i = 1; i < len; ++i){
    let node = new Network.EfficientNode({name: `n${i}`, position: new Network.Vec3(0,0,0)});
    graph.addNode(node);
    graph.addEdge(`n${i-1}`, `n${i}`);
}

for(let e = 0; e < graph.edges.length; ++e){
    let intensity = (Math.random());
    graph.edges[e].intensity = intensity;
}

for(let n = 0; n < graph.nodes.length; ++n){
    let intensity = Math.random();
    let col = new Network.Vec3(1, 0.65, 0).multiplyScalar(1 - intensity).add(new Network.Vec3(0, 0, 1).multiplyScalar(intensity));
    graph.nodes[n].color = col;
}

// graph.AddFidget();
graph.setEdgeGeom();
graph.setNodeGeom();
if(!displayEdges){
    graph.remove(graph.edgeObject.mesh);
}
if(!displayNodes){
    graph.remove(graph.nodesObject.mesh);
}
scene.add(graph);

camera.position.z = 50;

const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.screenSpacePanning = true;

//#endregion

//#region GUI
window["Nodes to add"] = 100000;
window["Add nodes"] = function(){
    addmore(window["Nodes to add"]);
}


function addmore(num){
    for(let i = 0; i < num; ++i){
        const n = len + i;

        let node = new Network.EfficientNode({name: `n${n}`, position: new Network.Vec3(0,0,0)});
        graph.addNode(node);

        let intensity = Math.random();
        let col = new Network.Vec3(1, 0.65, 0).multiplyScalar(1 - intensity).add(new Network.Vec3(0, 0, 1).multiplyScalar(intensity));
        graph.nodes[n].color = col;  

        graph.addEdge(`n${n-1}`, `n${n}`);
        graph.edges[graph.edges.length-1].intensity = Math.random();
    }
    len += num;
    graph.AddFidget();
    graph.setEdgeGeom();
    graph.setNodeGeom();
    if(!displayEdges){
        graph.remove(graph.edgeObject.mesh);
    }
    if(!displayNodes){
        graph.remove(graph.nodesObject.mesh);
    }        
    return len;
}

window.graph = graph;

const GUI = new dat.GUI();
GUI.width = window.innerWidth / 4;
let GUIOptions = [];
GUIOptions.push(GUI.add(window, 'Nodes to add'));
GUIOptions.push(GUI.add(window, 'Add nodes'));
//#endregion


function animate(){
    requestAnimationFrame(animate);
    
    controls.update();
    renderer.render(scene, camera);
}
animate();


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
});

document.getElementById("DISPLAY_NODES").addEventListener('click', () => {
    let element = document.getElementById("DISPLAY_NODES");
    let active = element.classList.contains('selected');
    if(active){
        graph.remove(graph.nodesObject.mesh);
        element.classList.remove('selected');
    }
    else{
        element.classList.add('selected');
        graph.add(graph.nodesObject.mesh);
    }
    displayNodes = !active;
});

document.getElementById("DISPLAY_EDGES").addEventListener('click', () => {
    let element = document.getElementById("DISPLAY_EDGES");
    let active = element.classList.contains('selected');
    if(active){
        graph.remove(graph.edgeObject.mesh);
        element.classList.remove('selected');
    }
    else{
        element.classList.add('selected');
        graph.add(graph.edgeObject.mesh);
    }
    displayNodes = !active;
});

//#endregion