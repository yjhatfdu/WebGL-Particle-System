/**
 * Created by yjh on 15/9/29.
 */
    ///<reference path='render.ts'/>
module Engine{
    export module GAME{
        export class Camera extends Object3D{
            isActive=false;
            viewMat=mat4.create();
            perspectiveMat=mat4.create();
            isroot=true;
            init(render){
                this.render=render
            }
            setAsDefaultCamera(){
                if(this.render.defaultCamera){
                    this.render.defaultCamera.isActive=false;
                }
                this.isActive=true;
                this.render.defaultCamera=this;
                this.render.viewMat=this.viewMat;
                this.render.perspectiveMat=this.perspectiveMat;
                this.render.eyePosition=this.position;
            }

        }
        export class PerspectiveCamera extends Camera{
            aspect;
            fov;
            near;
            far;
            center=vec3.create();
            headerUp=new Float32Array([0,1,0]);
            constructor(x=0,y=0,z=0,fov=80,near=0.1,far=300,aspect=null){
                super();
                this.aspect=aspect;
                this.position[0]=x;
                this.position[1]=y;
                this.position[2]=z;
                this.fov=fov;
                this.near=near;
                this.far=far;
            }
           update(){
               if(this.isActive){
                   //mat4.identity(this.viewMat);
                   mat4.lookAt(this.viewMat,this.position,this.center,this.headerUp);
                   mat4.perspective(this.perspectiveMat,this.fov,this.aspect||1/this.render.aspect,this.near,this.far)
               }
           }
            lookAt(center:Float32Array,headerUp:Float32Array){
                    vec3.copy(this.center,center);
                    vec3.copy(this.headerUp,headerUp)
            }

        }


    }
}