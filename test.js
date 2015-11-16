var render=new Engine.GAME.Render(document.querySelector('#container'),false,1);
var ps=new Engine.GAME.PS.GpuParticleSystem(1000,0.3,3,5);
render.appendChild(ps);
var camera=new Engine.GAME.PerspectiveCamera();
render.addCamera(camera);
camera.posZ=1;
var startTime=Date.now();
function update(){
    window.requestAnimationFrame(update);
    render.update(Date.now()-startTime)
}
update();