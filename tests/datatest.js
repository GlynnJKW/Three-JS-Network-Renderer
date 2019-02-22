//#region setup
let displayEdges = true;
let displayNodes = true;
let len = 200000;
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


for(let i = 0; i < len; ++i){
    let node = new Network.EfficientNode({name: `n${i}`, position: new Network.Vec3(0,0,0)});
    node.data1 = Math.random();
    node.data2 = Math.random();
    graph.addNode(node);
    if(i != 0)
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


function animate(){
    requestAnimationFrame(animate);
    
    controls.update();
    renderer.render(scene, camera);
}
animate();

//#region visoptions
let _edgeMap = new Map();
let EdgeVisOptions = {
    func: function(edge){
        // Set edgemap to true so that answers from connected nodes aren't polluted by previous answers
        _edgeMap.set(edge, true);
        let c = new Network.Vec3(0,0,0);

        if(this.connected_only && 
            (!graph.nodeVisFunction(edge.source).width ||
            !graph.nodeVisFunction(edge.target).width)
        ){
            _edgeMap.set(edge, false);
            return {color: c, width: 0};
        }

        let i = edge.intensity;
        let ai = Math.abs(i * 2 - 1);
        if(i == null || 
            ai < this.intensity.min || ai > this.intensity.max ||
            (i > 0.5 && this.intensity.sign == -1) ||
            (i < 0.5 && this.intensity.sign == 1)
        ){
            _edgeMap.set(edge, false);
            return {color: c, width: 0}
        }

        let w = Math.abs(0.5 - i) * 2;
        c = new Network.Vec3(1 - i, i, 0);
        _edgeMap.set(edge, w != 0);
        return {color: c, width: w}
    },
    intensity: {
        min: 0,
        max: 1,
        sign: 0
    },
    connected_only: false
};

let NodeVisOptions = {
    func: function(node){
        let c = node.color;
        let w = node.data1;
        if(!c){ c = new Vec3(1,1,1); }

        if(this.connected_only){
            let edges = node.edges.concat(node.parentEdges).filter(edge => {
                return _edgeMap.get(edge);
            });
            if(edges.length == 0){
                w = 0;
            }    
        }
        if(w > this.size.max || w < this.size.min){
            w = 0;
        }
        return {color: c, width: w}
    },
    size: {
        min: 0,
        max: 1
    },
    connected_only: false
};

graph.edgeVisFunction = EdgeVisOptions.func.bind(EdgeVisOptions);
graph.nodeVisFunction = NodeVisOptions.func.bind(NodeVisOptions);
graph.updateVis();
//#endregion

//#region jqueryGUI
$( function() {
    $( "#size-range" ).slider({
        range: true,
        min: 0,
        max: 1,
        values: [ 0, 1 ],
        step: 0.01,
        slide: function( event, ui ) {
            $( "#size-amount" ).val( ui.values[ 0 ] + " - " + ui.values[ 1 ] );
            NodeVisOptions.size.min = ui.values[0];
            NodeVisOptions.size.max = ui.values[1];
            graph.updateVisDelayed(300);
        }
    });
    $( "#size-amount" ).val( $( "#size-range" ).slider( "values", 0 ) + " - " + $( "#size-range" ).slider( "values", 1 ) );
} );

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
            graph.updateVisDelayed(300);
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
            graph.updateVisDelayed(300);
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
    displayEdges = !active;
});

document.getElementById("CONNECTED_NODES_ONLY").addEventListener('click', () => {
    let element = document.getElementById("CONNECTED_NODES_ONLY");
    let active = element.classList.contains('selected');
    if(active){
        NodeVisOptions.connected_only = false;
        element.classList.remove('selected');
    }
    else{
        NodeVisOptions.connected_only = true;
        element.classList.add('selected');
    }
    graph.updateVisDelayed(100);
});

document.getElementById("CONNECTED_EDGES_ONLY").addEventListener('click', () => {
    let element = document.getElementById("CONNECTED_EDGES_ONLY");
    let active = element.classList.contains('selected');
    if(active){
        EdgeVisOptions.connected_only = false;
        element.classList.remove('selected');
    }
    else{
        EdgeVisOptions.connected_only = true;
        element.classList.add('selected');
    }
    graph.updateVisDelayed(100);
});

//#endregion

