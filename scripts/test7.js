const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer({
    antialias: true
});
scene.background = new THREE.Color(0,0,0);
var raycaster = new THREE.Raycaster();
raycaster.linePrecision = 0.1;
var mouse = new THREE.Vector2();
let camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
renderer.setSize(window.innerWidth, window.innerHeight);
sphereMaterial.uniforms.screen.value.set(window.innerWidth, window.innerHeight);
lineMaterial.uniforms.screen.value.set(window.innerWidth, window.innerHeight);
window.globalCamera = camera;
document.body.appendChild(renderer.domElement);












const nodes = 10;
const layers = 2;
const width = 10;
const height = 1;

var graph = new EfficientGraph();
graph.position.set(-(nodes-1)*height/2, -(layers-1)*width/2, 0);
graph.scale.set(height, width, 1);
let oldlayout = [];

//add nodes
for(let layer = 0; layer < layers; ++layer){
    oldlayout[layer] = [];
    for(let n = 0; n < nodes; ++n){
        let node = new EfficientNode({name: `l${layer}n${n}`, position: new Vec3(n, layer, 0)})
        graph.addNode(node);
        oldlayout[layer].push(node);
    }
    for(let e = 0; e < nodes * 1.5; ++e){
        let src = Math.floor(Math.random() * nodes);
        let tgt = Math.floor(Math.random() * nodes);
        graph.addEdge(`l${layer-1}n${src}`, `l${layer}n${tgt}`);
    }
}



for(let e = 0; e < graph.edges.length; ++e){
    let intensity = (Math.random());
    graph.edges[e].intensity = intensity;
}

for(let n = 0; n < graph.nodes.length; ++n){
    let intensity = Math.random();
    let str = Math.abs(intensity - 0.5) * 2;
    let col = new Vec3(1, 0.65, 0).multiplyScalar(1 - intensity).add(new Vec3(0, 0, 1).multiplyScalar(intensity));
    graph.nodes[n].color = col;
}

graph.setEdgeGeom();

graph.setNodeGeom();


scene.add(graph);






function uncross(){
    function findSlot(node, layout, location){
        if(location == -1){
            layout.unshift(node);
            // console.log(layout.map(n => n.name), location);
        }
        else{
            if(layout[location]){
                let parity1 = layout[location].edges.length;// % 2;
                let parity2 = node.edges.length;// % 2;
                if(parity1 != parity2){
                    if(parity2 > parity1){
                        findSlot(node, layout, location - 1);
                    }
                    else{
                        let newNode = layout[location];
                        layout[location] = node;
                        findSlot(newNode, layout, location - 1);
                    }
                }
                else{
                    let newNode = layout[location];
                    layout[location] = node;
                    findSlot(newNode, layout, location - 1);
                }
            }
            else{
                layout[location] = node;
                // console.log(layout.map(n => n.name), location);    
            }    
        }
    }



    let newlayout = [];
    newlayout[layers-1] = oldlayout[layers-1]
    
    for(let layer = layers - 2; layer >= 0; --layer){
        let layerlayout = [];
        for(let n = 0; n < nodes; ++n){
            let oldnode = oldlayout[layer][n];
            if(!oldnode.edges.length){
                // console.log("no edges", n, oldnode.position.y);
                //findSlot(oldnode, layerlayout, oldnode.position.y);
                layerlayout[layerlayout.length > 4 ? layerlayout.length : 5] = oldnode;
            }
            else if(oldnode.edges.length == 1){
                // console.log("one edge", n, oldnode.edges[0].target.position.y);
                findSlot(oldnode, layerlayout, oldnode.edges[0].target.position.y);
            }
            else{
                let median = oldnode.edges[Math.round((oldnode.edges.length - 1) / 2)].target.position.y;
                // console.log("multi edges", n, median);
                findSlot(oldnode, layerlayout, median);    
            }
        }
        newlayout[layer] = layerlayout.filter(n => n != null);
        for(let n = 0; n < nodes; ++n){
            newlayout[layer][n].position.set(layer, n, 0);
        }
    }
    console.log(newlayout);

    oldlayout = newlayout;
    
    graph.updateEdgeGeom();
    graph.updateNodeGeom();
}













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