import { Node, Line } from './shaders';
import { ShaderMaterial, Vector2, Vector3, DoubleSide, VertexColors } from 'three';

const sphereMaterial = new ShaderMaterial(
    {
        "vertexShader": Node.vertex,
        "fragmentShader": Node.fragment,
        "side": DoubleSide,
        "vertexColors": VertexColors,
        "transparent": true,
        "uniforms": {
            "screen": {value: new Vector2(1920, 1080)},
            "radius": {value: 1},
            "near": {value: 0.1},
            "far": {value: 1000}
        },
        "extensions": {
            fragDepth: true
        },
        "defines": {
            FAKE_DEPTH: true,
            SPHERE: true
        }
    }
);

const lineMaterial = new ShaderMaterial(
    {
        "vertexShader": Line.vertex,
        "fragmentShader": Line.fragment,
        "side": DoubleSide,
        "vertexColors": VertexColors,
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

export { sphereMaterial, lineMaterial }