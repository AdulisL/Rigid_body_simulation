#version 330 core

in vec4 position; // raw position in the model coord
in vec3 normal;   // raw normal in the model coord

uniform mat4 modelview; // from model coord to eye coord
uniform mat4 view;      // from world coord to eye coord

// Material parameters
uniform vec4 ambient; // C_a
uniform vec4 diffuse;  // C_d
uniform vec4 specular; // C_s
uniform vec4 emision;  // E
uniform float shininess; // Sigma

// Light source parameters
const int maximal_allowed_lights = 10;
uniform bool enablelighting;
uniform int nlights;  // n-light
uniform vec4 lightpositions[ maximal_allowed_lights ]; // l
uniform vec4 lightcolors[ maximal_allowed_lights ];  // L_j

// Output the frag color
out vec4 fragColor;

// helper function
float max_dot(vec3 n, vec3 l_h){
    float result = max(dot(n,l_h),0);
    return result;
}

vec4 summation(){

    vec4 sum; // (R - E)
    vec3 col1 = modelview[0].xyz; // extracting mat3 from mat4
    vec3 col2 = modelview[1].xyz; // extracting mat3 from mat4
    vec3 col3 = modelview[2].xyz; // extracting mat3 from mat4
    mat3 A = mat3(col1,col2,col3);
    A = inverse(transpose(A)); // A^(-T) 

    /* camera cordinate view */
    vec3 cam_n = normalize(A * normal);
    vec4 cam_p = normalize(modelview * position);
 

    // dirction  to the light
    // vec3 p_d = position.xyz / position.w; // dehomoginized position
    vec3 v = normalize(-position.xyz);  // viewer
    
    for(int j = 0; j < nlights; j++){
        vec4 cam_q = normalize(view * lightpositions[j]); 
        vec4 cam_lc = normalize(view * lightcolors[j]);
        vec3 l = normalize((cam_q.w*cam_p.xyz)-(cam_p.w*cam_q.xyz));
        vec3 h = normalize(v + l[j]);

        sum = (ambient + diffuse*max_dot(cam_n, l)
        + specular*pow(max_dot(cam_n, h), shininess)) * cam_lc[j];
    }
    return sum;
}

void main (void){
    if (!enablelighting){
        // Default normal coloring (you don't need to modify anything here)
        vec3 N = normalize(normal);
        fragColor = vec4(0.5f*N + 0.5f , 1.0f); // R
    } 
    else { 
        // HW3: You will compute the lighting here. 
        
        vec4 sum = vec4(0.0f); // (R - E)
        // extracting mat3 from mat4
        vec3 col1 = vec3(modelview[0][0],modelview[0][1],modelview[0][2]); 
        vec3 col2 = vec3(modelview[1][0],modelview[1][1],modelview[1][2]);;
        vec3 col3 = vec3(modelview[2][0],modelview[2][1],modelview[2][2]);;
        mat3 A = mat3(col1,col2,col3);
        // mat3 A = mat3(modelview);
        A = inverse(transpose(A)); // A^(-T) 

        /* camera cordinate view */
        vec3 n = normalize(A * normal);  // normal on the camera
        vec4 p = modelview * position; // target on camera
    
        // dirction  to the light
        vec3 p_d = (p.xyz / p.w); // dehomoginized position
        vec3 v = normalize(-p_d);  // viewer
        // vec3 v = normalize(-position.xyz);  // viewer
        
        /* Summation */
        for(int j = 0; j < nlights; j++){
            /* Declaring q l & h */
            vec4 q = view * lightpositions[j]; // light position
            vec3 l = normalize((p.w*q.xyz) - (q.w*p.xyz)); // light direction
            vec3 h = normalize(v + l);  // half way vector

            /* Summation */
            vec4 d_max = diffuse * max(dot(n, l), 0);
            vec4 s_pow = specular * pow(max(dot(n, h), 0), shininess);
            sum += (ambient + d_max + s_pow) * lightcolors[j];
        }
        fragColor = emision + sum;
    }
}
