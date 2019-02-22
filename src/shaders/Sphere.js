const vertex = 
    `
    varying vec2 fraguv;
    varying vec4 test;

    uniform vec2 screen;
    uniform float radius;
    uniform float near;
    uniform float far;

    attribute float width;
    varying float isDisplayed;

    void main(){
        isDisplayed = width;
        if(width != 0.0){
            vec4 clipPos = projectionMatrix * (modelViewMatrix * vec4( position, 1.0 ) + vec4(0,0,0.1,0));
            vec2 size = vec2(radius * width) / screen.xy;
            float screenz = (clipPos.z/clipPos.w + 1.0)/2.0;
            
            float zfactor = (1.0 - pow(screenz, 0.5)) * 100.0 + 0.01;
    
            size *= zfactor;
    
            fraguv = uv;//* 2.0 - vec2(1.0,1.0);
    
    
            vec4 fragpos = clipPos + vec4((clipPos.ww * fraguv.xy) * size, 0, 0);
    
            gl_Position = fragpos;
        }
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
    varying float isDisplayed;

#ifdef FAKE_DEPTH
    uniform highp float near;
    uniform highp float far;
    uniform highp float radius;
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
        float rad = fraguv.x * fraguv.x + fraguv.y * fraguv.y;
        if(rad > 1.0){
            discard;
        }
        
        #ifdef SELECTION_BUFFER
            gl_FragColor = vec4(test.rgb, 1);
        #else
            gl_FragColor = vec4(test.rgb * pow((1.0 - rad), 0.5), 1);
        #endif

        #ifdef FAKE_DEPTH
            float d = trueDepth(gl_FragCoord.z);
            float z = sqrt(1.0 - rad); // y^2 + z^2 = 1 > z = sqrt(1 - y^2)
            d = max(d - z * (radius / 100.0), near * 1.01);
            float fd = fakeDepth(d);
            gl_FragDepthEXT = fd; 
        #endif    
    }
    `;

export { vertex, fragment }