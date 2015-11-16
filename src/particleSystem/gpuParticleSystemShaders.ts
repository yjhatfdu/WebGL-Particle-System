module Engine{export module GAME{export module PS{export class ShaderLib{
static defaultVShader=`
attribute vec2 position;
varying vec2 uv;
void main() {
uv=(position+1.0)*0.5;
gl_Position=vec4(position,0.0,1.0);
}
`;static particleFShader=`
precision mediump float;
varying float opacity;
uniform float feather;
#if (PARTICLE_TYPE==0)
#else
varying vec2 vUvCoord;
#endif
#if (USE_TEXTURE==0)
varying vec4 color;
#else
uniform sampler2D particleTexture;
#endif
void main() {
#if (PARTICLE_TYPE==0)
vec2 uv=gl_PointCoord;
#else
vec2 uv=vUvCoord;
#endif
#if (USE_TEXTURE==0)
vec4 fcolor=color;
#else
fcolor=texture2D(particleTexture,vUvCoord);
#endif
float fopacity=1.0-2.0*distance(uv,vec2(0.5,0.5));
fcolor.w=fcolor.w*fopacity;
gl_FragColor=vec4(1.0,1.0,1.0,fopacity*opacity);
}`;static particleVShader=`
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
}`;static positionFShader=`
precision mediump float;
varying vec2 uv;
uniform highp float deltaTime;
uniform highp float currentTime;
uniform lowp sampler2D velocityTexture;
uniform sampler2D positionTexture;
//描述粒子基本属性，x为大小，，z为出生时间，w为寿命
uniform sampler2D staticTexture;
uniform vec3 emitterPosition;
#if (EMITTER_TYPE==0)
#elif (EMITTER_TYPE==1)
#elif (EMITTER_TYPE==2)
uniform vec4 direction;
#elif (EMITTER_TYPE==3)
//half size;
uniform vec3 emitterSize;
#endif
#if (USE_TEXTURE==0)
uniform vec4 emitColor;
#endif
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
 float lastRand=0.0;
 float rnd(){
        lastRand=fract(11035.15245*lastRand+0.12345);
        return lastRand;
 }
 float rnd_ext(){
        return 2.0*rnd()-1.0;
 }
void main() {
vec4 staticInfo=texture2D(staticTexture,uv);
vec4 pos=texture2D(positionTexture,uv);
float particleTime=mod(currentTime-staticInfo.z,totalTime);
   //寿命结束
 if(particleTime>staticInfo.w){
    pos.w=0.0;
    gl_FragColor=vec4(pos);
    return;
 }
 //生成粒子
 if(particleTime>0.0 && particleTime<=deltaTime){
        #if (EMITTER_TYPE==0)
         pos=vec4(emitterPosition,1.0);
        #elif (EMITTER_TYPE==1)
         pos=vec4(emitterPosition,1.0);
        #elif (EMITTER_TYPE==2)
        #elif (EMITTER_TYPE==3)
        lastRand=staticInfo.y*fract(currentTime/totalTime);
          pos=vec4(emitterPosition+vec3(rnd_ext()*emitterSize.x,rnd_ext()*emitterSize.y,rnd_ext()*emitterSize.z),1.0);
        #endif
     }
 vec4 v=texture2D(velocityTexture,uv);
 pos.xyz=pos.xyz+v.xyz*deltaTime;
 gl_FragColor=vec4(pos.xyz,v.w);
}`;static velocityFShader=`

//#define totalTime 10
/**
#define EMITTER_TYPE
0:point
1:directional point
2:plane
3:volume
**/
//#define USE_WIND 0
//#define EMITTER_TYPE 0
precision mediump float;
varying vec2 uv;
 uniform highp float deltaTime;
uniform highp float currentTime;
uniform vec3 gravity;
//阻力系数
uniform float resistance;
uniform sampler2D velocityTexture;
//描述粒子基本属性，x为大小,y为随机种子，z为出生时间，w为寿命
uniform sampler2D staticTexture;
#if (USE_WIND==1)
uniform vec3 wind;
#endif
uniform float emitSpeed;
uniform float emitVary;
uniform float speedVary;
#if (EMITTER_TYPE==0)
#elif (EMITTER_TYPE==1)
uniform vec4 direction;
#elif (EMITTER_TYPE==2)
uniform vec4 direction;
#elif (EMITTER_TYPE==3)
#endif
 highp float lastRand;
 float rnd(){
        lastRand=fract(1103.515245*lastRand+0.12345);
        return lastRand;
 }
 float rnd_ext(){
        return 2.0*rnd()-1.0;
 }
void main() {
     mediump vec4 staticInfo=texture2D(staticTexture,uv);
     lastRand=fract(staticInfo.y+currentTime/totalTime);
     vec4 v=texture2D(velocityTexture,uv);
     highp float particleTime=mod(currentTime-staticInfo.z,totalTime);
        //寿命结束
      if(particleTime>staticInfo.w){
      gl_FragColor=vec4(0.0,0.0,0.0,0.0);
         return;
      }
      highp float offsetTime=mod(currentTime,totalTime)-staticInfo.z;
     if(offsetTime<deltaTime&&offsetTime>0.0){
        #if (EMITTER_TYPE==0)
            vec3 dir=normalize(vec3(rnd_ext(),rnd_ext(),rnd_ext()));
        #elif (EMITTER_TYPE==1)
            vec3 dir=normalize(direction.xyz+direction.w*vec3(rnd_ext(),rnd_ext(),rnd_ext()));
        #elif (EMITTER_TYPE==2)
            vec3 dir=normalize(direction.xyz+direction.w*vec3(rnd_ext(),rnd_ext(),rnd_ext()));
        #elif (EMITTER_TYPE==3)
            vec3 dir=normalize(vec3(rnd_ext(),rnd_ext(),rnd_ext()));
        #endif
       v.xyz=dir*emitSpeed*(1.0+emitVary*rnd_ext());
       v.w=1.0;
     }
     vec3 a=-gravity;
     a=a+vec3(rnd_ext(),rnd_ext(),rnd_ext())*speedVary*v.xyz;
     #if (USE_WIND==1)
     a=a-edge(v.xyz,0.001)*0.5*pow(v.xyz-wind,2.0)*resistance*staticInfo.x*staticInfo.x;
     #else
     a=a-step(0.001,v.xyz)*0.5*v.xyz*v.xyz*resistance*staticInfo.x*staticInfo.x;
     #endif
     v.xyz=v.xyz+a*deltaTime;
gl_FragColor=v;
 }
`;static defaultFShader=`
precision mediump float;
varying vec2 uv;
uniform sampler2D texture;
void main() {
vec4 color=texture2D(texture,uv);
color.w=1.0;
gl_FragColor=color;
}
`}}}}
