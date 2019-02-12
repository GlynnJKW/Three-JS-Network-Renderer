import { Sphere, Line, PickingSphere } from './shaders';
import { ShaderMaterial, Vector2, Vector3, DoubleSide, VertexColors } from 'three';

const sphereMaterial = new ShaderMaterial(
    {
        "vertexShader": Sphere.vertex,
        "fragmentShader": Sphere.fragment,
        "side": DoubleSide,
        "vertexColors": VertexColors,
        "uniforms": {
            "screen": {value: new Vector2(1920, 1080)},
            "radius": {value: 100}
        }
    }
);

const lineMaterial = new ShaderMaterial(
    {
        "vertexShader": Line.vertex,
        "fragmentShader": Line.fragment,
        "side": DoubleSide,
        "transparent": true,
        "uniforms": {
            "screen": {value: new Vector2(1920, 1080)},
            "color0": {value: new Vector3(1, 0.65, 0)},
            "color1": {value: new Vector3(0,0,1)},
            "scale": {value: 10.0}
        }
    }
);

const pickingSphereMaterial = new ShaderMaterial(
    {
        "vertexShader": PickingSphere.vertex,
        "fragmentShader": PickingSphere.fragment,
        "side": DoubleSide,
        "vertexColors": VertexColors,
        "uniforms": {
            "screen": {value: new Vector2(1920, 1080)},
            "radius": {value: 100}
        }
    }
);

export { sphereMaterial, lineMaterial, pickingSphereMaterial }