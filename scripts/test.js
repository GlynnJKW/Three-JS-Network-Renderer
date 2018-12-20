const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer();
var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();


let camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

renderer.setSize(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.domElement);

var node = new GraphNode();

var nodeHolder = new THREE.Group();
nodeHolder.add(node);
scene.add(nodeHolder);

camera.position.z = 5;

const ptLight = new THREE.PointLight(0xffffff, 0.5);

const lightMat = new THREE.MeshBasicMaterial({color: 0xffffff });
var lightMesh = new THREE.Mesh(new THREE.IcosahedronGeometry(1,0), lightMat);

var lightObj = new THREE.Object3D();
lightObj.add(lightMesh);
lightObj.scale.set(0.1, 0.1, 0.1);

ptLight.add(lightObj);

nodeHolder.add(ptLight);

const ambLight = new THREE.AmbientLight(0xffffff, 0.1);
scene.add(ambLight);

const controls = new THREE.OrbitControls(camera);

var intersects = [];


function rayCastNode( event ) {
	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    intersects = raycaster.intersectObject(node, true);
}
window.addEventListener('mousemove', rayCastNode, false);

function animate(){
    requestAnimationFrame(animate);

    let d = new Date();
    let s = d.getTime() / 1000;

    if(intersects[0]){
        node.rotation.set(node.rotation.x, s, node.rotation.z);
        nodeHolder.position.set(node.position.x, Math.sin(s*4)/5, node.position.z);
    }

    ptLight.position.set(Math.cos(s/1.2123752), Math.sin(s/1.4162735867), -Math.cos(s/2.41623416));

    controls.update();
    renderer.render(scene, camera);
}
animate();