const vertex = 
    `
    uniform vec3 color0;
    uniform vec3 color1;
    uniform vec2 screen;

    attribute float intensity;
    attribute vec3 direction;

    varying vec4 col;
    varying float y;

    highp mat3 transpose(in highp mat3 inMatrix) {
        highp vec3 i0 = inMatrix[0];
        highp vec3 i1 = inMatrix[1];
        highp vec3 i2 = inMatrix[2];
    
        highp mat3 outMatrix = mat3(
                        vec3(i0.x, i1.x, i2.x),
                        vec3(i0.y, i1.y, i2.y),
                        vec3(i0.z, i1.z, i2.z)
                        );
    
        return outMatrix;
    }

    void main(){
        float alpha = sqrt(abs(0.5 - intensity) * 2.0);
        vec3 albedo;
        if(intensity > 0.5){
            albedo = color1 * alpha;
        }
        else{
            albedo = color0 * alpha;
        }
        col = vec4(albedo, alpha);


        vec3 worldPos = (modelMatrix * vec4(position, 1.0)).xyz;

        vec3 viewDir = normalize(worldPos - cameraPosition);
        vec3 d = normalize(modelMatrix * vec4(direction, 0.0)).xyz;
        vec3 u = normalize(cross(d, viewDir));

        worldPos += u * uv.y * 0.1;

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
        gl_FragColor = vec4(col.rgb * pow(1.0 - rad*2.0, 0.5), col.a);
    }
    `;

export { vertex, fragment }