const vertex = 
    `
    uniform vec3 color0;
    uniform vec3 color1;
    uniform vec2 screen;
    uniform float scale;
#ifdef FAKE_DEPTH
    uniform float near;
    uniform float far;
#endif

    attribute float intensity;
    attribute vec3 direction;

    varying vec4 col;
    varying float y;
    varying float width;

    void main(){
        width = (abs(0.5 - intensity) * 2.0);
#ifdef USE_COLOR
        col = vec4(color, 1);
#else
        vec3 albedo;
        if(intensity > 0.5){
            albedo = color1;
        }
        else{
            albedo = color0;
        }
        col = vec4(albedo, 1);
#endif

#ifdef CLIP_SPACE
        vec4 clipPos = projectionMatrix * (modelViewMatrix * vec4( position, 1.0 ) + vec4(0,0,0.1,0));
        float screenz = (clipPos.z/clipPos.w + 1.0)/2.0;
        float zfactor = (1.0 - pow(screenz, 0.5)) * 100.0 + 0.01;

        float size = width * zfactor * scale * 200.0;
        y = uv.y;

        vec4 clipDir = projectionMatrix * (modelViewMatrix * vec4( direction, 0.0 ));
        vec2 xyNormal = normalize(vec2(-clipDir.y, clipDir.x));
        vec4 fragpos = clipPos + vec4((clipPos.ww * xyNormal / screen.xy * uv.y) * size, 0, 0);

        gl_Position = fragpos;
#else
        vec4 worldPos = modelMatrix * vec4(position, 1.0);
        vec3 viewDir = normalize(worldPos.xyz - cameraPosition);
        vec3 d = normalize((modelMatrix * vec4(direction, 0.0)).xyz);

        vec3 u = normalize(cross(d, viewDir));

        worldPos += vec4(u, 0.0) * uv.y * scale * width;

        y = uv.y;

        gl_Position = projectionMatrix * viewMatrix * worldPos;
#endif
    }
    `;

const fragment = 
    `
    varying vec4 col;
    varying float y;

#ifdef FAKE_DEPTH
    varying float width;
    uniform highp float near;
    uniform highp float far;
    uniform highp float scale;
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
        float rad = y * y;
        if(rad > 1.0){
            discard;
        }
        gl_FragColor = vec4(col.rgb * pow(1.0 - rad, 0.5), 1);

#ifdef FAKE_DEPTH
        float d = trueDepth(gl_FragCoord.z);
        float z = sqrt(1.0 - rad); // y^2 + z^2 = 1 > z = sqrt(1 - y^2)
        d = max(d - z * scale * width, near * 1.01); // make sure to not go negative (offscreen) depth
        float fd = fakeDepth(d);
        gl_FragDepthEXT = fd; 
#endif
    }
    `;

export { vertex, fragment }