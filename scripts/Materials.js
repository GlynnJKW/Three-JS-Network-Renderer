const sphereMaterial = new THREE.ShaderMaterial(
    {
        "vertexShader": document.getElementById('sphereVert').textContent,
        "fragmentShader": document.getElementById('sphereFrag').textContent,
        "side": THREE.DoubleSide,
        "vertexColors": THREE.VertexColors,
        "uniforms": {
            "screen": {value: new THREE.Vector2(1920, 1080)},
            "radius": {value: 100}
        }
    }
);

const lineMaterial = new THREE.ShaderMaterial(
    {
        "vertexShader": document.getElementById('lineVert').textContent,
        "fragmentShader": document.getElementById('lineFrag').textContent,
        "side": THREE.DoubleSide,
        "transparent": true,
        "uniforms": {
            "screen": {value: new THREE.Vector2(1920, 1080)},
            "color0": {value: new THREE.Vector3(1, 0.65, 0)},
            "color1": {value: new THREE.Vector3(0,0,1)}
        }
    }
);

const pickingSphereMaterial = new THREE.ShaderMaterial(
    {
        "vertexShader": document.getElementById('pickingSphereVert').textContent,
        "fragmentShader": document.getElementById('pickingSphereFrag').textContent,
        "side": THREE.DoubleSide,
        "vertexColors": THREE.VertexColors,
        "uniforms": {
            "screen": {value: new THREE.Vector2(1920, 1080)},
            "radius": {value: 100}
        }
    }
);

export { sphereMaterial, lineMaterial, pickingSphereMaterial }