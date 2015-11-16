/**
 * Created by yjh on 15/9/13.
 */
    ///<reference path='../lib/glHelper.ts'/>
    ///<reference path='eventBase.ts'/>
    ///<reference path='../lib/gl-matrix.d.ts'/>
module Engine{
    export module GAME{
        export class NodeBase extends EventBase{
            gl;
            ctx;
            identity;
            children=[];
            parent;
            render;
            visible=true;
            isCanvas;
            constructor(){
                super()
            }
            init(render?){

            }
            initCanvas(){

            }
            active(){

            }
            update(currentTime){
                for (var i in this.children){
                    var node=this.children[i];
                    if(!node.visible){
                        continue
                    }
                    if(node.identity!=this.render.identity){
                        node.active();
                        this.render.currentNode=node.identity
                    }
                    node.update(currentTime)
                }
            }
            appendChild(child:NodeBase){
                child.render=this.render;
                child.parent=this;
                child.gl=this.gl;
                child.ctx=this.ctx;
                if(this.isCanvas){
                    child.initCanvas()
                }else{
                    child.init();
                }

                this.children.push(child);
            }
            insertChild(child:NodeBase,index=0){
                child.render=this.render;
                child.parent=this;
                child.gl=this.gl;
                child.ctx=this.ctx;
                if(this.isCanvas){
                    child.initCanvas()
                }else{
                    child.init();
                }
                this.children.splice(index,0,child)
            }
            removeChild(item){
                delete this.children[this.children.indexOf(item)]
            }
    }
        export class DrawNode extends NodeBase{
            vsText;
            fsText;
            enableBlend=true;
            glProgram;
             constructor(){
                 super();

             }
            initCanvas(){

            }
            init(){
                var vs=getShader(this.gl,true,this.vsText);
                var fs=getShader(this.gl,false,this.fsText);
                this.glProgram=getProgram(this.gl,vs,fs)
            }
            active(){
                if(this.isCanvas){
                    return
                }
                if(this.enableBlend!=this.render.blendState){
                    if(this.enableBlend){
                        this.render.blendState=true;
                        this.gl.enable(this.gl.BLEND);
                        this.gl.disable(this.gl.DEPTH_TEST);
                    }else{
                        this.gl.disable(this.gl.BLEND);
                        this.gl.enable(this.gl.DEPTH_TEST)
                    }
                }
                this.gl.useProgram(this.glProgram);
            }
             getUL(uniformName){
                 return this.gl.getUniformLocation(this.glProgram,uniformName)
             }
             getAL(attributeName){
                 return this.gl.getAttribLocation(this.glProgram,attributeName)
             }
            bindDynamicBufferAndAttrib(data,vbo,attribLoc,attribSize){
                this.gl.bindBuffer(this.gl.ARRAY_BUFFER,vbo);
                this.gl.bufferData(this.gl.ARRAY_BUFFER,data,this.gl.DYNAMIC_DRAW);
                this.gl.enableVertexAttribArray(attribLoc);
                this.gl.vertexAttribPointer(vbo,attribSize,this.gl.FLOAT,0,0,0);
                this.gl.bindBuffer(this.gl.ARRAY_BUFFER,null)
            }
        }

        export class Object3D extends NodeBase{
            isroot=false;
            position=vec3.create();
            rotate=vec3.create();
            scaleV=vec3.clone(new Float32Array([1,1,1]));
            worldMat=mat4.create();
            modelMat=mat4.create();
            mvpMat=mat4.create();
            update(currentTime?){
                if(!this.isroot){
                    mat4.identity(this.modelMat);
                    mat4.rotate(this.modelMat,this.modelMat,1,this.rotate);
                    mat4.scale(this.modelMat,this.modelMat,this.scaleV);
                    mat4.translate(this.modelMat,this.modelMat,this.position);
                    mat4.mul(this.worldMat,this.modelMat,this.parent.worldMat);
                    mat4.mul(this.mvpMat,this.render.vpMatrix,this.worldMat);
                }
                super.update(currentTime)
            }
            set posX(v){
                this.position[0]=v
            }
            set posY(v){
                this.position[1]=v
            }
            set posZ(v){
                this.position[2]=v
            }
            translate(x,y,z){
                this.position[0]+=x;
                this.position[1]+=y;
                this.position[2]+=z;
            }
            set scale(v){
                this.scaleV[0]=v;
                this.scaleV[1]=v;
                this.scaleV[2]=v;
            }
            rotateBy(x,y,z){
                this.rotate[0]+=x;
                this.rotate[1]+=y;
                this.rotate[2]+=z;
            }
            rotateTo(x,y,z){
                this.rotate[0]=x;
                this.rotate[1]=y;
                this.rotate[2]=z;
            }


        }


    }
}