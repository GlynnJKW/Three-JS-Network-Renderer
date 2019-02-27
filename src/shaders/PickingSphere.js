/**
 * Deprecated. Use SELECTION_BUFFER preprocessor in sphere shader instead
 */

const vertex = 
    `
    varying vec2 fraguv;
    varying vec3 id;

    attribute vec3 colorid;

    uniform vec2 screen;
    uniform float radius;

    void main(){
        vec4 clipPos = projectionMatrix * (modelViewMatrix * vec4( position, 1.0 ) + vec4(0,0,0.1,0));
        vec2 size = vec2(radius) / screen.xy;
        float screenz = (clipPos.z/clipPos.w + 1.0)/2.0;
        
        float zfactor = (1.0 - pow(screenz, 0.5)) * 100.0 + 0.01;

        size *= zfactor;

        fraguv = uv;//* 2.0 - vec2(1.0,1.0);

        id = colorid;

        vec4 fragpos = clipPos + vec4((clipPos.ww * fraguv.xy) * size, 0, 0);

        gl_Position = fragpos;
    }
    `;

const fragment = 
    `
    varying vec2 fraguv;
    varying vec3 id;

    void main(){
        float rad = fraguv.x * fraguv.x + fraguv.y * fraguv.y;
        if(rad > 1.0){
            discard;
        }
        gl_FragColor = vec4(id, 1);
    }
    `;

export { vertex, fragment }