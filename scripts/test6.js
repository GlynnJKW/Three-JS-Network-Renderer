import * as THREE from 'three';
import PickableGraph from './PickableGraph';
import Vec3 from './Vec3';
import OrbitControls from './OrbitControls';
import { sphereMaterial, lineMaterial, pickingSphereMaterial } from './Materials';

const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer({
    antialias: true
});
scene.background = new THREE.Color(0,0,0);

let camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
window.globalCamera = camera;

renderer.setSize(window.innerWidth, window.innerHeight);
sphereMaterial.uniforms.screen.value.set(window.innerWidth, window.innerHeight);
lineMaterial.uniforms.screen.value.set(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);












const nodes = 600;
const layers = 800;
const width = 1;
const height = 1;

var graph = new PickableGraph(layers, nodes);
graph.directed = true;
graph.position.set(-(layers-1)*width/2, -(nodes-1)*height/2, 0);
graph.scale.set(width, height, 1);


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
    let col = new Vec3(1, 0.65, 0).multiplyScalar(1 - intensity).add(new Vec3(0, 0, 1).multiplyScalar(intensity));
    graph.nodes[n].color = col;
}

// graph.setEdgeGeom();

graph.setNodeGeom();


scene.add(graph);


async function spreadIntensity(pause = 0.001){
    for(let i = 0; i < graph.edges.length; ++i){
        graph.shiftIntensity(i, Math.random());
        if(pause) await sleep(pause * 1000);
    }
}

async function spreadByLayer(pause = 0.1, internalTime = 0.5, internalSteps = 5){
    for(let i = 0; i < layers-1; ++i){
        for(let n = 0; n < nodes; ++n){
            let edges = graph.nodes[i * nodes + n].edges;
            for(let e of edges){
                graph.shiftIntensity(e.index, Math.random(), internalTime, internalSteps);
            }
        }
        await sleep(pause * 1000);
    }
}

async function changeIntensity(){
    for(let i = 0; i < graph.edges.length; ++i){
        graph.updateIntensity(i, Math.random());
        if(i % 200000 == 0){
            await sleep(0);
        }
    }
}



// camera.position.z = 50;
camera.position.set(0,0,50);

const controls = new OrbitControls(camera, renderer.domElement);
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
    
    graph.prepareForPicking();
    pickingScene.add(graph);
    renderer.render(pickingScene, camera, pickingTexture);
    graph.revertToNormal();
    scene.add(graph);


    let pixelBuffer = new Uint8Array(4);
    renderer.readRenderTargetPixels(pickingTexture, event.clientX, pickingTexture.height - event.clientY, 1, 1, pixelBuffer);
    let id = (pixelBuffer[0]<<16)|(pixelBuffer[1]<<8)|(pixelBuffer[2]);
    // console.log(event, pixelBuffer, id);
    if(id){
        console.log(id, pixelBuffer);
    }
}