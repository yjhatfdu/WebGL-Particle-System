precision mediump float;
varying vec2 uv;
uniform sampler2D texture;
void main() {
vec4 color=texture2D(texture,uv);
color.w=1.0;
gl_FragColor=color;
}
