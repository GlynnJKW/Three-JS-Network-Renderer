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

    
    mat4 rotationMatrix(vec3 axis, float angle)
    {
        axis = normalize(axis);
        float s = sin(angle);
        float c = cos(angle);
        float oc = 1.0 - c;
        
        return mat4(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,
                    oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,
                    oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,
                    0.0,                                0.0,                                0.0,                                1.0);
    }

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

        vec3 viewDir = normalize(worldPos.xyz - cameraPosition);
        vec3 d = normalize((modelMatrix * vec4(direction, 0.0)).xyz);
        //mat4 rot = rotationMatrix(d, 1.5708); //rotate 90 degrees
        float dot = dot(d, viewDir); //dot = a*b*cos(theta) = cos(theta)
        vec3 nondot = normalize(viewDir - (d * dot)); //part of viewDir that is orthogonal to direction, normalized

        col = vec4(viewDir, 1); //(rot * vec4(viewDir, 0)).xyz;
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