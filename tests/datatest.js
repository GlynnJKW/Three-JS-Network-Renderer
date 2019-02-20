//#region setup
let displayEdges = true;
let displayNodes = true;
let len = 1000000;
const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer();

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

let graph = new Network.EfficientGraph();


graph.addNode({name: `n0`, position: new Network.Vec3(0,0,0), edges: []});
for(let i = 1; i < len; ++i){
    let node = new Network.EfficientNode({name: `n${i}`, position: new Network.Vec3(0,0,0)});
    node.data1 = Math.random();
    node.data2 = Math.random();
    graph.addNode(node);
    graph.addEdge(`n${i-1}`, `n${i}`);
}

for(let e = 0; e < graph.edges.length; ++e){
    graph.edges[e].intensity = Math.random();
    graph.edges[e].data1 = Math.random();

}

for(let n = 0; n < graph.nodes.length; ++n){
    let intensity = Math.random();
    let col = new Network.Vec3(1, 0.65, 0).multiplyScalar(1 - intensity).add(new Network.Vec3(0, 0, 1).multiplyScalar(intensity));
    graph.nodes[n].color = col;
}

graph.AddFidget();
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

//#region datGUI

const GUI = new dat.GUI();
GUI.width = window.innerWidth / 4;
let GUIOptions = [];
//#endregion


function animate(){
    requestAnimationFrame(animate);
    
    controls.update();
    renderer.render(scene, camera);
}
animate();

//#region jqueryGUI
let NodeVisOptions = {
    func: function(node){
        let c = node.color;
        if(!c){ c = new Vec3(1,1,1); }
        return {color: c}
    }
};

let EdgeVisOptions = {
    func: function(edge){
        let i = edge.intensity;
        let ai = Math.abs(i * 2 - 1);
        let w = 0;
        if(i == null || 
            ai < this.intensity.min || ai > this.intensity.max ||
            (i > 0.5 && this.intensity.sign == -1) ||
            (i < 0.5 && this.intensity.sign == 1)
        ){
        }
        else{
            w = Math.abs(0.5 - i) * 2;
        }
        let c = new Network.Vec3(1 - i, i, 0);
        return {color: c, width: w}
    },
    intensity: {
        min: 0,
        max: 1,
        sign: 0
    }
};

graph.edgeVisFunction = EdgeVisOptions.func.bind(EdgeVisOptions);
graph.nodeVisFunction = NodeVisOptions.func.bind(NodeVisOptions);
$( function() {
    $( "#intensity-range" ).slider({
        range: true,
        min: 0,
        max: 1,
        values: [ 0, 1 ],
        step: 0.01,
        slide: function( event, ui ) {
            $( "#intensity-amount" ).val( ui.values[ 0 ] + " - " + ui.values[ 1 ] );
            EdgeVisOptions.intensity.min = ui.values[0];
            EdgeVisOptions.intensity.max = ui.values[1];
            graph.updateVisDelayed(100);
        }
    });
    $( "#intensity-amount" ).val( $( "#intensity-range" ).slider( "values", 0 ) + " - " + $( "#intensity-range" ).slider( "values", 1 ) );
} );
$( function() {
    $( "#intensity-sign" ).slider({
        min: -1,
        max: 1,
        value: 0,
        slide: function( event, ui ) {
            let type = "";
            switch(ui.value){
                case -1:
                    type = "Negative";
                    break;
                case 0:
                    type = "Any";
                    break;
                case 1:
                    type = "Positive";
                    break;
            }
            $( "#sign-label" ).val( type );
            EdgeVisOptions.intensity.sign = ui.value;
            graph.updateVisDelayed(100);
        }
    });
    $( "#sign-label" ).val("Any");
} );
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

