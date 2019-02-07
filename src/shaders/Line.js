const vertex = 
    `
    uniform vec3 color0;
    uniform vec3 color1;
    uniform vec2 screen;
    uniform float scale;

    attribute float intensity;
    attribute vec3 direction;

    varying vec4 col;
    varying float y;


    void main(){
        float width = (abs(0.5 - intensity) * 2.0);
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

        vec4 worldPos = modelMatrix * vec4(position, 1.0);

        vec3 viewDir = worldPos - cameraPosition;
        vec3 d = (modelMatrix * vec4(direction, 0.0)).xyz;
        vec3 u = normalize(cross(d, viewDir));

        worldPos += vec4(u, 0.0) * uv.y * scale * width;

        // vec4 viewPos = viewMatrix * worldPos;
        // viewPos += vec4(0.0, 1.0, 0.0, 0.0) * uv.y * width * 0.01;

        y = uv.y;

        gl_Position = projectionMatrix * viewMatrix * worldPos;
    }
    `;

const fragment = 
    `
    varying vec4 col;
    varying float y;

    void main(){
        float rad = y * y;
        if(rad > 0.5){
            discard;
        }
        gl_FragColor = vec4(col.rgb * pow(1.0 - rad*2.0, 0.5), 1);
    }
    `;

export { vertex, fragment }