/**
 * Created by yjh on 15/9/13.
 */
    ///<reference path='eventBase.ts'/>
    ///<reference path='drawNode.ts'/>

    ///<reference path='../lib/glHelper.ts'/>

    ///<reference path='camera.ts'/>

    //绘图坐标使用相对坐标，以Height定为-1～1
module Engine{
    export enum RenderEvent{
        resize
    }
    export module GAME{
       export class Render extends Engine.GAME.Object3D{
            canvas;
            gl;
            p;
            width;
            height;
            aspect;
            identity='root';
            drawCallCount=0;
            vertexCount=0;
            blendState;
            isroot=true;
            defaultCamera:Camera;
            perspectiveMat=mat4.create();
            viewMat=mat4.create();
            vpMatrix=mat4.create();
            eyePosition:Float32Array;
            cameraList=[];
            constructor(containor,forceUsingCanvas=false,p=window.devicePixelRatio){
                super();
                this.p=p;
                this.canvas=document.createElement('canvas');
                containor.innerHTML='';
                containor.appendChild(this.canvas);
                this.canvas.style.width='100%';
                this.canvas.style.height='100%';

                if(forceUsingCanvas){
                    this.initCanvas()
                }else{
                    this.initGL()
                }

                this.render=this;

                this.resize();
                window.addEventListener('resize',this.onresize.bind(this))
            }

           initGL(){
               this.gl=this.canvas.getContext('webgl');
               if(!this.gl){
                    this.initCanvas()
               }
               this.gl.blendFunc(this.gl.SRC_ALPHA,this.gl.ONE_MINUS_SRC_ALPHA);
               var hf=this.gl.getExtension('OES_texture_half_float');
               this.gl.HALF_FLOAT=hf.HALF_FLOAT_OES;
               this.gl.getExtension('OES_texture_float');
               this.gl.clearColor(0.0,0.0,0.0,0.0);
           }
           initCanvas(){
               this.ctx=this.canvas.getContext('2d');
               this.isCanvas=true;
           }

           onresize(){
               this.resize();
               this.dispatchEvent(RenderEvent.resize)
           }

            resize(){
                this.canvas.width=(this.width=this.canvas.offsetWidth)*this.p;
                this.canvas.height=(this.height=this.canvas.offsetHeight)*this.p;
                this.gl.viewport(0,0,this.canvas.width,this.canvas.height);
                this.aspect=this.height/this.width;

            }
           addCamera(camera){
               camera.init(this);
               this.cameraList.push(camera);
               camera.setAsDefaultCamera();
           }
           removeCamera(camera){
               var index=this.cameraList.indexOf(camera);
               if (index>=0){
                   this.cameraList.splice(index,1);
               }
           }

            update(currentTime){
                this.drawCallCount=0;
                this.vertexCount=0;
                if(this.isCanvas){
                    this.ctx.clearRect(0,0,this.width,this.height);
                }else{
                    //this.gl.clear(this.gl.COLOR_BUFFER_BIT|this.gl.DEPTH_BUFFER_BIT);
                    for(var i in this.cameraList){
                        this.cameraList[i].update(currentTime);
                    }
                    //mat4.invert(this.worldMat,this.viewMat);
                    mat4.mul(this.vpMatrix,this.perspectiveMat,this.viewMat);
                    //if(this.defaultCamera){
                    //    this.defaultCamera.update(currentTime);
                    //    mat4.invert(this.worldMat,this.viewMat);
                    //}
                }


                super.update(currentTime);
            }
        }
    }
}
