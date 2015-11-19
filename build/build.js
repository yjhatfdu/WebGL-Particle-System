var Engine;
(function (Engine) {
    var EventBase = (function () {
        function EventBase() {
            this.listeners = {};
        }
        EventBase.prototype.dispatchEvent = function (event, args) {
            if (!this.listeners[event]) {
                return;
            }
            for (var i in this.listeners[event]) {
                var l = this.listeners[event][i];
                l.listener(args, this);
                if (l.useCapture) {
                    return;
                }
            }
        };
        EventBase.prototype.addEventListener = function (event, listener, useCapture) {
            if (useCapture === void 0) { useCapture = false; }
            if (!this.listeners[event]) {
                this.listeners[event] = [];
            }
            this.listeners[event].push({ listener: listener, useCapture: useCapture });
        };
        EventBase.prototype.removeAllEventListenersOfEvent = function (event) {
            this.listeners[event] = [];
        };
        return EventBase;
    })();
    Engine.EventBase = EventBase;
})(Engine || (Engine = {}));
/**
 * Created by yjh on 15/3/15.
 */
function getShaderText(id) {
    return document.getElementById(id).innerHTML;
}
function getProgram(ctx, vShader, fShader) {
    var programObj = ctx.createProgram();
    ctx.attachShader(programObj, vShader);
    ctx.attachShader(programObj, fShader);
    ctx.linkProgram(programObj);
    if (ctx.getProgramParameter(programObj, ctx.LINK_STATUS)) {
        ctx.useProgram(programObj);
        return programObj;
    }
    else {
        console.log(ctx.getProgramInfoLog(programObj));
    }
}
function getProgramByShaderSource(ctx, vShader, fShader) {
    var vs = getShader(ctx, true, vShader);
    var fs = getShader(ctx, false, fShader);
    return getProgram(ctx, vs, fs);
}
function getShader(ctx, isVshader, shaderText) {
    var newshader = isVshader ? ctx.createShader(ctx.VERTEX_SHADER) : ctx.createShader(ctx.FRAGMENT_SHADER);
    ctx.shaderSource(newshader, shaderText);
    ctx.compileShader(newshader);
    if (ctx.getShaderParameter(newshader, ctx.COMPILE_STATUS)) {
        return newshader;
    }
    else {
        console.log(ctx.getShaderInfoLog(newshader));
    }
}
function getVBO(ctx, data) {
    var vbo = ctx.createBuffer();
    ctx.bindBuffer(ctx.ARRAY_BUFFER, vbo);
    ctx.bufferData(ctx.ARRAY_BUFFER, new Float32Array(data), ctx.STATIC_DRAW);
    ctx.bindBuffer(ctx.ARRAY_BUFFER, null);
    return vbo;
}
function bindAttribute(ctx, attrLocation, attrSize, vbo) {
    ctx.bindBuffer(ctx.ARRAY_BUFFER, vbo);
    ctx.enableVertexAttribArray(attrLocation);
    ctx.vertexAttribPointer(attrLocation, attrSize, ctx.FLOAT, false, 0, 0);
}
function getTextureByImgObject(webgl, imgObj, texindex) {
    webgl.activeTexture(webgl.TEXTURE0 + texindex);
    var textureObject = webgl.createTexture();
    webgl.bindTexture(webgl.TEXTURE_2D, textureObject);
    webgl.texImage2D(webgl.TEXTURE_2D, 0, webgl.RGBA, webgl.RGBA, webgl.UNSIGNED_BYTE, imgObj);
    webgl.generateMipmap(webgl.TEXTURE_2D);
    webgl.texParameteri(webgl.TEXTURE_2D, webgl.TEXTURE_MIN_FILTER, webgl.LINEAR);
    webgl.texParameteri(webgl.TEXTURE_2D, webgl.TEXTURE_MAG_FILTER, webgl.LINEAR);
    // webgl.texParameteri(webgl.TEXTURE_2D, webgl.TEXTURE_MIN_FILTER, webgl.NEAREST);
    // webgl.texParameteri(webgl.TEXTURE_2D, webgl.TEXTURE_MAG_FILTER, webgl.NEAREST);
    // webgl.texParameteri(webgl.TEXTURE_2D, webgl.TEXTURE_WRAP_S, webgl.CLAMP_TO_EDGE);
    // webgl.texParameteri(webgl.TEXTURE_2D, webgl.TEXTURE_WRAP_T, webgl.CLAMP_TO_EDGE);
    return textureObject;
}
function create_ibo(gl, data) {
    // 生成缓存对象
    var ibo = gl.createBuffer();
    // 绑定缓存
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
    // 向缓存中写入数据
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(data), gl.STATIC_DRAW);
    // 将缓存的绑定无效化
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    // 返回生成的IBO
    return ibo;
}
function uniformController(glCtx, glProgram, uniformData) {
    var program = glProgram;
    var data = uniformData;
    for (var i in uniformData) {
        var item = uniformData[i];
        item.location = glCtx.getUniformLocation(program, i);
    }
    return {
        bindUniform: function (name, value) {
            var item = data[name];
            var type = item.type;
            if (type == "Matrix3fv" || type == "Matrix4fv") {
                glCtx["uniform" + type](item.location, false, value);
            }
            else {
                glCtx["uniform" + type](item.location, value);
            }
        }
    };
}
function clone(myObj) {
    if (typeof (myObj) != 'object' || myObj == null)
        return myObj;
    var newObj = {};
    for (var i in myObj) {
        newObj[i] = clone(myObj[i]);
    }
    return newObj;
}
function getUid() {
    return Date.now() % 10000 + Math.random();
}
function getIBO(gl, data) {
    // 生成缓存对象
    var ibo = gl.createBuffer();
    // 绑定缓存
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
    // 向缓存中写入数据
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(data), gl.STATIC_DRAW);
    // 将缓存的绑定无效化
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    // 返回生成的IBO
    return ibo;
}
function resizeGlTextureImg(imgobj, size) {
    if (size === void 0) { size = null; }
    var w = imgobj.width;
    var h = imgobj.height;
    var log2 = Math['log2'] || function (value) {
        return Math.log(value) / Math.log(2);
    };
    if (!size) {
        if (w == h && (log2(w) % 1 == 0)) {
            return imgobj;
        }
        else {
            var canvas = document.createElement('canvas');
            canvas.width = canvas.height = size ? size : Math.pow(2, Math.ceil(log2(Math.max(w, h))));
            var ctx = canvas.getContext('2d');
            ctx.drawImage(imgobj, 0, 0, imgobj.width, imgobj.height, 0, 0, canvas.width, canvas.height);
            return canvas;
        }
    }
}
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/**
 * Created by yjh on 15/9/13.
 */
///<reference path='../lib/glHelper.ts'/>
///<reference path='eventBase.ts'/>
///<reference path='../lib/gl-matrix.d.ts'/>
var Engine;
(function (Engine) {
    var GAME;
    (function (GAME) {
        var NodeBase = (function (_super) {
            __extends(NodeBase, _super);
            function NodeBase() {
                _super.call(this);
                this.children = [];
                this.visible = true;
            }
            NodeBase.prototype.init = function (render) {
            };
            NodeBase.prototype.initCanvas = function () {
            };
            NodeBase.prototype.active = function () {
            };
            NodeBase.prototype.update = function (currentTime) {
                for (var i in this.children) {
                    var node = this.children[i];
                    if (!node.visible) {
                        continue;
                    }
                    if (node.identity != this.render.identity) {
                        node.active();
                        this.render.currentNode = node.identity;
                    }
                    node.update(currentTime);
                }
            };
            NodeBase.prototype.appendChild = function (child) {
                child.render = this.render;
                child.parent = this;
                child.gl = this.gl;
                child.ctx = this.ctx;
                if (this.isCanvas) {
                    child.initCanvas();
                }
                else {
                    child.init();
                }
                this.children.push(child);
            };
            NodeBase.prototype.insertChild = function (child, index) {
                if (index === void 0) { index = 0; }
                child.render = this.render;
                child.parent = this;
                child.gl = this.gl;
                child.ctx = this.ctx;
                if (this.isCanvas) {
                    child.initCanvas();
                }
                else {
                    child.init();
                }
                this.children.splice(index, 0, child);
            };
            NodeBase.prototype.removeChild = function (item) {
                delete this.children[this.children.indexOf(item)];
            };
            return NodeBase;
        })(Engine.EventBase);
        GAME.NodeBase = NodeBase;
        var DrawNode = (function (_super) {
            __extends(DrawNode, _super);
            function DrawNode() {
                _super.call(this);
                this.enableBlend = true;
            }
            DrawNode.prototype.initCanvas = function () {
            };
            DrawNode.prototype.init = function () {
                var vs = getShader(this.gl, true, this.vsText);
                var fs = getShader(this.gl, false, this.fsText);
                this.glProgram = getProgram(this.gl, vs, fs);
            };
            DrawNode.prototype.active = function () {
                if (this.isCanvas) {
                    return;
                }
                if (this.enableBlend != this.render.blendState) {
                    if (this.enableBlend) {
                        this.render.blendState = true;
                        this.gl.enable(this.gl.BLEND);
                        this.gl.disable(this.gl.DEPTH_TEST);
                    }
                    else {
                        this.gl.disable(this.gl.BLEND);
                        this.gl.enable(this.gl.DEPTH_TEST);
                    }
                }
                this.gl.useProgram(this.glProgram);
            };
            DrawNode.prototype.getUL = function (uniformName) {
                return this.gl.getUniformLocation(this.glProgram, uniformName);
            };
            DrawNode.prototype.getAL = function (attributeName) {
                return this.gl.getAttribLocation(this.glProgram, attributeName);
            };
            DrawNode.prototype.bindDynamicBufferAndAttrib = function (data, vbo, attribLoc, attribSize) {
                this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vbo);
                this.gl.bufferData(this.gl.ARRAY_BUFFER, data, this.gl.DYNAMIC_DRAW);
                this.gl.enableVertexAttribArray(attribLoc);
                this.gl.vertexAttribPointer(vbo, attribSize, this.gl.FLOAT, 0, 0, 0);
                this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
            };
            return DrawNode;
        })(NodeBase);
        GAME.DrawNode = DrawNode;
        var Object3D = (function (_super) {
            __extends(Object3D, _super);
            function Object3D() {
                _super.apply(this, arguments);
                this.isroot = false;
                this.position = vec3.create();
                this.rotate = vec3.create();
                this.scaleV = vec3.clone(new Float32Array([1, 1, 1]));
                this.worldMat = mat4.create();
                this.modelMat = mat4.create();
                this.mvpMat = mat4.create();
            }
            Object3D.prototype.update = function (currentTime) {
                if (!this.isroot) {
                    mat4.identity(this.modelMat);
                    mat4.rotate(this.modelMat, this.modelMat, 1, this.rotate);
                    mat4.scale(this.modelMat, this.modelMat, this.scaleV);
                    mat4.translate(this.modelMat, this.modelMat, this.position);
                    mat4.mul(this.worldMat, this.modelMat, this.parent.worldMat);
                    mat4.mul(this.mvpMat, this.render.vpMatrix, this.worldMat);
                }
                _super.prototype.update.call(this, currentTime);
            };
            Object.defineProperty(Object3D.prototype, "posX", {
                set: function (v) {
                    this.position[0] = v;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Object3D.prototype, "posY", {
                set: function (v) {
                    this.position[1] = v;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Object3D.prototype, "posZ", {
                set: function (v) {
                    this.position[2] = v;
                },
                enumerable: true,
                configurable: true
            });
            Object3D.prototype.translate = function (x, y, z) {
                this.position[0] += x;
                this.position[1] += y;
                this.position[2] += z;
            };
            Object.defineProperty(Object3D.prototype, "scale", {
                set: function (v) {
                    this.scaleV[0] = v;
                    this.scaleV[1] = v;
                    this.scaleV[2] = v;
                },
                enumerable: true,
                configurable: true
            });
            Object3D.prototype.rotateBy = function (x, y, z) {
                this.rotate[0] += x;
                this.rotate[1] += y;
                this.rotate[2] += z;
            };
            Object3D.prototype.rotateTo = function (x, y, z) {
                this.rotate[0] = x;
                this.rotate[1] = y;
                this.rotate[2] = z;
            };
            return Object3D;
        })(NodeBase);
        GAME.Object3D = Object3D;
    })(GAME = Engine.GAME || (Engine.GAME = {}));
})(Engine || (Engine = {}));
/**
 * Created by yjh on 15/9/29.
 */
///<reference path='render.ts'/>
var Engine;
(function (Engine) {
    var GAME;
    (function (GAME) {
        var Camera = (function (_super) {
            __extends(Camera, _super);
            function Camera() {
                _super.apply(this, arguments);
                this.isActive = false;
                this.viewMat = mat4.create();
                this.perspectiveMat = mat4.create();
                this.isroot = true;
            }
            Camera.prototype.init = function (render) {
                this.render = render;
            };
            Camera.prototype.setAsDefaultCamera = function () {
                if (this.render.defaultCamera) {
                    this.render.defaultCamera.isActive = false;
                }
                this.isActive = true;
                this.render.defaultCamera = this;
                this.render.viewMat = this.viewMat;
                this.render.perspectiveMat = this.perspectiveMat;
                this.render.eyePosition = this.position;
            };
            return Camera;
        })(GAME.Object3D);
        GAME.Camera = Camera;
        var PerspectiveCamera = (function (_super) {
            __extends(PerspectiveCamera, _super);
            function PerspectiveCamera(x, y, z, fov, near, far, aspect) {
                if (x === void 0) { x = 0; }
                if (y === void 0) { y = 0; }
                if (z === void 0) { z = 0; }
                if (fov === void 0) { fov = 80; }
                if (near === void 0) { near = 0.1; }
                if (far === void 0) { far = 300; }
                if (aspect === void 0) { aspect = null; }
                _super.call(this);
                this.center = vec3.create();
                this.headerUp = new Float32Array([0, 1, 0]);
                this.aspect = aspect;
                this.position[0] = x;
                this.position[1] = y;
                this.position[2] = z;
                this.fov = fov;
                this.near = near;
                this.far = far;
            }
            PerspectiveCamera.prototype.update = function () {
                if (this.isActive) {
                    //mat4.identity(this.viewMat);
                    mat4.lookAt(this.viewMat, this.position, this.center, this.headerUp);
                    mat4.perspective(this.perspectiveMat, this.fov, this.aspect || 1 / this.render.aspect, this.near, this.far);
                }
            };
            PerspectiveCamera.prototype.lookAt = function (center, headerUp) {
                vec3.copy(this.center, center);
                vec3.copy(this.headerUp, headerUp);
            };
            return PerspectiveCamera;
        })(Camera);
        GAME.PerspectiveCamera = PerspectiveCamera;
    })(GAME = Engine.GAME || (Engine.GAME = {}));
})(Engine || (Engine = {}));
/**
 * Created by yjh on 15/9/13.
 */
///<reference path='eventBase.ts'/>
///<reference path='drawNode.ts'/>
///<reference path='../lib/glHelper.ts'/>
///<reference path='camera.ts'/>
//绘图坐标使用相对坐标，以Height定为-1～1
var Engine;
(function (Engine) {
    (function (RenderEvent) {
        RenderEvent[RenderEvent["resize"] = 0] = "resize";
    })(Engine.RenderEvent || (Engine.RenderEvent = {}));
    var RenderEvent = Engine.RenderEvent;
    var GAME;
    (function (GAME) {
        var Render = (function (_super) {
            __extends(Render, _super);
            function Render(containor, forceUsingCanvas, p) {
                if (forceUsingCanvas === void 0) { forceUsingCanvas = false; }
                if (p === void 0) { p = window.devicePixelRatio; }
                _super.call(this);
                this.identity = 'root';
                this.drawCallCount = 0;
                this.vertexCount = 0;
                this.isroot = true;
                this.perspectiveMat = mat4.create();
                this.viewMat = mat4.create();
                this.vpMatrix = mat4.create();
                this.cameraList = [];
                this.p = p;
                this.canvas = document.createElement('canvas');
                containor.innerHTML = '';
                containor.appendChild(this.canvas);
                this.canvas.style.width = '100%';
                this.canvas.style.height = '100%';
                if (forceUsingCanvas) {
                    this.initCanvas();
                }
                else {
                    this.initGL();
                }
                this.render = this;
                this.resize();
                window.addEventListener('resize', this.onresize.bind(this));
            }
            Render.prototype.initGL = function () {
                this.gl = this.canvas.getContext('webgl');
                if (!this.gl) {
                    this.initCanvas();
                }
                this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
                var hf = this.gl.getExtension('OES_texture_half_float');
                this.gl.HALF_FLOAT = hf.HALF_FLOAT_OES;
                this.gl.getExtension('OES_texture_float');
                this.gl.clearColor(0.0, 0.0, 0.0, 0.0);
            };
            Render.prototype.initCanvas = function () {
                this.ctx = this.canvas.getContext('2d');
                this.isCanvas = true;
            };
            Render.prototype.onresize = function () {
                this.resize();
                this.dispatchEvent(RenderEvent.resize);
            };
            Render.prototype.resize = function () {
                this.canvas.width = (this.width = this.canvas.offsetWidth) * this.p;
                this.canvas.height = (this.height = this.canvas.offsetHeight) * this.p;
                this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
                this.aspect = this.height / this.width;
            };
            Render.prototype.addCamera = function (camera) {
                camera.init(this);
                this.cameraList.push(camera);
                camera.setAsDefaultCamera();
            };
            Render.prototype.removeCamera = function (camera) {
                var index = this.cameraList.indexOf(camera);
                if (index >= 0) {
                    this.cameraList.splice(index, 1);
                }
            };
            Render.prototype.update = function (currentTime) {
                this.drawCallCount = 0;
                this.vertexCount = 0;
                if (this.isCanvas) {
                    this.ctx.clearRect(0, 0, this.width, this.height);
                }
                else {
                    //this.gl.clear(this.gl.COLOR_BUFFER_BIT|this.gl.DEPTH_BUFFER_BIT);
                    for (var i in this.cameraList) {
                        this.cameraList[i].update(currentTime);
                    }
                    //mat4.invert(this.worldMat,this.viewMat);
                    mat4.mul(this.vpMatrix, this.perspectiveMat, this.viewMat);
                }
                _super.prototype.update.call(this, currentTime);
            };
            return Render;
        })(Engine.GAME.Object3D);
        GAME.Render = Render;
    })(GAME = Engine.GAME || (Engine.GAME = {}));
})(Engine || (Engine = {}));
var Engine;
(function (Engine) {
    var GAME;
    (function (GAME) {
        var PS;
        (function (PS) {
            var ShaderLib = (function () {
                function ShaderLib() {
                }
                ShaderLib.defaultVShader = "\nattribute vec2 position;\nvarying vec2 uv;\nvoid main() {\nuv=(position+1.0)*0.5;\ngl_Position=vec4(position,0.0,1.0);\n}\n";
                ShaderLib.particleFShader = "\nprecision mediump float;\nvarying float opacity;\nuniform float feather;\n#if (PARTICLE_TYPE==0)\n#else\nvarying vec2 vUvCoord;\n#endif\n#if (USE_TEXTURE==0)\nvarying vec4 color;\n#else\nuniform sampler2D particleTexture;\n#endif\nvoid main() {\n#if (PARTICLE_TYPE==0)\nvec2 uv=gl_PointCoord;\n#else\nvec2 uv=vUvCoord;\n#endif\n#if (USE_TEXTURE==0)\nvec4 fcolor=color;\n#else\nfcolor=texture2D(particleTexture,vUvCoord);\n#endif\n#if (SIMPLE_PARTICLE==0)\nfloat fopacity=1.0-2.0*distance(uv,vec2(0.5,0.5));\n//float fopacity=1.0-step(0.5,distance(uv,vec2(0.5,0.5)));\nfcolor.w=fcolor.w*fopacity;\ngl_FragColor=vec4(1.0,1.0,1.0,fopacity*opacity);\n#else\ngl_FragColor=vec4(1.0,1.0,1.0,1.0);\n#endif\n}";
                ShaderLib.particleVShader = "\n//#define PARTICLE_TYPE 0\n//#define totalTime 10.0\n/*#define PARTICLE_TYPE\n    0:pointSprite;\n    1:rectangle;\n    2:cube\n*/\n//#define USE_TEXTURE 0\nattribute vec2 uv;\nuniform float deltaTime;\nuniform float currentTime;\nuniform sampler2D positionTexture;\nuniform sampler2D staticTexture;\nuniform mat4 mvpMat;\nvarying float opacity;\n// \u8303\u56F4 0-10\nuniform float opacityEase;\nvec4 unpack(const in float depth)\n{\n    const vec4 bit_shift = vec4(256.0*256.0*256.0, 256.0*256.0, 256.0, 1.0);\n    const vec4 bit_mask  = vec4(0.0, 1.0/256.0, 1.0/256.0, 1.0/256.0);\n    vec4 res = fract(depth * bit_shift);\n    res -= res.xxyz * bit_mask;\n    return res;\n}\nfloat pack(const in vec4 rgba_depth)\n{\n    const vec4 bit_shift = vec4(1.0/(256.0*256.0*256.0), 1.0/(256.0*256.0), 1.0/256.0, 1.0);\n    float depth = dot(rgba_depth, bit_shift);\n    return depth;\n}\n#if (USE_TEXTURE==0)\nvarying vec4 color;\n#endif\n#if (PARTICLE_TYPE==0)\n#else\nattribute vec2 uvCoord;\nuniform float rotateSpeed;\nvarying vec2 vUvCoord;\nfloat lastRand=0.0;\n float rnd(){\n        lastRand=fract(11035.15245*lastRand+0.12345);\n        return lastRand;\n }\n float rnd_ext(){\n        return 2.0*rnd()-1.0;\n }\n mat4 rotationMatrix(vec3 axis, float angle){\n    axis = normalize(axis);\n    float s = sin(angle);\n    float c = cos(angle);\n    float oc = 1.0 - c;\n    return mat4(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,\n    oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,\n    oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,\n    0.0,                                0.0,                                0.0,                                1.0);   }\n#endif\nvoid main() {\n    vec4 position=texture2D(positionTexture,uv);\n    vec4 staticInfo=texture2D(staticTexture,uv);\n    float particleTime=mod(currentTime-staticInfo.z,totalTime);\n    if(particleTime>=staticInfo.w||position.w==0.0){\n            gl_Position=vec4(5.0,5.0,5.0,0.0);\n             return;\n          }\n    #if (PARTICLE_TYPE==0)\n        #else\n        lastRand=particleTime;\n        vec3 rotateDir=normalize(vec3(rnd_ext(),rnd_ext(),rnd_ext()));\n        position=position*rotationMatrix(rotateDir,particleTime*rotateSpeed);\n        vUvCoord=uvCoord;\n        #endif\n    position=mvpMat*position;\n     #if (PARTICLE_TYPE==0)\n        #if (SIMPLE_PARTICLE==0)\n                   gl_PointSize=clamp(staticInfo.x/position.z,1.0,10.0);\n        #else\n    gl_PointSize=1.0;\n#endif\n     #endif\n    #if (USE_TEXTURE==0)\n    color=unpack(position[3]);\n    #endif\n    float timeRatio=particleTime/staticInfo.w;\n    opacity=mix(pow(timeRatio,0.1*opacityEase),pow(1.0-timeRatio,0.1*opacityEase),timeRatio);\n    opacity=opacity/pow(gl_PointSize,0.3);\n    gl_Position=position;\n}";
                ShaderLib.positionFShader = "\nprecision mediump float;\nvarying vec2 uv;\nuniform highp float deltaTime;\nuniform highp float currentTime;\nuniform lowp sampler2D velocityTexture;\nuniform sampler2D positionTexture;\n//\u63CF\u8FF0\u7C92\u5B50\u57FA\u672C\u5C5E\u6027\uFF0Cx\u4E3A\u5927\u5C0F\uFF0C\uFF0Cz\u4E3A\u51FA\u751F\u65F6\u95F4\uFF0Cw\u4E3A\u5BFF\u547D\nuniform sampler2D staticTexture;\nuniform vec3 emitterPosition;\n#if (EMITTER_TYPE==0)\n#elif (EMITTER_TYPE==1)\n#elif (EMITTER_TYPE==2)\nuniform vec4 direction;\n#elif (EMITTER_TYPE==3)\n//half size;\nuniform vec3 emitterSize;\n#endif\n#if (USE_TEXTURE==0)\nuniform vec4 emitColor;\n#endif\nvec4 unpack(const in float depth)\n{\n    const vec4 bit_shift = vec4(256.0*256.0*256.0, 256.0*256.0, 256.0, 1.0);\n    const vec4 bit_mask  = vec4(0.0, 1.0/256.0, 1.0/256.0, 1.0/256.0);\n    vec4 res = fract(depth * bit_shift);\n    res -= res.xxyz * bit_mask;\n    return res;\n}\nfloat pack(const in vec4 rgba_depth)\n{\n    const vec4 bit_shift = vec4(1.0/(256.0*256.0*256.0), 1.0/(256.0*256.0), 1.0/256.0, 1.0);\n    float depth = dot(rgba_depth, bit_shift);\n    return depth;\n}\n float lastRand=0.0;\n float rnd(){\n        lastRand=fract(11035.15245*lastRand+0.12345);\n        return lastRand;\n }\n float rnd_ext(){\n        return 2.0*rnd()-1.0;\n }\nvoid main() {\nvec4 staticInfo=texture2D(staticTexture,uv);\nvec4 pos=texture2D(positionTexture,uv);\nfloat particleTime=mod(currentTime-staticInfo.z,totalTime);\n   //\u5BFF\u547D\u7ED3\u675F\n if(particleTime>staticInfo.w){\n    pos.w=0.0;\n    gl_FragColor=vec4(pos);\n    return;\n }\n //\u751F\u6210\u7C92\u5B50\n if(particleTime>0.0 && particleTime<=deltaTime){\n        #if (EMITTER_TYPE==0)\n         pos=vec4(emitterPosition,1.0);\n        #elif (EMITTER_TYPE==1)\n         pos=vec4(emitterPosition,1.0);\n        #elif (EMITTER_TYPE==2)\n        #elif (EMITTER_TYPE==3)\n        lastRand=staticInfo.y*fract(currentTime/totalTime);\n          pos=vec4(emitterPosition+vec3(rnd_ext()*emitterSize.x,rnd_ext()*emitterSize.y,rnd_ext()*emitterSize.z),1.0);\n        #endif\n     }\n vec4 v=texture2D(velocityTexture,uv);\n pos.xyz=pos.xyz+v.xyz*deltaTime;\n gl_FragColor=vec4(pos.xyz,v.w);\n}";
                ShaderLib.velocityFShader = "\n\n//#define totalTime 10\n/**\n#define EMITTER_TYPE\n0:point\n1:directional point\n2:plane\n3:volume\n**/\n//#define USE_WIND 0\n//#define EMITTER_TYPE 0\nprecision mediump float;\nvarying vec2 uv;\n uniform highp float deltaTime;\nuniform highp float currentTime;\nuniform vec3 gravity;\n//\u963B\u529B\u7CFB\u6570\nuniform float resistance;\nuniform sampler2D velocityTexture;\n//\u63CF\u8FF0\u7C92\u5B50\u57FA\u672C\u5C5E\u6027\uFF0Cx\u4E3A\u5927\u5C0F,y\u4E3A\u968F\u673A\u79CD\u5B50\uFF0Cz\u4E3A\u51FA\u751F\u65F6\u95F4\uFF0Cw\u4E3A\u5BFF\u547D\nuniform sampler2D staticTexture;\n#if (USE_WIND==1)\nuniform vec3 wind;\n#endif\nuniform float emitSpeed;\nuniform float emitVary;\nuniform float emitPercent;\nuniform float speedVary;\n#if (EMITTER_TYPE==0)\n#elif (EMITTER_TYPE==1)\nuniform vec4 direction;\n#elif (EMITTER_TYPE==2)\nuniform vec4 direction;\n#elif (EMITTER_TYPE==3)\n#endif\n highp float lastRand;\n float rnd(){\n        lastRand=fract(1103.515245*lastRand+0.12345);\n        return lastRand;\n }\n float rnd_ext(){\n        return 2.0*rnd()-1.0;\n }\nvoid main() {\n     mediump vec4 staticInfo=texture2D(staticTexture,uv);\n     lastRand=fract(staticInfo.y+currentTime/totalTime);\n     vec4 v=texture2D(velocityTexture,uv);\n     highp float particleTime=mod(currentTime-staticInfo.z,totalTime);\n        //\u5BFF\u547D\u7ED3\u675F\n      if(particleTime>staticInfo.w){\n      gl_FragColor=vec4(0.0,0.0,0.0,0.0);\n         return;\n      }\n      highp float offsetTime=mod(currentTime,totalTime)-staticInfo.z;\n     if(offsetTime<deltaTime&&offsetTime>0.0){\n     if(rnd()>emitPercent){\n     gl_FragColor=vec4(0.0,0.0,0.0,0.0);\n     return;\n     }\n        #if (EMITTER_TYPE==0)\n            vec3 dir=normalize(vec3(rnd_ext(),rnd_ext(),rnd_ext()));\n        #elif (EMITTER_TYPE==1)\n            vec3 dir=normalize(direction.xyz+direction.w*vec3(rnd_ext(),rnd_ext(),rnd_ext()));\n        #elif (EMITTER_TYPE==2)\n            vec3 dir=normalize(direction.xyz+direction.w*vec3(rnd_ext(),rnd_ext(),rnd_ext()));\n        #elif (EMITTER_TYPE==3)\n            vec3 dir=normalize(vec3(rnd_ext(),rnd_ext(),rnd_ext()));\n        #endif\n       v.xyz=dir*emitSpeed*(1.0+emitVary*rnd_ext());\n       v.w=1.0;\n     }\n     vec3 a=-gravity;\n     a=a+vec3(rnd_ext(),rnd_ext(),rnd_ext())*speedVary*v.xyz;\n     #if (USE_WIND==1)\n     a=a-edge(v.xyz,0.001)*0.5*pow(v.xyz-wind,2.0)*resistance*staticInfo.x*staticInfo.x;\n     #else\n     a=a-step(0.001,v.xyz)*0.5*v.xyz*v.xyz*resistance*staticInfo.x*staticInfo.x;\n     #endif\n     v.xyz=v.xyz+a*deltaTime;\ngl_FragColor=v;\n }\n";
                ShaderLib.defaultFShader = "\nprecision mediump float;\nvarying vec2 uv;\nuniform sampler2D texture;\nvoid main() {\nvec4 color=texture2D(texture,uv);\ncolor.w=1.0;\ngl_FragColor=color;\n}\n";
                return ShaderLib;
            })();
            PS.ShaderLib = ShaderLib;
        })(PS = GAME.PS || (GAME.PS = {}));
    })(GAME = Engine.GAME || (Engine.GAME = {}));
})(Engine || (Engine = {}));
/**
 * Created by yjh on 15/10/7.
 */
///<reference path='../drawNode.ts'/>
///<reference path='gpuParticleSystemShaders.ts'/>
var Engine;
(function (Engine) {
    var GAME;
    (function (GAME) {
        var PS;
        (function (PS) {
            (function (ParticleType) {
                ParticleType[ParticleType["point"] = 0] = "point";
                ParticleType[ParticleType["rectangle"] = 1] = "rectangle";
            })(PS.ParticleType || (PS.ParticleType = {}));
            var ParticleType = PS.ParticleType;
            (function (EmitterType) {
                EmitterType[EmitterType["point"] = 0] = "point";
                EmitterType[EmitterType["directional"] = 1] = "directional";
                EmitterType[EmitterType["plane"] = 2] = "plane";
                EmitterType[EmitterType["volume_cube"] = 3] = "volume_cube";
                EmitterType[EmitterType["volume_Sphere"] = 4] = "volume_Sphere";
            })(PS.EmitterType || (PS.EmitterType = {}));
            var EmitterType = PS.EmitterType;
            var GpuParticleSystem = (function (_super) {
                __extends(GpuParticleSystem, _super);
                function GpuParticleSystem(maxParticlePerSec, emitSpeed, size, life, lifeVary, sizeVary, sizeLevel, particleType, useTexture, emitterType, useWind, gravity, speedVary) {
                    if (lifeVary === void 0) { lifeVary = 0.1; }
                    if (sizeVary === void 0) { sizeVary = 0.1; }
                    if (sizeLevel === void 0) { sizeLevel = 8; }
                    if (particleType === void 0) { particleType = ParticleType.point; }
                    if (useTexture === void 0) { useTexture = false; }
                    if (emitterType === void 0) { emitterType = EmitterType.point; }
                    if (useWind === void 0) { useWind = false; }
                    if (gravity === void 0) { gravity = [0, 0, 0]; }
                    if (speedVary === void 0) { speedVary = 10; }
                    _super.call(this);
                    this.emitColor = [1, 1, 1, 1];
                    this.compileFlags = {
                        'totalTime': 0,
                        'PARTICLE_TYPE': 0,
                        'USE_TEXTURE': 0,
                        'EMITTER_TYPE': 0,
                        'USE_WIND': 0,
                        'SIMPLE_PARTICLE': 0
                    };
                    this.particleProperty = {
                        size: 10,
                        sizeVary: 0.1,
                        life: 10,
                        lifeVary: 0.1,
                        speedVary: 0.01
                    };
                    this.emitVary = 0;
                    this.emitSpeed = 1;
                    this.emitPercent = 1;
                    this.wind = vec3.create();
                    this.emitPosition = vec3.create();
                    this.lastTime = 0;
                    this.startTime = 0;
                    this.maxCountSqrt = Math.pow(2, sizeLevel);
                    this.maxCount = Math.pow(this.maxCountSqrt, 2);
                    this.compileFlags['totalTime'] = maxParticlePerSec ? this.maxCount / maxParticlePerSec : Math.pow(2, 64);
                    this.compileFlags['PARTICLE_TYPE'] = particleType;
                    this.compileFlags['USE_TEXTURE'] = !!useTexture ? 1 : 0;
                    this.compileFlags['EMITTER_TYPE'] = emitterType;
                    this.compileFlags['USE_WIND'] = !!useWind ? 1 : 0;
                    this.particleProperty.size = size;
                    this.particleProperty.sizeVary = sizeVary;
                    this.particleProperty.life = life;
                    this.particleProperty.lifeVary = lifeVary;
                    this.particleProperty.speedVary = speedVary;
                    this.emitSpeed = emitSpeed;
                    this.gravity = gravity;
                    this.particlePerSec = maxParticlePerSec;
                }
                GpuParticleSystem.prototype.getCompileFlags = function () {
                    var result = '';
                    for (var i in this.compileFlags) {
                        result += "#define " + i + " " + this.compileFlags[i] + "\n";
                    }
                    return result;
                };
                GpuParticleSystem.prototype.init = function () {
                    var flags = this.getCompileFlags();
                    this.gl.activeTexture(this.gl.TEXTURE0);
                    var staticInfo = new Float32Array(this.maxCount * 4);
                    var size = this.particleProperty.size * this.render.p;
                    var sizeVary = this.particleProperty.sizeVary;
                    var totalTime = this.maxCount / this.particlePerSec;
                    var life = this.particleProperty.life;
                    var lifeVary = this.particleProperty.lifeVary;
                    for (var i = 0; i < this.maxCount; i++) {
                        staticInfo[4 * i] = size * (1 + sizeVary * (Math.random() * 2 - 1));
                        staticInfo[4 * i + 1] = Math.random();
                        staticInfo[4 * i + 2] = i / this.maxCount * this.compileFlags.totalTime;
                        staticInfo[4 * i + 3] = life * (1 + lifeVary * (Math.random() * 2 - 1));
                    }
                    this.staticInfoTexture = this.gl.createTexture();
                    this.gl.bindTexture(this.gl.TEXTURE_2D, this.staticInfoTexture);
                    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
                    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
                    this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.maxCountSqrt, this.maxCountSqrt, 0, this.gl.RGBA, this.gl.FLOAT, staticInfo);
                    this.defaultPositionVBO = getVBO(this.gl, [-1, -1, 1, -1, 1, 1, -1, -1, 1, 1, -1, 1]);
                    this.initPositionProgram(flags);
                    this.initVelocityProgram(flags);
                    this.initParticleProgram(flags);
                    this.defaultProgram = getProgramByShaderSource(this.gl, PS.ShaderLib.defaultVShader, PS.ShaderLib.defaultFShader);
                    this.dfPosAL = this.gl.getAttribLocation(this.defaultProgram, 'position');
                    this.dfTextureUL = this.gl.getUniformLocation(this.defaultProgram, 'texture');
                };
                GpuParticleSystem.prototype.initParticleProgram = function (flags) {
                    this.renderParticleProgram = getProgramByShaderSource(this.gl, flags + PS.ShaderLib.particleVShader, flags + PS.ShaderLib.particleFShader);
                    this.ppUvCoordAL = this.gl.getAttribLocation(this.renderParticleProgram, 'uvCoord');
                    this.ppUvAL = this.gl.getAttribLocation(this.renderParticleProgram, 'uv');
                    this.ppRotateSpeedUL = this.gl.getUniformLocation(this.renderParticleProgram, 'rotateSpeed');
                    this.ppRotateSpeedUL = this.gl.getUniformLocation(this.renderParticleProgram, 'rotateSpeed');
                    this.ppDeltaTimeUL = this.gl.getUniformLocation(this.renderParticleProgram, 'deltaTime');
                    this.ppCurrentTimeUL = this.gl.getUniformLocation(this.renderParticleProgram, 'currentTime');
                    this.ppPositionTextureUL = this.gl.getUniformLocation(this.renderParticleProgram, 'positionTexture');
                    this.ppStaticTextureUL = this.gl.getUniformLocation(this.renderParticleProgram, 'staticTexture');
                    this.ppMvpMatUL = this.gl.getUniformLocation(this.renderParticleProgram, 'mvpMat');
                    this.ppOpacityUL = this.gl.getUniformLocation(this.renderParticleProgram, 'opacity');
                    this.ppOpacityEaseUL = this.gl.getUniformLocation(this.renderParticleProgram, 'opacityEase');
                    this.ppFeatherUL = this.gl.getUniformLocation(this.renderParticleProgram, 'feature');
                    this.ppParticleTextureUL = this.gl.getUniformLocation(this.renderParticleProgram, 'particleTextureUL');
                    var mul;
                    var iboarray;
                    switch (this.compileFlags.PARTICLE_TYPE) {
                        case 0: {
                            mul = 2;
                            iboarray = new Uint16Array(this.maxCount);
                            for (var i = 0; i < this.maxCount; i++) {
                                iboarray[i] = i;
                            }
                            break;
                        }
                        case 1: {
                            mul = 8;
                        }
                    }
                    var uvBuffer = new Float32Array(this.maxCount * 2);
                    //var uvCoordBuffer=new Float32Array(this.maxCount*2);
                    var unit = 1 / this.maxCountSqrt;
                    for (var x = 0; x < this.maxCountSqrt; x++) {
                        for (var y = 0; y < this.maxCountSqrt; y++) {
                            var pos = 2 * (this.maxCountSqrt * y + x);
                            uvBuffer[pos] = x * unit;
                            uvBuffer[pos + 1] = y * unit;
                        }
                    }
                    this.ppUvVBO = getVBO(this.gl, uvBuffer);
                    this.ppIBO = getIBO(this.gl, iboarray);
                };
                GpuParticleSystem.prototype.initPositionProgram = function (flags) {
                    this.updatePositionProgram = getProgramByShaderSource(this.gl, flags + PS.ShaderLib.defaultVShader, flags + PS.ShaderLib.positionFShader);
                    this.positionTexture = this.gl.createTexture();
                    this.gl.bindTexture(this.gl.TEXTURE_2D, this.positionTexture);
                    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
                    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
                    this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.maxCountSqrt, this.maxCountSqrt, 0, this.gl.RGBA, this.gl.HALF_FLOAT, null);
                    this.positionTextureFbo = this.gl.createFramebuffer();
                    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.positionTextureFbo);
                    this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, this.positionTexture, 0);
                    this.bufferPositionTexture = this.gl.createTexture();
                    this.gl.bindTexture(this.gl.TEXTURE_2D, this.bufferPositionTexture);
                    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
                    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
                    this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.maxCountSqrt, this.maxCountSqrt, 0, this.gl.RGBA, this.gl.HALF_FLOAT, null);
                    this.bufferPositionTextureFbo = this.gl.createFramebuffer();
                    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.bufferPositionTextureFbo);
                    this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, this.bufferPositionTexture, 0);
                    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
                    this.pospPositonAL = this.gl.getAttribLocation(this.updatePositionProgram, 'position');
                    this.pospDeltaTimeUl = this.gl.getUniformLocation(this.updatePositionProgram, 'deltaTime');
                    this.pospCurrentTimeUl = this.gl.getUniformLocation(this.updatePositionProgram, 'currentTime');
                    this.pospVelocityTextureUL = this.gl.getUniformLocation(this.updatePositionProgram, 'velocityTexture');
                    this.pospPositionTextureUL = this.gl.getUniformLocation(this.updatePositionProgram, 'positionTexture');
                    this.pospStaicTextureUL = this.gl.getUniformLocation(this.updatePositionProgram, 'staticTexture');
                    this.pospDirectionUL = this.gl.getUniformLocation(this.updatePositionProgram, 'direction');
                    this.pospEmitterPositionUL = this.gl.getUniformLocation(this.updatePositionProgram, 'emitterPosition');
                    this.pospEmitterSizeUL = this.gl.getUniformLocation(this.updatePositionProgram, 'emitterSize');
                    this.pospEmitColorUL = this.gl.getUniformLocation(this.updatePositionProgram, 'emitColor');
                };
                GpuParticleSystem.prototype.initVelocityProgram = function (flags) {
                    this.updateVelocityProgram = getProgramByShaderSource(this.gl, flags + PS.ShaderLib.defaultVShader, flags + PS.ShaderLib.velocityFShader);
                    this.velocityTexture = this.gl.createTexture();
                    this.gl.bindTexture(this.gl.TEXTURE_2D, this.velocityTexture);
                    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
                    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
                    this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.maxCountSqrt, this.maxCountSqrt, 0, this.gl.RGBA, this.gl.HALF_FLOAT, null);
                    this.velocityTextureFbo = this.gl.createFramebuffer();
                    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.velocityTextureFbo);
                    this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, this.velocityTexture, 0);
                    this.bufferVelocityTexture = this.gl.createTexture();
                    this.bufferVelocityTexture['buffer'] = 1;
                    this.gl.bindTexture(this.gl.TEXTURE_2D, this.bufferVelocityTexture);
                    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
                    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
                    this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.maxCountSqrt, this.maxCountSqrt, 0, this.gl.RGBA, this.gl.HALF_FLOAT, null);
                    this.bufferVelocityTextureFbo = this.gl.createFramebuffer();
                    this.bufferPositionTextureFbo['buffer'] = 1;
                    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.bufferVelocityTextureFbo);
                    this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, this.bufferVelocityTexture, 0);
                    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
                    this.velpPositionAL = this.gl.getAttribLocation(this.updateVelocityProgram, 'position');
                    this.velpDeltaTimeUL = this.gl.getUniformLocation(this.updateVelocityProgram, 'deltaTime');
                    this.velpCurrentTimeUL = this.gl.getUniformLocation(this.updateVelocityProgram, 'currentTime');
                    this.velpGravityUL = this.gl.getUniformLocation(this.updateVelocityProgram, 'gravity');
                    this.velpResistanceUL = this.gl.getUniformLocation(this.updateVelocityProgram, 'resistance');
                    this.velpVelocityTextureUL = this.gl.getUniformLocation(this.updateVelocityProgram, 'velocityTexture');
                    this.velpStaticTextureUL = this.gl.getUniformLocation(this.updateVelocityProgram, 'staticTexture');
                    this.velpWindUL = this.gl.getUniformLocation(this.updateVelocityProgram, 'wind');
                    this.velpEmitSpeedUL = this.gl.getUniformLocation(this.updateVelocityProgram, 'emitSpeed');
                    this.velpEmitVaryUL = this.gl.getUniformLocation(this.updateVelocityProgram, 'emitVary');
                    this.velpSpeedVaryUL = this.gl.getUniformLocation(this.updateVelocityProgram, 'speedVary');
                    this.velpDirectionUL = this.gl.getUniformLocation(this.updateVelocityProgram, 'direction');
                    this.velpEmitPercentUL = this.gl.getUniformLocation(this.updateVelocityProgram, 'emitPercent');
                };
                GpuParticleSystem.prototype.updatePositionTexture = function (deltaTime, currentTime) {
                    var gl = this.gl;
                    this.gl.useProgram(this.updatePositionProgram);
                    this.gl.disable(this.gl.BLEND);
                    var tmp = this.positionTexture;
                    this.positionTexture = this.bufferPositionTexture;
                    this.bufferPositionTexture = tmp;
                    tmp = this.positionTextureFbo;
                    this.positionTextureFbo = this.bufferPositionTextureFbo;
                    this.bufferPositionTextureFbo = tmp;
                    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.positionTextureFbo);
                    this.gl.activeTexture(this.gl.TEXTURE0);
                    this.gl.bindTexture(this.gl.TEXTURE_2D, this.bufferPositionTexture);
                    this.gl.activeTexture(this.gl.TEXTURE1);
                    this.gl.bindTexture(this.gl.TEXTURE_2D, this.velocityTexture);
                    this.gl.activeTexture(this.gl.TEXTURE2);
                    this.gl.bindTexture(this.gl.TEXTURE_2D, this.staticInfoTexture);
                    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.defaultPositionVBO);
                    this.gl.enableVertexAttribArray(this.pospPositonAL);
                    this.gl.vertexAttribPointer(this.pospPositonAL, 2, this.gl.FLOAT, false, 0, 0);
                    this.gl.uniform1f(this.pospDeltaTimeUl, deltaTime);
                    this.gl.uniform1f(this.pospCurrentTimeUl, currentTime);
                    this.gl.uniform1i(this.pospVelocityTextureUL, 1);
                    this.gl.uniform1i(this.pospPositionTextureUL, 0);
                    this.gl.uniform1i(this.pospStaicTextureUL, 2);
                    this.gl.uniform3fv(this.pospEmitterPositionUL, this.emitPosition);
                    if (this.compileFlags.EMITTER_TYPE == 2) {
                    }
                    if (this.compileFlags.EMITTER_TYPE == 3) {
                    }
                    if (this.compileFlags.USE_TEXTURE == 0) {
                        this.gl.uniform4fv(this.pospEmitColorUL, this.emitColor);
                    }
                    this.gl.viewport(0, 0, this.maxCountSqrt, this.maxCountSqrt);
                    this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
                    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
                    //this.gl.drawArrays(this.gl.TRIANGLES,0,6);
                };
                GpuParticleSystem.prototype.updateVelocityTexture = function (deltaTime, currentTime) {
                    var gl = this.gl;
                    this.gl.useProgram(this.updateVelocityProgram);
                    this.gl.disable(this.gl.BLEND);
                    var tmp = this.velocityTexture;
                    this.velocityTexture = this.bufferVelocityTexture;
                    this.bufferVelocityTexture = tmp;
                    var tmp = this.velocityTextureFbo;
                    this.velocityTextureFbo = this.bufferVelocityTextureFbo;
                    this.bufferVelocityTextureFbo = tmp;
                    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.velocityTextureFbo);
                    this.gl.activeTexture(this.gl.TEXTURE0);
                    this.gl.bindTexture(this.gl.TEXTURE_2D, this.bufferVelocityTexture);
                    this.gl.activeTexture(this.gl.TEXTURE1);
                    this.gl.bindTexture(this.gl.TEXTURE_2D, this.staticInfoTexture);
                    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.defaultPositionVBO);
                    this.gl.enableVertexAttribArray(this.velpPositionAL);
                    this.gl.vertexAttribPointer(this.velpPositionAL, 2, this.gl.FLOAT, false, 0, 0);
                    this.gl.uniform1f(this.velpDeltaTimeUL, deltaTime);
                    this.gl.uniform1f(this.velpCurrentTimeUL, currentTime);
                    this.gl.uniform1i(this.velpVelocityTextureUL, 0);
                    this.gl.uniform1i(this.velpStaticTextureUL, 1);
                    this.gl.uniform1f(this.velpSpeedVaryUL, this.particleProperty.speedVary);
                    this.gl.uniform1f(this.velpEmitVaryUL, this.emitVary);
                    this.gl.uniform1f(this.velpEmitSpeedUL, this.emitSpeed);
                    this.gl.uniform3fv(this.velpGravityUL, this.gravity);
                    this.gl.uniform1f(this.velpEmitPercentUL, this.emitPercent);
                    if (this.compileFlags.USE_WIND == 1) {
                        this.gl.uniform3fv(this.velpWindUL, this.wind);
                    }
                    //todo emitter type
                    this.gl.viewport(0, 0, this.maxCountSqrt, this.maxCountSqrt);
                    this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
                    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
                };
                GpuParticleSystem.prototype.drawParticle = function (deltaTime, currentTime) {
                    this.gl.useProgram(this.renderParticleProgram);
                    bindAttribute(this.gl, this.gl.ppUvAL, 2, this.ppUvVBO);
                    this.gl.activeTexture(this.gl.TEXTURE0);
                    this.gl.bindTexture(this.gl.TEXTURE_2D, this.positionTexture);
                    this.gl.activeTexture(this.gl.TEXTURE1);
                    this.gl.bindTexture(this.gl.TEXTURE_2D, this.staticInfoTexture);
                    this.gl.uniform1i(this.ppPositionTextureUL, 0);
                    this.gl.uniform1i(this.ppStaticTextureUL, 1);
                    this.gl.uniform1f(this.ppDeltaTimeUL, deltaTime);
                    this.gl.uniform1f(this.ppCurrentTimeUL, currentTime);
                    this.gl.uniformMatrix4fv(this.ppMvpMatUL, false, this.mvpMat);
                    this.gl.uniform1f(this.ppFeatherUL, 0);
                    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.ppIBO);
                    this.gl.enable(this.gl.BLEND);
                    this.gl.drawElements(this.gl.POINTS, this.maxCount, this.gl.UNSIGNED_SHORT, 0);
                };
                GpuParticleSystem.prototype.update = function (current) {
                    _super.prototype.update.call(this, current);
                    var currentTime = current * 0.001;
                    if (!this.startTime) {
                        this.startTime = currentTime;
                    }
                    currentTime -= this.startTime;
                    var deltaTime;
                    deltaTime = this.lastTime ? currentTime - this.lastTime : 0;
                    this.lastTime = currentTime;
                    this.updateVelocityTexture(deltaTime, currentTime);
                    this.updatePositionTexture(deltaTime, currentTime);
                    this.gl.useProgram(this.defaultProgram);
                    bindAttribute(this.gl, this.dfPosAL, 2, this.defaultPositionVBO);
                    this.gl.activeTexture(this.gl.TEXTURE0);
                    this.gl.viewport(0, 0, this.render.width * this.render.p, this.render.height * this.render.p);
                    //this.gl.bindTexture(this.gl.TEXTURE_2D,this.velocityTexture);
                    //this.gl.uniform1i(this.dfTextureUL,0);
                    //this.gl.drawArrays(this.gl.TRIANGLES,0,6);
                    this.drawParticle(deltaTime, currentTime);
                };
                return GpuParticleSystem;
            })(GAME.Object3D);
            PS.GpuParticleSystem = GpuParticleSystem;
        })(PS = GAME.PS || (GAME.PS = {}));
    })(GAME = Engine.GAME || (Engine.GAME = {}));
})(Engine || (Engine = {}));
/**
 * Created by yjh on 15/9/13.
 */
///<reference path='render.ts'/>
///<reference path='particleSystem/gpuParticleSystem.ts'/>
///<reference path='particleSystem/gpuParticleSystemShaders.ts'/>
"use strict";
//# sourceMappingURL=build.js.map