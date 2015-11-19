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
#if (SIMPLE_PARTICLE==0)
float fopacity=1.0-2.0*distance(uv,vec2(0.5,0.5));
//float fopacity=1.0-step(0.5,distance(uv,vec2(0.5,0.5)));
fcolor.w=fcolor.w*fopacity;
gl_FragColor=vec4(1.0,1.0,1.0,fopacity*opacity);
#else
gl_FragColor=vec4(1.0,1.0,1.0,1.0);
#endif
}