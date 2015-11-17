/**
 * Created by yjh on 15/10/7.
 */
///<reference path='../drawNode.ts'/>
///<reference path='gpuParticleSystemShaders.ts'/>

module Engine{
    export module GAME{
        export module PS{
            export enum ParticleType{
                point,
                rectangle,

            }
            export enum EmitterType{
                point,
                directional,
                plane,
                volume_cube,
                volume_Sphere
            }
            export class GpuParticleSystem extends Object3D{
                


                private maxCountSqrt;
                private maxCount;



                emitColor=[1,1,1,1];



                private staticInfoTexture;




                private compileFlags={
                    'totalTime':0,
                    'PARTICLE_TYPE':0,
                    'USE_TEXTURE':0,
                    'EMITTER_TYPE':0,
                    'USE_WIND':0
                };

                particleProperty={
                    size:10,
                    sizeVary:0.1,
                    life:10,
                    lifeVary:0.1,
                    speedVary:0.01
                };

                emitVary=0;
                emitSpeed=1;
                emitPercent=1;
                wind=vec3.create();
                gravity;
                particlePerSec;
                emitPosition=vec3.create();
                getCompileFlags(){
                    var result='';
                    for (var i in this.compileFlags){
                        result+=`#define ${i} ${this.compileFlags[i]}\n`
                    }
                    return result;
                }
                constructor(maxParticlePerSec,emitSpeed,size,life,lifeVary=0.1,sizeVary=0.1,sizeLevel:number=8,particleType:ParticleType=ParticleType.point,useTexture=false,emitterType:EmitterType=EmitterType.point,useWind=false,gravity=[0,0,0],speedVary=10){
                    super();
                    this.maxCountSqrt=Math.pow(2,sizeLevel);
                    this.maxCount=Math.pow(this.maxCountSqrt,2);
                    this.compileFlags['totalTime']=maxParticlePerSec?this.maxCount/maxParticlePerSec:Math.pow(2,64);
                    this.compileFlags['PARTICLE_TYPE']=particleType;
                    this.compileFlags['USE_TEXTURE']=!!useTexture?1:0;
                    this.compileFlags['EMITTER_TYPE']=emitterType;
                    this.compileFlags['USE_WIND']=!!useWind?1:0;
                    this.particleProperty.size=size;
                    this.particleProperty.sizeVary=sizeVary;
                    this.particleProperty.life=life;
                    this.particleProperty.lifeVary=lifeVary;
                    this.particleProperty.speedVary=speedVary;
                    this.emitSpeed=emitSpeed;
                    this.gravity=gravity;
                    this.particlePerSec=maxParticlePerSec
                }
                defaultPositionVBO;
                init(){
                    var flags=this.getCompileFlags();
                    this.gl.activeTexture(this.gl.TEXTURE0);
                    var staticInfo=new Float32Array(this.maxCount*4);
                    var size=this.particleProperty.size*this.render.p;
                    var sizeVary=this.particleProperty.sizeVary;
                    var totalTime=this.maxCount/this.particlePerSec;
                    var life=this.particleProperty.life;
                    var lifeVary=this.particleProperty.lifeVary;

                    for(var i =0;i<this.maxCount;i++){
                        staticInfo[4*i]=size*(1+sizeVary*(Math.random()*2-1));
                        staticInfo[4*i+1]=Math.random();
                        staticInfo[4*i+2]=i/this.maxCount*this.compileFlags.totalTime;
                        staticInfo[4*i+3]=life*(1+lifeVary*(Math.random()*2-1));
                    }
                    this.staticInfoTexture=this.gl.createTexture();
                    this.gl.bindTexture(this.gl.TEXTURE_2D,this.staticInfoTexture);
                    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
                    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
                    this.gl.texImage2D(this.gl.TEXTURE_2D,0,this.gl.RGBA,this.maxCountSqrt,this.maxCountSqrt,0,this.gl.RGBA,this.gl.FLOAT,staticInfo);
                    this.defaultPositionVBO=getVBO(this.gl,[-1,-1,1,-1,1,1,-1,-1,1,1,-1,1]);
                    this.initPositionProgram(flags);
                    this.initVelocityProgram(flags);
                    this.initParticleProgram(flags);

                    this.defaultProgram=getProgramByShaderSource(this.gl,ShaderLib.defaultVShader,ShaderLib.defaultFShader);
                    this.dfPosAL=this.gl.getAttribLocation(this.defaultProgram,'position');
                    this.dfTextureUL=this.gl.getUniformLocation(this.defaultProgram,'texture');
                }


                //debug
                defaultProgram;
                dfPosAL;
                dfTextureUL;





                private renderParticleProgram;

                private ppUvCoordAL;
                private ppRotateSpeedUL;
                private ppUvAL;
                private ppDeltaTimeUL;
                private ppCurrentTimeUL;
                private ppPositionTextureUL;
                private ppStaticTextureUL;
                private ppMvpMatUL;
                private ppOpacityUL;
                private ppOpacityEaseUL;
                private ppFeatherUL;
                private ppParticleTextureUL;
                private ppIBO;
                private ppUvVBO;
                private ppUvCoordVBO;

                initParticleProgram(flags){
                    this.renderParticleProgram=getProgramByShaderSource(this.gl,flags+ShaderLib.particleVShader,flags+ShaderLib.particleFShader);
                    this.ppUvCoordAL=this.gl.getAttribLocation(this.renderParticleProgram,'uvCoord');
                    this.ppUvAL=this.gl.getAttribLocation(this.renderParticleProgram,'uv');
                    this.ppRotateSpeedUL=this.gl.getUniformLocation(this.renderParticleProgram,'rotateSpeed');
                    this.ppRotateSpeedUL=this.gl.getUniformLocation(this.renderParticleProgram,'rotateSpeed');
                    this.ppDeltaTimeUL=this.gl.getUniformLocation(this.renderParticleProgram,'deltaTime');
                    this.ppCurrentTimeUL=this.gl.getUniformLocation(this.renderParticleProgram,'currentTime');
                    this.ppPositionTextureUL=this.gl.getUniformLocation(this.renderParticleProgram,'positionTexture');
                    this.ppStaticTextureUL=this.gl.getUniformLocation(this.renderParticleProgram,'staticTexture');
                    this.ppMvpMatUL=this.gl.getUniformLocation(this.renderParticleProgram,'mvpMat');
                    this.ppOpacityUL=this.gl.getUniformLocation(this.renderParticleProgram,'opacity');
                    this.ppOpacityEaseUL=this.gl.getUniformLocation(this.renderParticleProgram,'opacityEase');
                    this.ppFeatherUL=this.gl.getUniformLocation(this.renderParticleProgram,'feature');
                    this.ppParticleTextureUL=this.gl.getUniformLocation(this.renderParticleProgram,'particleTextureUL');
                    var mul;
                    var iboarray;
                    switch (this.compileFlags.PARTICLE_TYPE){
                        case 0:{
                            mul=2;
                            iboarray=new Uint16Array(this.maxCount);
                            for (var i=0;i<this.maxCount;i++){
                                iboarray[i]=i;
                            }
                            break
                        }
                            case 1:{
                                mul=8;
                                //暂未实现rectangle sprite
                            }
                    }
                    var uvBuffer=new Float32Array(this.maxCount*2);
                    //var uvCoordBuffer=new Float32Array(this.maxCount*2);
                    var unit=1/this.maxCountSqrt;
                    for(var x=0;x<this.maxCountSqrt;x++){
                        for(var y=0;y<this.maxCountSqrt;y++){
                            var pos=2*(this.maxCountSqrt*y+x);
                            uvBuffer[pos]=x*unit;
                            uvBuffer[pos+1]=y*unit;
                        }
                    }
                    this.ppUvVBO=getVBO(this.gl,uvBuffer);
                    this.ppIBO=getIBO(this.gl,iboarray);
                }





                private updatePositionProgram;
                //双缓存位置纹理
                private positionTexture;
                private positionTextureFbo;
                private bufferPositionTexture;
                private bufferPositionTextureFbo;
                //attribute locations
                private pospPositonAL;
                private pospDeltaTimeUl;
                private pospCurrentTimeUl;
                private pospVelocityTextureUL;
                private pospPositionTextureUL;
                private pospStaicTextureUL;
                private pospEmitterPositionUL;
                private pospDirectionUL;
                private pospEmitterSizeUL;
                private pospEmitColorUL;

                initPositionProgram(flags){
                    this.updatePositionProgram=getProgramByShaderSource(this.gl,flags+ShaderLib.defaultVShader,flags+ShaderLib.positionFShader);
                    this.positionTexture=this.gl.createTexture();
                    this.gl.bindTexture(this.gl.TEXTURE_2D,this.positionTexture);
                    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
                    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
                    this.gl.texImage2D(this.gl.TEXTURE_2D,0,this.gl.RGBA,this.maxCountSqrt,this.maxCountSqrt,0,this.gl.RGBA,this.gl.HALF_FLOAT,null);
                    this.positionTextureFbo=this.gl.createFramebuffer();
                    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER,this.positionTextureFbo);
                    this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER,this.gl.COLOR_ATTACHMENT0,this.gl.TEXTURE_2D,this.positionTexture,0);
                    this.bufferPositionTexture=this.gl.createTexture();
                    this.gl.bindTexture(this.gl.TEXTURE_2D,this.bufferPositionTexture);
                    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
                    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
                    this.gl.texImage2D(this.gl.TEXTURE_2D,0,this.gl.RGBA,this.maxCountSqrt,this.maxCountSqrt,0,this.gl.RGBA,this.gl.HALF_FLOAT,null);
                    this.bufferPositionTextureFbo=this.gl.createFramebuffer();
                    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER,this.bufferPositionTextureFbo);
                    this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER,this.gl.COLOR_ATTACHMENT0,this.gl.TEXTURE_2D,this.bufferPositionTexture,0);
                    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER,null);
                    this.pospPositonAL=this.gl.getAttribLocation(this.updatePositionProgram,'position');
                    this.pospDeltaTimeUl=this.gl.getUniformLocation(this.updatePositionProgram,'deltaTime');
                    this.pospCurrentTimeUl=this.gl.getUniformLocation(this.updatePositionProgram,'currentTime');
                    this.pospVelocityTextureUL =this.gl.getUniformLocation(this.updatePositionProgram,'velocityTexture');
                    this.pospPositionTextureUL=this.gl.getUniformLocation(this.updatePositionProgram,'positionTexture');
                    this.pospStaicTextureUL=this.gl.getUniformLocation(this.updatePositionProgram,'staticTexture');
                    this.pospDirectionUL=this.gl.getUniformLocation(this.updatePositionProgram,'direction');
                    this.pospEmitterPositionUL=this.gl.getUniformLocation(this.updatePositionProgram,'emitterPosition');
                    this.pospEmitterSizeUL=this.gl.getUniformLocation(this.updatePositionProgram,'emitterSize');
                    this.pospEmitColorUL=this.gl.getUniformLocation(this.updatePositionProgram,'emitColor');
                }


                private updateVelocityProgram;
                //双缓存速度纹理
                private velocityTexture;
                private bufferVelocityTexture;
                private velocityTextureFbo;
                private bufferVelocityTextureFbo;
                private velpPositionAL;
                private velpDeltaTimeUL;
                private velpCurrentTimeUL;
                private velpGravityUL;
                private velpResistanceUL;
                private velpVelocityTextureUL;
                private velpStaticTextureUL;
                private velpWindUL;
                private velpEmitSpeedUL;
                private velpEmitVaryUL;
                private velpSpeedVaryUL;
                private velpDirectionUL;
                private velpEmitPercentUL;
                initVelocityProgram(flags){
                    this.updateVelocityProgram=getProgramByShaderSource(this.gl,flags+ShaderLib.defaultVShader,flags+ShaderLib.velocityFShader);
                    this.velocityTexture=this.gl.createTexture();
                    this.gl.bindTexture(this.gl.TEXTURE_2D,this.velocityTexture);
                    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
                    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
                    this.gl.texImage2D(this.gl.TEXTURE_2D,0,this.gl.RGBA,this.maxCountSqrt,this.maxCountSqrt,0,this.gl.RGBA,this.gl.HALF_FLOAT,null);
                    this.velocityTextureFbo=this.gl.createFramebuffer();
                    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER,this.velocityTextureFbo);
                    this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER,this.gl.COLOR_ATTACHMENT0,this.gl.TEXTURE_2D,this.velocityTexture,0);
                    this.bufferVelocityTexture=this.gl.createTexture();
                    this.bufferVelocityTexture['buffer']=1;
                    this.gl.bindTexture(this.gl.TEXTURE_2D,this.bufferVelocityTexture);
                    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
                    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
                    this.gl.texImage2D(this.gl.TEXTURE_2D,0,this.gl.RGBA,this.maxCountSqrt,this.maxCountSqrt,0,this.gl.RGBA,this.gl.HALF_FLOAT,null);
                    this.bufferVelocityTextureFbo=this.gl.createFramebuffer();
                    this.bufferPositionTextureFbo['buffer']=1;
                    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER,this.bufferVelocityTextureFbo);
                    this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER,this.gl.COLOR_ATTACHMENT0,this.gl.TEXTURE_2D,this.bufferVelocityTexture,0);
                    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER,null);
                    this.velpPositionAL=this.gl.getAttribLocation(this.updateVelocityProgram,'position');
                    this.velpDeltaTimeUL=this.gl.getUniformLocation(this.updateVelocityProgram,'deltaTime');
                    this.velpCurrentTimeUL=this.gl.getUniformLocation(this.updateVelocityProgram,'currentTime');
                    this.velpGravityUL=this.gl.getUniformLocation(this.updateVelocityProgram,'gravity');
                    this.velpResistanceUL=this.gl.getUniformLocation(this.updateVelocityProgram,'resistance');
                    this.velpVelocityTextureUL=this.gl.getUniformLocation(this.updateVelocityProgram,'velocityTexture');
                    this.velpStaticTextureUL=this.gl.getUniformLocation(this.updateVelocityProgram,'staticTexture');
                    this.velpWindUL=this.gl.getUniformLocation(this.updateVelocityProgram,'wind');
                    this.velpEmitSpeedUL=this.gl.getUniformLocation(this.updateVelocityProgram,'emitSpeed');
                    this.velpEmitVaryUL=this.gl.getUniformLocation(this.updateVelocityProgram,'emitVary');
                    this.velpSpeedVaryUL=this.gl.getUniformLocation(this.updateVelocityProgram,'speedVary');
                    this.velpDirectionUL=this.gl.getUniformLocation(this.updateVelocityProgram,'direction');
                    this.velpEmitPercentUL=this.gl.getUniformLocation(this.updateVelocityProgram,'emitPercent');
                }







                updatePositionTexture(deltaTime,currentTime){
                    var gl=this.gl;
                    this.gl.useProgram(this.updatePositionProgram);
                    this.gl.disable(this.gl.BLEND);
                    var tmp=this.positionTexture;
                    this.positionTexture=this.bufferPositionTexture;
                    this.bufferPositionTexture=tmp;
                    tmp=this.positionTextureFbo;
                    this.positionTextureFbo=this.bufferPositionTextureFbo;
                    this.bufferPositionTextureFbo=tmp;
                    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER,this.positionTextureFbo);
                    this.gl.activeTexture(this.gl.TEXTURE0);
                    this.gl.bindTexture(this.gl.TEXTURE_2D,this.bufferPositionTexture);
                    this.gl.activeTexture(this.gl.TEXTURE1);
                    this.gl.bindTexture(this.gl.TEXTURE_2D,this.velocityTexture);
                    this.gl.activeTexture(this.gl.TEXTURE2);
                    this.gl.bindTexture(this.gl.TEXTURE_2D,this.staticInfoTexture);
                    this.gl.bindBuffer(this.gl.ARRAY_BUFFER,this.defaultPositionVBO);
                    this.gl.enableVertexAttribArray(this.pospPositonAL);
                    this.gl.vertexAttribPointer(this.pospPositonAL,2,this.gl.FLOAT,false,0,0);
                    this.gl.uniform1f(this.pospDeltaTimeUl,deltaTime);
                    this.gl.uniform1f(this.pospCurrentTimeUl,currentTime);
                    this.gl.uniform1i(this.pospVelocityTextureUL,1);
                    this.gl.uniform1i(this.pospPositionTextureUL,0);
                    this.gl.uniform1i(this.pospStaicTextureUL,2);
                    this.gl.uniform3fv(this.pospEmitterPositionUL,this.emitPosition);
                    if(this.compileFlags.EMITTER_TYPE==2){
                    //todo
                    }
                    if(this.compileFlags.EMITTER_TYPE==3){
                        //todo
                    }
                    if(this.compileFlags.USE_TEXTURE==0){
                        this.gl.uniform4fv(this.pospEmitColorUL,this.emitColor)
                    }
                    this.gl.viewport(0,0,this.maxCountSqrt,this.maxCountSqrt);

                    this.gl.drawArrays(this.gl.TRIANGLES,0,6);
                    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER,null);
                    //this.gl.drawArrays(this.gl.TRIANGLES,0,6);
                }


                updateVelocityTexture(deltaTime,currentTime){
                    var gl=this.gl;
                    this.gl.useProgram(this.updateVelocityProgram);
                    this.gl.disable(this.gl.BLEND);
                    var tmp=this.velocityTexture;
                    this.velocityTexture=this.bufferVelocityTexture;
                    this.bufferVelocityTexture=tmp;
                    var tmp=this.velocityTextureFbo;
                    this.velocityTextureFbo=this.bufferVelocityTextureFbo;
                    this.bufferVelocityTextureFbo=tmp;
                    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER,this.velocityTextureFbo);
                    this.gl.activeTexture(this.gl.TEXTURE0);
                    this.gl.bindTexture(this.gl.TEXTURE_2D,this.bufferVelocityTexture);
                    this.gl.activeTexture(this.gl.TEXTURE1);
                    this.gl.bindTexture(this.gl.TEXTURE_2D,this.staticInfoTexture);
                    this.gl.bindBuffer(this.gl.ARRAY_BUFFER,this.defaultPositionVBO);
                    this.gl.enableVertexAttribArray(this.velpPositionAL);
                    this.gl.vertexAttribPointer(this.velpPositionAL,2,this.gl.FLOAT,false,0,0);
                    this.gl.uniform1f(this.velpDeltaTimeUL,deltaTime);
                    this.gl.uniform1f(this.velpCurrentTimeUL,currentTime);
                    this.gl.uniform1i(this.velpVelocityTextureUL,0);
                    this.gl.uniform1i(this.velpStaticTextureUL,1);
                    this.gl.uniform1f(this.velpSpeedVaryUL,this.particleProperty.speedVary);
                    this.gl.uniform1f(this.velpEmitVaryUL,this.emitVary);
                    this.gl.uniform1f(this.velpEmitSpeedUL,this.emitSpeed);
                    this.gl.uniform3fv(this.velpGravityUL,this.gravity);
                    this.gl.uniform1f(this.velpEmitPercentUL,this.emitPercent);
                    if(this.compileFlags.USE_WIND==1){
                        this.gl.uniform3fv(this.velpWindUL,this.wind);
                    }
                    //todo emitter type
                    this.gl.viewport(0,0,this.maxCountSqrt,this.maxCountSqrt);
                    this.gl.drawArrays(this.gl.TRIANGLES,0,6);
                    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER,null);

                }

                drawParticle(deltaTime,currentTime){
                    this.gl.useProgram(this.renderParticleProgram);
                    bindAttribute(this.gl,this.gl.ppUvAL,2,this.ppUvVBO);
                    this.gl.activeTexture(this.gl.TEXTURE0);
                    this.gl.bindTexture(this.gl.TEXTURE_2D,this.positionTexture);
                    this.gl.activeTexture(this.gl.TEXTURE1);
                    this.gl.bindTexture(this.gl.TEXTURE_2D,this.staticInfoTexture);
                    this.gl.uniform1i(this.ppPositionTextureUL,0);
                    this.gl.uniform1i(this.ppStaticTextureUL,1);
                    this.gl.uniform1f(this.ppDeltaTimeUL,deltaTime);
                    this.gl.uniform1f(this.ppCurrentTimeUL,currentTime);
                    this.gl.uniformMatrix4fv(this.ppMvpMatUL,false,this.mvpMat);
                    this.gl.uniform1f(this.ppFeatherUL,0);
                    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER,this.ppIBO);
                    this.gl.enable(this.gl.BLEND);
                    this.gl.drawElements(this.gl.POINTS,this.maxCount,this.gl.UNSIGNED_SHORT,0);
                }
                lastTime=0;
                startTime=0;
                update(current){
                    super.update(current);
                    var currentTime=current*0.001;
                    if(!this.startTime){
                        this.startTime=currentTime
                    }
                    currentTime-=this.startTime;
                    var deltaTime;
                    deltaTime=this.lastTime?currentTime-this.lastTime:0;
                    this.lastTime=currentTime;

                    this.updateVelocityTexture(deltaTime,currentTime);
                    this.updatePositionTexture(deltaTime,currentTime);
                    this.gl.useProgram(this.defaultProgram);
                    bindAttribute(this.gl,this.dfPosAL,2,this.defaultPositionVBO);
                    this.gl.activeTexture(this.gl.TEXTURE0);
                    this.gl.viewport(0,0,this.render.width*this.render.p,this.render.height*this.render.p);
                    //this.gl.bindTexture(this.gl.TEXTURE_2D,this.velocityTexture);
                    //this.gl.uniform1i(this.dfTextureUL,0);
                    //this.gl.drawArrays(this.gl.TRIANGLES,0,6);
                    this.drawParticle(deltaTime,currentTime);
                }
            }
        }
    }
}