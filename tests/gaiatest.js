//#region setup
let displayEdges = true;
let displayNodes = true;
const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer();

let camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 100000 );
Network.Materials.sphereMaterial.uniforms.far.value = 100000;
Network.Materials.lineMaterial.uniforms.far.value = 100000;
document.body.appendChild(renderer.domElement);
//Done twice to prevent mismatch
renderer.setSize(window.innerWidth, window.innerHeight);

window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    Network.Materials.sphereMaterial.uniforms.screen.value.set(window.innerWidth, window.innerHeight);
    Network.Materials.lineMaterial.uniforms.screen.value.set(window.innerWidth, window.innerHeight);
    pickingTexture = new THREE.WebGLRenderTarget(renderer.getSize().width, renderer.getSize().height);
});
Network.Materials.sphereMaterial.uniforms.screen.value.set(window.innerWidth, window.innerHeight);
Network.Materials.lineMaterial.uniforms.screen.value.set(window.innerWidth, window.innerHeight);

let graph = new Network.EfficientGraph();
$.ajax({
    dataType: "json",
    url: "../data/brightest1M.json",
}).done((stars) => {
    // console.log(JSON.stringify(stars));
    for(let i = 0, len = stars.length; i < len; ++i){
        let star = stars[i];
        let node = new Network.EfficientNode();
        for(let property in star){
            node[property] = star[property];
        }
        node.position = new Network.Vec3(star.position.x, star.position.y, star.position.z);
        graph.addNode(node);
    }
    console.log("done");

    graph.setNodeGeom();
    graph.scale.set(1,1,1);
    scene.add(graph);

    graph.nodesObject.material.defines.SPHERE = false;
    graph.nodesObject.material.defines.STAR = true;
    graph.nodesObject.material.needsUpdate = true;
    graph.nodesObject.material.depthWrite = false;
});

let sunBrightness = 100;
graph.nodeVisFunction = function(node){
    let l = 1; // Math.sqrt(node.lum_val) / 10;
    let c = new Network.Vec3(l, l, l);
    let appmag = parseFloat(node.phot_g_mean_mag);
    // console.log(appmag);
    let absmag = appmag + 5 * (Math.log10(node.parallax / 1000 + 1));
    // console.log(absmag);
    let magrat = Math.pow(100, (4.83 - absmag)/5.0); // 4.83 is approx abs magnitude of sun
    return { color: c, width: sunBrightness * magrat }
}

camera.position.z = 50;

const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.screenSpacePanning = true;

//#endregion

//#rendering


function animate(){
    requestAnimationFrame(animate);
    
    controls.update();
    renderer.render(scene, camera);
}
animate();