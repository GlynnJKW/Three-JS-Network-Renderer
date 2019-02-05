const vertex = 
    `
    uniform vec3 color0;
    uniform vec3 color1;
    uniform vec2 screen;

    attribute float intensity;
    attribute vec3 direction;

    varying vec4 col;
    varying float y;


    void main(){
#ifdef USE_COLOR
        col = vec4(color, 1);
#else
        float alpha = (abs(0.5 - intensity) * 2.0);
        vec3 albedo;
        if(intensity > 0.5){
            albedo = color1;// * alpha;
        }
        else{
            albedo = color0;// * alpha;
        }
        col = vec4(albedo, alpha);
#endif

        vec3 worldPos = (modelMatrix * vec4(position, 1.0)).xyz;

        vec3 viewDir = normalize(worldPos - cameraPosition);
        vec3 d = normalize(modelMatrix * vec4(direction, 0.0)).xyz;
        vec3 u = normalize(cross(d, viewDir));

        worldPos += u * uv.y * 0.1 * (abs(0.5 - intensity) * 2.0);

        vec4 fragpos = projectionMatrix * viewMatrix * vec4(worldPos, 1.0);

        y = uv.y;

        gl_Position = fragpos;
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