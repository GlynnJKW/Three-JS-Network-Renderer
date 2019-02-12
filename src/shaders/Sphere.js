const vertex = 
    `
    varying vec2 fraguv;

    uniform vec2 screen;
    uniform float radius;

    varying vec4 test;


    float trueDepth(float d){
        float zn = 0.1;
        float zf = 1000.0;

        float d_e = 2.0 * zn * zf / (zf + zn - d * (zf - zn));
        return d_e;
    }

    float fakeDepth(float d){
        float A = projectionMatrix[2].z;
        float B = projectionMatrix[3].z;
        return 0.5 * (-A*d + B) / d + 0.5;
    }

    void main(){
        vec4 clipPos = projectionMatrix * (modelViewMatrix * vec4( position, 1.0 ) + vec4(0,0,0.1,0));
        vec2 size = vec2(radius) / screen.xy;
        float screenz = (clipPos.z/clipPos.w + 1.0)/2.0;
        
        float zfactor = (1.0 - pow(screenz, 0.5)) * 100.0 + 0.01;

        size *= zfactor;

        fraguv = uv;//* 2.0 - vec2(1.0,1.0);


        vec4 fragpos = clipPos + vec4((clipPos.ww * fraguv.xy) * size, 0, 0);

        gl_Position = fragpos;
#ifdef USE_COLOR
        test.rgb = color;
#else
        test.rgb = vec3(1,1,1);
#endif
    }
    `;

const fragment = 
    `
    varying vec2 fraguv;
    varying vec4 test;

    void main(){
        float rad = fraguv.x * fraguv.x + fraguv.y * fraguv.y;
        if(rad > 1.0){
            discard;
        }
        gl_FragColor = vec4(test.rgb * pow((1.0 - rad), 0.5), 1);
        // really bad depth approx for now
        gl_FragDepthEXT = gl_FragCoord.z * ( 1.0 - (1.0 - rad) * 0.01);
    }
    `;

export { vertex, fragment }