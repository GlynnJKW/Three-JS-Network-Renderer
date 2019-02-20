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
            "radius": {value: 100},
            "near": {value: 0.1},
            "far": {value: 1000}
        },
        "extensions": {
            fragDepth: true
        },
        "defines": {
            FAKE_DEPTH: true
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
            "scale": {value: 0.1},
            "near": {value: 0.1},
            "far": {value: 1000}
        },
        "extensions": {
            fragDepth: true
        },
        "defines": {
            FAKE_DEPTH: true,
            CLIP_SPACE: false
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
        },
        "defines": {
            FAKE_DEPTH: true
        }
    }
);

export { sphereMaterial, lineMaterial, pickingSphereMaterial }