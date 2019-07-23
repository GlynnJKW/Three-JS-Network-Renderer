const vertex = 
    `
    attribute float width;

    varying vec2 fraguv;
    varying vec4 test;
    varying float scale;
    varying float isDisplayed;


    uniform vec2 screen;
    uniform float radius;
    uniform float near;
    uniform float far;

    void main(){
        isDisplayed = width;
        scale = radius * 0.5 * width;
        if(width != 0.0){
            vec4 mvPos = modelViewMatrix * vec4( position, 1.0 );
            #ifdef STAR
                float camDist = length(mvPos.xyz);
                //scale *= 10.0 / (camDist + 0.01);
            #endif
            mvPos += vec4(uv.xy * scale, 0, 0);
            gl_Position = projectionMatrix * mvPos;
            fraguv = uv;
            #ifdef USE_COLOR
                test.rgb = color;
            #else
                test.rgb = vec3(1,1,1);
            #endif
        }
    }
    `;

const fragment = 
    `
    varying vec2 fraguv;
    varying vec4 test;
    varying float isDisplayed;
    varying float scale;

#ifdef FAKE_DEPTH
    uniform highp float near;
    uniform highp float far;
    uniform highp mat4 projectionMatrix;

    float trueDepth(float d){
        return 2.0 * near * far / (far + near - d * (far - near));
    }

    float fakeDepth(float d){
        float A = projectionMatrix[2].z;
        float B = projectionMatrix[3].z;
        return 0.5 * (-A*d + B) / d + 0.5;
    }
#endif


    void main(){
        if(isDisplayed == 0.0){
            discard;
        }
        #ifdef SPHERE
            float rad = fraguv.x * fraguv.x + fraguv.y * fraguv.y;
            if(rad > 1.0){
                discard;
            }
            
            #ifdef SELECTION_BUFFER
                gl_FragColor = vec4(test.rgb, 1);
            #else
                gl_FragColor = vec4(test.rgb, 1);
            #endif

            #ifdef FAKE_DEPTH
                float d = trueDepth(gl_FragCoord.z);
                float z = sqrt(1.0 - rad); // y^2 + z^2 = 1 > z = sqrt(1 - y^2)
                d = max(d - z * scale, near * 1.01);
                float fd = fakeDepth(d);
                gl_FragDepthEXT = fd; 
            #endif   
        #endif

        #ifdef STAR
            vec2 val;
            val.x = 1.0 / abs(fraguv.x * scale * 25.0 + 0.01);
            val.y = 1.0 / abs(fraguv.y * scale * 25.0 + 0.01);
            // float i = 1.0 - min(abs(fraguv.x) + abs(fraguv.y), 1.0);
            float a = length(val) * (1.0 - length(fraguv));
            if(a < 0.01){
                discard;
            }
            gl_FragColor = vec4(test.rgb, a);
        #endif
    }
    `;

export { vertex, fragment }