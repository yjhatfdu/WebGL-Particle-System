
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
