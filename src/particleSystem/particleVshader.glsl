#define PARTICLE_TYPE 0
//#define totalTime 10.0
/*#define PARTICLE_TYPE
    0:pointSprite;
    1:rectangle;
    2:cube
*/

#define USE_TEXTURE 0



attribute vec2 uv;
uniform float deltaTime;
uniform float currentTime;


uniform sampler2D positionTexture;
uniform sampler2D staticTexture;


uniform mat4 mvpMat;

varying float opacity;
// 范围 0-10
uniform float opacityEase;



vec4 unpack(const in float depth)
{
    const vec4 bit_shift = vec4(256.0*256.0*256.0, 256.0*256.0, 256.0, 1.0);
    const vec4 bit_mask  = vec4(0.0, 1.0/256.0, 1.0/256.0, 1.0/256.0);
    vec4 res = fract(depth * bit_shift);
    res -= res.xxyz * bit_mask;
    return res;
}

float pack(const in vec4 rgba_depth)
{
    const vec4 bit_shift = vec4(1.0/(256.0*256.0*256.0), 1.0/(256.0*256.0), 1.0/256.0, 1.0);
    float depth = dot(rgba_depth, bit_shift);
    return depth;
}


#if (USE_TEXTURE==0)
varying vec4 color;
#endif

#if (PARTICLE_TYPE==0)

#else
attribute vec2 uvCoord;
uniform float rotateSpeed;
varying vec2 vUvCoord;

float lastRand=0.0;
 float rnd(){
        lastRand=fract(11035.15245*lastRand+0.12345);
        return lastRand;
 }
 float rnd_ext(){
        return 2.0*rnd()-1.0;
 }
 mat4 rotationMatrix(vec3 axis, float angle){
    axis = normalize(axis);
    float s = sin(angle);
    float c = cos(angle);
    float oc = 1.0 - c;
    return mat4(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,
    oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,
    oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,
    0.0,                                0.0,                                0.0,                                1.0);   }

#endif

void main() {
    vec4 position=texture2D(positionTexture,uv);

    vec4 staticInfo=texture2D(staticTexture,uv);
    float particleTime=mod(currentTime-staticInfo.z,totalTime);
    if(particleTime>=staticInfo.w||position.w==0.0){
            gl_Position=vec4(5.0,5.0,5.0,0.0);
             return;
          }

    #if (PARTICLE_TYPE==0)

        #else

        lastRand=particleTime;
        vec3 rotateDir=normalize(vec3(rnd_ext(),rnd_ext(),rnd_ext()));
        position=position*rotationMatrix(rotateDir,particleTime*rotateSpeed);
        vUvCoord=uvCoord;

        #endif

    position=mvpMat*position;
     #if (PARTICLE_TYPE==0)
            gl_PointSize=clamp(staticInfo.x/position.z,1.0,10.0);
     #endif
    #if (USE_TEXTURE==0)
    color=unpack(position[3]);
    #endif
    float timeRatio=particleTime/staticInfo.w;
    opacity=mix(pow(timeRatio,0.1*opacityEase),pow(1.0-timeRatio,0.1*opacityEase),timeRatio);
    opacity=opacity/pow(gl_PointSize,0.3);
    gl_Position=position;


}