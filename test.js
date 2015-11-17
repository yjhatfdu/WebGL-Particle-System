var render=new Engine.GAME.Render(document.querySelector('#container'),false,1);
var ps=new Engine.GAME.PS.GpuParticleSystem(10000,0.3,3,5);
render.appendChild(ps);
var camera=new Engine.GAME.PerspectiveCamera();
render.addCamera(camera);
camera.posZ=1;
var startTime=Date.now();
var stat=new Stats();
stat.setMode(0);
stat.domElement.style.position = 'absolute';
stat.domElement.style.left = '0px';
stat.domElement.style.top = '0px';
document.body.appendChild( stat.domElement );
var gui=new dat.GUI({
   height:6*32-1
});
gui.add(ps,'emitPercent').min(0).max(1).step(0.01).name('particle amount');
gui.add(ps.gravity,'1').min(-1).max(1).step(0.01).name('gravityY');
gui.add(ps.gravity,'0').min(-1).max(1).step(0.01).name('gravityX');
gui.add(ps.gravity,'2').min(-1).max(1).step(0.01).name('gravityZ');
gui.add(ps,'emitSpeed').min(0).max(5).step(0.05);
gui.add(ps.particleProperty,'speedVary').min(0).max(20).step(0.1).name('speed variety');

function update(){
    stat.begin();
    window.requestAnimationFrame(update);
    var current=Date.now()-startTime;
    ps.emitPosition[0]=Math.sin(current/800)*0.5;
    ps.emitPosition[1]=Math.cos(current/800)*0.6;
    render.update(current);
    stat.end();
}
update();