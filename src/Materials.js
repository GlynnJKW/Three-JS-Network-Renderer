<<<<<<< HEAD
import { Node, Line } from './shaders';
=======
import { Sphere, Line } from './shaders';
>>>>>>> 7f3dc12d4437749b57dac1f1c44350a9d686daa8
import { ShaderMaterial, Vector2, Vector3, DoubleSide, VertexColors } from 'three';

const sphereMaterial = new ShaderMaterial(
    {
<<<<<<< HEAD
        "vertexShader": Node.vertex,
        "fragmentShader": Node.fragment,
        "side": DoubleSide,
        "vertexColors": VertexColors,
        "transparent": true,
=======
        "vertexShader": Sphere.vertex,
        "fragmentShader": Sphere.fragment,
        "side": DoubleSide,
        "vertexColors": VertexColors,
>>>>>>> 7f3dc12d4437749b57dac1f1c44350a9d686daa8
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
<<<<<<< HEAD
            SPHERE: true
=======
>>>>>>> 7f3dc12d4437749b57dac1f1c44350a9d686daa8
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