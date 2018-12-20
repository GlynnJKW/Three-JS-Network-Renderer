const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer();
var raycaster = new THREE.Raycaster();
raycaster.linePrecision = 0.1;
var mouse = new THREE.Vector2();
let camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
renderer.setSize(window.innerWidth, window.innerHeight);
window.globalCamera = camera;
document.body.appendChild(renderer.domElement);

var graph = new Graph();

$.ajax({type: 'GET',
    url: 'exampledata2.json',
    success: function(data)
    {
        graph.createFromJSON(data);
        graph.AddFidget();
        graph.TickForceLayout();
        scene.add(graph);
    }
});

camera.position.z = 5;

const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.screenSpacePanning = true;

function raycast(mouse, event){
    raycaster.setFromCamera(mouse, camera);
    let intersections = raycaster.intersectObjects(graph.nodes.concat(graph.edgeObject.mesh), true);
    if(intersections[0]){
        let obj = intersections[0].object;
        let node = obj.parent;
        if(node instanceof GraphNode){
            node.clicked(event);
        }
        else{
            if(obj.geometry instanceof THREE.BufferGeometry){
                let graph = node;
                // console.log(intersections[0].index);
                let srcVert = intersections[0].index;
                let tgtVert = srcVert + 1;
                graph.toggleEdgeColor(srcVert, tgtVert);
            }
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
    
    graph.TickForceLayout();
    controls.update();
    renderer.render(scene, camera);
}
animate();