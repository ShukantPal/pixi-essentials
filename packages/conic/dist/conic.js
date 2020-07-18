/*!
 * @pixi-essentials/conic - v1.0.0
 * Compiled Sat, 18 Jul 2020 22:18:12 UTC
 *
 * @pixi-essentials/conic is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 */
this.PIXI=this.PIXI||{};var _pixi_essentials_conic=function(n,t,e,r,i,o){"use strict";var a=new t.AttributeRedirect({source:"vertexData",attrib:"aWorldPosition",type:"float32",size:2,glType:e.TYPES.FLOAT,glSize:2}),s=new t.AttributeRedirect({source:"uvData",attrib:"aTexturePosition",type:"float32",size:2,glType:e.TYPES.FLOAT,glSize:2}),c=new t.UniformRedirect({source:"k",uniform:"k"}),l=new t.UniformRedirect({source:"l",uniform:"l"}),u=new t.UniformRedirect({source:"m",uniform:"m"}),v=new t.BatchShaderFactory("#version 100\n#define SHADER_NAME Conic-Renderer-Fallback-Shader\n\nprecision mediump float;\n\nattribute vec2 aWorldPosition;\nattribute vec2 aTexturePosition;\nattribute float aMasterID;\nattribute float aUniformID;\n\nuniform mat3 projectionMatrix;\n\nvarying vec2 vWorldCoord;\nvarying vec2 vTextureCoord;\nvarying float vMasterID;\nvarying float vUniformID;\n\nvoid main(void)\n{\n    gl_Position = vec4((projectionMatrix * vec3(aWorldPosition, 1)).xy, 0, 1);\n\n    vWorldCoord = gl_Position.xy;\n    vTextureCoord = aTexturePosition;\n    vMasterID = aMasterID;\n    vUniformID = aUniformID;\n}","#version 100\n#ifdef GL_OES_standard_derivatives\n    #extension GL_OES_standard_derivatives : enable\n#endif\n#define SHADER_NAME Conic-Renderer-Fallback-Shader\n\nprecision mediump float;\n\nuniform sampler2D uSamplers[%texturesPerBatch%];\n\nvarying vec2 vWorldCoord;\nvarying vec2 vTextureCoord;\nvarying float vMasterID;\nvarying float vUniformID;\n\nuniform vec3 k[%uniformsPerBatch%];\nuniform vec3 l[%uniformsPerBatch%];\nuniform vec3 m[%uniformsPerBatch%];\nuniform bool inside;\n\nfloat sampleCurve(vec2 point, vec3 kv, vec3 lv, vec3 mv)\n{\n    float k = dot(vec3(vTextureCoord, 1), kv);\n    float l = dot(vec3(vTextureCoord, 1), lv);\n    float m = dot(vec3(vTextureCoord, 1), mv);\n\n    return k*k - l*m;\n}\n\nvoid main(void)\n{\n    vec3 kv, lv, mv;\n\n    for (int i = 0; i < %uniformsPerBatch%; i++)\n    {\n        if (float(i) > vUniformID - 0.5) \n        {\n            kv = k[i];\n            lv = l[i];\n            mv = m[i];\n            break;\n        }\n    }\n\n    float k_ = dot(vec3(vTextureCoord, 1), kv);\n    float l_ = dot(vec3(vTextureCoord, 1), lv);\n    float m_ = dot(vec3(vTextureCoord, 1), mv);\n\n    float cv = k_ * k_ - l_ * m_;\n\n#ifdef GL_OES_standard_derivatives\n    float cvdx = dFdx(cv);\n    float cvdy = dFdy(cv);\n    vec2 gradientTangent = vec2(cvdx, cvdy);\n\n    float signedDistance = cv / length(gradientTangent);\n    bool antialias = signedDistance > -1. && signedDistance < 1.;\n#endif\n\n    vec4 color;\n\n    if ((inside && cv < 0.) || (!inside && cv >= 0.) \n#ifdef GL_OES_standard_derivatives\n            || antialias\n#endif\n    )\n    {\n        for (int i = 0; i < %texturesPerBatch%; i++)\n        {\n            if (float(i) > vMasterID - 0.5)\n            {\n                color = texture2D(uSamplers[i], vTextureCoord);\n                break;\n            }\n        }\n    }\n    else\n    {\n        color = vec4(0, 0, 0, 0);\n    }\n\n#ifdef GL_OES_standard_derivatives\n    if (antialias)\n    {\n        float weight = inside ? (1. - signedDistance) / 2. : (1. + signedDistance) / 2.;\n        \n        color = weight * color + (1. - weight) * vec4(0, 0, 0, 0);\n    }\n#endif\n\n    gl_FragColor = color;\n}",{inside:!0}).derive(),f=new t.BatchShaderFactory("#version 300 es\n\n#define SHADER_NAME Conic-Renderer-Shader\n\nprecision mediump float;\n\nin vec2 aWorldPosition;\nin vec2 aTexturePosition;\nin float aMasterID;\nin float aUniformID;\n\nuniform mat3 projectionMatrix;\n\nout vec2 vWorldCoord;\nout vec2 vTextureCoord;\nout float vMasterID;\nout float vUniformID;\n\nvoid main(void)\n{\n    gl_Position = vec4((projectionMatrix * vec3(aWorldPosition, 1)).xy, 0, 1);\n\n    vWorldCoord = gl_Position.xy;\n    vTextureCoord = aTexturePosition;\n    vMasterID = aMasterID;\n    vUniformID = aUniformID;\n}","#version 300 es\n#define SHADER_NAME Conic-Renderer-Shader\n\nprecision mediump float;\n\nuniform sampler2D uSamplers[%texturesPerBatch%];\n\nin vec2 vWorldCoord;\nin vec2 vTextureCoord;\nin float vMasterID;\nin float vUniformID;\n\nout vec4 fragmentColor;\n\nuniform vec3 k[%uniformsPerBatch%];\nuniform vec3 l[%uniformsPerBatch%];\nuniform vec3 m[%uniformsPerBatch%];\nuniform bool inside;\n\nvoid main(void)\n{\n    vec3 kv, lv, mv;\n\n    for (int i = 0; i < %uniformsPerBatch%; i++)\n    {\n        if (float(i) > vUniformID - 0.5) \n        {\n            kv = k[i];\n            lv = l[i];\n            mv = m[i];\n            break;\n        }\n    }\n\n    float k_ = dot(vec3(vTextureCoord, 1), kv);\n    float l_ = dot(vec3(vTextureCoord, 1), lv);\n    float m_ = dot(vec3(vTextureCoord, 1), mv);\n\n    float cv = k_ * k_ - l_ * m_;\n\n    float cvdx = dFdx(cv);\n    float cvdy = dFdy(cv);\n    vec2 gradientTangent = vec2(cvdx, cvdy);\n\n    float signedDistance = cv / length(gradientTangent);\n    bool antialias = signedDistance > -1. && signedDistance < 1.;\n\n    vec4 color;\n\n    if ((inside && cv < 0.) || (!inside && cv >= 0.) || antialias)\n    {\n        for (int i = 0; i < %texturesPerBatch%; i++)\n        {\n            if (float(i) > vMasterID - 0.5)\n            {\n                color = texture(uSamplers[i], vTextureCoord);\n                break;\n            }\n        }\n    }\n    else\n    {\n        color = vec4(0, 0, 0, 0);\n    }\n\n    if (antialias)\n    {\n        float weight = inside ? (1. - signedDistance) / 2. : (1. + signedDistance) / 2.;\n        \n        color = weight * color + (1. - weight) * vec4(0, 0, 0, 0);\n    }\n\n    fragmentColor = color;\n}",{inside:!0}).derive(),d=t.BatchRendererPluginFactory.from({attribSet:[a,s],uniformSet:[c,l,u],indexProperty:"indexData",textureProperty:"_texture",texIDAttrib:"aMasterID",uniformIDAttrib:"aUniformID",inBatchIDAttrib:"aBatchID",shaderFunction:function(n){var t=n.renderer,e=t.context;return 1!==e.webGLVersion||e.extensions.standardDerivatives||(e.extensions.standardDerivatives=t.gl.getExtension("OES_standard_derivatives")),1===e.webGLVersion?v(n):f(n)},BatchFactoryClass:t.AggregateUniformsBatchFactory});r.Renderer.registerPlugin("conic",d);var m=d,h=Math.sqrt(2),p=function(){function n(){this.k=[1,0,0],this.l=[0,1,0],this.m=[0,0,1],this.controlPoints=[new i.Point(0,0),new i.Point(.5,0),new i.Point(1,1)],this._dirtyID=0}return n.prototype.setk=function(n,t,e){return this.k[0]=n,this.k[1]=t,this.k[2]=e,this._dirtyID++,this},n.prototype.setl=function(n,t,e){return this.l[0]=n,this.l[1]=t,this.l[2]=e,this._dirtyID++,this},n.prototype.setm=function(n,t,e){return this.m[0]=n,this.m[1]=t,this.m[2]=e,this._dirtyID++,this},n.prototype.setControlPoints=function(n,t,e){this.controlPoints[0]=n,this.controlPoints[1]=t,this.controlPoints[2]=e},n.prototype.update=function(){return this._dirtyID++,this},n.createCircle=function(t){var e=new n;return e.setk(1/h,1/h,-t/h),e.setl(1,0,0),e.setm(0,1,0),e},n.createEllipse=function(t,e){var r=new n;return r.setk(1/t,1/e,-1),r.setl(2/t,0,0),r.setm(0,1/e,0),r},n.createParabola=function(t){var e=new n;return e.setk(1,0,0),e.setl(0,4*t,0),e.setm(0,0,1),e},n.createHyperbola=function(t,e){var r=new n;return r.setk(0,0,1),r.setl(-1/t,1/e,0),r.setm(1/t,1/e,0),r},n}(),y=function(n,t){return(y=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(n,t){n.__proto__=t}||function(n,t){for(var e in t)t.hasOwnProperty(e)&&(n[e]=t[e])})(n,t)};var g={adjoint:function(n,t){var e=t[0],r=t[1],i=t[2],o=t[3],a=t[4],s=t[5],c=t[6],l=t[7],u=t[8];return n[0]=a*u-s*l,n[1]=i*l-r*u,n[2]=r*s-i*a,n[3]=s*c-o*u,n[4]=e*u-i*c,n[5]=i*o-e*s,n[6]=o*l-a*c,n[7]=r*c-e*l,n[8]=e*a-r*o,n},clone:function(n){var t=new Float32Array(9);return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t},copy:function(n,t){return n[0]=t[0],n[1]=t[1],n[2]=t[2],n[3]=t[3],n[4]=t[4],n[5]=t[5],n[6]=t[6],n[7]=t[7],n[8]=t[8],n},create:function(){var n=new Float32Array(9);return n[0]=1,n[1]=0,n[2]=0,n[3]=0,n[4]=1,n[5]=0,n[6]=0,n[7]=0,n[8]=1,n},determinant:function(n){var t=n[0],e=n[1],r=n[2],i=n[3],o=n[4],a=n[5],s=n[6],c=n[7],l=n[8];return t*(l*o-a*c)+e*(a*s-l*i)+r*(c*i-o*s)},frob:function(n){return Math.sqrt(n[0]*n[0]+n[1]*n[1]+n[2]*n[2]+n[3]*n[3]+n[4]*n[4]+n[5]*n[5]+n[6]*n[6]+n[7]*n[7]+n[8]*n[8])},fromMat2:function(n,t){return n[0]=t[0],n[1]=t[1],n[2]=0,n[3]=t[2],n[4]=t[3],n[5]=0,n[6]=t[4],n[7]=t[5],n[8]=1,n},fromMat4:function(n,t){return n[0]=t[0],n[1]=t[1],n[2]=t[2],n[3]=t[4],n[4]=t[5],n[5]=t[6],n[6]=t[8],n[7]=t[9],n[8]=t[10],n},fromQuat:function(n,t){var e=t[0],r=t[1],i=t[2],o=t[3],a=e+e,s=r+r,c=i+i,l=e*a,u=r*a,v=r*s,f=i*a,d=i*s,m=i*c,h=o*a,p=o*s,y=o*c;return n[0]=1-v-m,n[3]=u-y,n[6]=f+p,n[1]=u+y,n[4]=1-l-m,n[7]=d-h,n[2]=f-p,n[5]=d+h,n[8]=1-l-v,n},identity:function(n){return n[0]=1,n[1]=0,n[2]=0,n[3]=0,n[4]=1,n[5]=0,n[6]=0,n[7]=0,n[8]=1,n},invert:function(n,t){var e=t[0],r=t[1],i=t[2],o=t[3],a=t[4],s=t[5],c=t[6],l=t[7],u=t[8],v=u*a-s*l,f=-u*o+s*c,d=l*o-a*c,m=e*v+r*f+i*d;return m?(m=1/m,n[0]=v*m,n[1]=(-u*r+i*l)*m,n[2]=(s*r-i*a)*m,n[3]=f*m,n[4]=(u*e-i*c)*m,n[5]=(-s*e+i*o)*m,n[6]=d*m,n[7]=(-l*e+r*c)*m,n[8]=(a*e-r*o)*m,n):null},multiply:function(n,t,e){var r=t[0],i=t[1],o=t[2],a=t[3],s=t[4],c=t[5],l=t[6],u=t[7],v=t[8],f=e[0],d=e[1],m=e[2],h=e[3],p=e[4],y=e[5],g=e[6],x=e[7],D=e[8];return n[0]=f*r+d*a+m*l,n[1]=f*i+d*s+m*u,n[2]=f*o+d*c+m*v,n[3]=h*r+p*a+y*l,n[4]=h*i+p*s+y*u,n[5]=h*o+p*c+y*v,n[6]=g*r+x*a+D*l,n[7]=g*i+x*s+D*u,n[8]=g*o+x*c+D*v,n},normalFromMat4:function(n,t){var e=t[0],r=t[1],i=t[2],o=t[3],a=t[4],s=t[5],c=t[6],l=t[7],u=t[8],v=t[9],f=t[10],d=t[11],m=t[12],h=t[13],p=t[14],y=t[15],g=e*s-r*a,x=e*c-i*a,D=e*l-o*a,_=r*c-i*s,P=r*l-o*s,I=i*l-o*c,b=u*h-v*m,T=u*p-f*m,k=u*y-d*m,C=v*p-f*h,w=v*y-d*h,M=f*y-d*p,S=g*M-x*w+D*C+_*k-P*T+I*b;return S?(S=1/S,n[0]=(s*M-c*w+l*C)*S,n[1]=(c*k-a*M-l*T)*S,n[2]=(a*w-s*k+l*b)*S,n[3]=(i*w-r*M-o*C)*S,n[4]=(e*M-i*k+o*T)*S,n[5]=(r*k-e*w-o*b)*S,n[6]=(h*I-p*P+y*_)*S,n[7]=(p*D-m*I-y*x)*S,n[8]=(m*P-h*D+y*g)*S,n):null},rotate:function(n,t,e){var r=t[0],i=t[1],o=t[2],a=t[3],s=t[4],c=t[5],l=t[6],u=t[7],v=t[8],f=Math.sin(e),d=Math.cos(e);return n[0]=d*r+f*a,n[1]=d*i+f*s,n[2]=d*o+f*c,n[3]=d*a-f*r,n[4]=d*s-f*i,n[5]=d*c-f*o,n[6]=l,n[7]=u,n[8]=v,n},scale:function(n,t,e){var r=e[0],i=e[1];return n[0]=r*t[0],n[1]=r*t[1],n[2]=r*t[2],n[3]=i*t[3],n[4]=i*t[4],n[5]=i*t[5],n[6]=t[6],n[7]=t[7],n[8]=t[8],n},str:function(n){return"mat3("+n[0]+", "+n[1]+", "+n[2]+", "+n[3]+", "+n[4]+", "+n[5]+", "+n[6]+", "+n[7]+", "+n[8]+")"},translate:function(n,t,e){var r=t[0],i=t[1],o=t[2],a=t[3],s=t[4],c=t[5],l=t[6],u=t[7],v=t[8],f=e[0],d=e[1];return n[0]=r,n[1]=i,n[2]=o,n[3]=a,n[4]=s,n[5]=c,n[6]=f*r+d*a+l,n[7]=f*i+d*s+u,n[8]=f*o+d*c+v,n},transpose:function(n,t){if(n===t){var e=t[1],r=t[2],i=t[5];n[1]=t[3],n[2]=t[6],n[3]=e,n[5]=t[7],n[6]=r,n[7]=i}else n[0]=t[0],n[1]=t[3],n[2]=t[6],n[3]=t[1],n[4]=t[4],n[5]=t[7],n[6]=t[2],n[7]=t[5],n[8]=t[8];return n}},x=(g.adjoint,g.clone,g.copy,g.create,g.determinant,g.frob,g.fromMat2,g.fromMat4,g.fromQuat,g.identity,g.invert,g.multiply,g.normalFromMat4,g.rotate,g.scale,g.str,g.translate,g.transpose,new i.Matrix),D=function(n){function t(t,e){void 0===t&&(t=new p);var i=n.call(this)||this;return i.shape=t,i._dirtyID=0,i._transformID=0,i._updateID=-1,i.vertexData=[],i.uvData=[],i._texture=e||r.Texture.WHITE,i}return function(n,t){function e(){this.constructor=n}y(n,t),n.prototype=null===t?Object.create(t):(e.prototype=t.prototype,new e)}(t,n),Object.defineProperty(t.prototype,"k",{get:function(){return this.shape.k},set:function(n){var t;(t=this.shape).setk.apply(t,n)},enumerable:!1,configurable:!0}),Object.defineProperty(t.prototype,"l",{get:function(){return this.shape.l},set:function(n){var t;(t=this.shape).setl.apply(t,n)},enumerable:!1,configurable:!0}),Object.defineProperty(t.prototype,"m",{get:function(){return this.shape.m},set:function(n){var t;(t=this.shape).setm.apply(t,n)},enumerable:!1,configurable:!0}),Object.defineProperty(t.prototype,"texture",{get:function(){return this._texture},set:function(n){this._texture=n||r.Texture.WHITE},enumerable:!1,configurable:!0}),t.prototype._calculateBounds=function(){this._bounds.addVertexData(this.vertexData,0,this.vertexData.length)},t.prototype._render=function(n){n.plugins.conic||(n.plugins.conic=new m(n,null)),n.batch.setObjectRenderer(n.plugins.conic),n.plugins.conic.render(this)},t.prototype.drawControlPoints=function(){var n=this.shape.controlPoints;return this.drawTriangle(n[0].x,n[0].y,n[1].x,n[1].y,n[2].x,n[2].y),this},t.prototype.drawTriangle=function(n,t,e,r,i,o){var a=this.uvData,s=a.length;return a.length+=6,a[s]=n,a[s+1]=t,a[s+2]=e,a[s+3]=r,a[s+4]=i,a[s+5]=o,this},t.prototype.drawRect=function(n,t,e,r){var i=this.uvData,o=i.length;return i.length+=12,i[o]=n,i[o+1]=t,i[o+2]=n+e,i[o+3]=t,i[o+4]=n+e,i[o+5]=t+r,i[o+6]=n,i[o+7]=t,i[o+8]=n+e,i[o+9]=t+r,i[o+10]=n,i[o+11]=t+r,this},t.prototype.updateConic=function(){var n=this.vertexData,t=this.uvData;n.length=t.length;for(var e=x.copyFrom(this.worldTransform),r=e.a,i=e.b,o=e.c,a=e.d,s=e.tx,c=e.ty,l=0,u=n.length/2;l<u;l++){var v=t[2*l],f=t[2*l+1];n[2*l]=r*v+o*f+s,n[2*l+1]=i*v+a*f+c}this._updateID=this._dirtyID;var d=this.indexData=new Array(n.length/2);for(l=0,u=d.length;l<u;l++)d[l]=l},t.prototype.setControlPoints=function(n,t,e){var r=this.shape.controlPoints;this.setTransform(r[0],r[1],r[2],n,t,e)},t.prototype.setTransform=function(){for(var t=[],e=0;e<arguments.length;e++)t[e]=arguments[e];var r,i,o,a,s,c,l,u,v,f,d,m,h=this.transform,p=h.localTransform;if(h._localID++,1===t.length)return p.copyFrom(t[0]),this;if(9===t.length&&n.prototype.setTransform.apply(this,t),p.identity(),6===t.length){var y=t;r=y[0].x,i=y[0].y,o=y[1].x,a=y[1].y,s=y[2].x,c=y[2].y,l=y[3].x,u=y[3].y,v=y[4].x,f=y[4].y,d=y[5].x,m=y[5].y}else{var x=t;r=x[0],i=x[1],o=x[2],a=x[3],s=x[4],c=x[5],l=x[6],u=x[7],v=x[8],f=x[9],d=x[10],m=x[11]}var D=[r,o,s,i,a,c,1,1,1],_=g.invert(D,D);return p.a=_[0]*l+_[3]*v+_[6]*d,p.c=_[1]*l+_[4]*v+_[7]*d,p.tx=_[2]*l+_[5]*v+_[8]*d,p.b=_[0]*u+_[3]*f+_[6]*m,p.d=_[1]*u+_[4]*f+_[7]*m,p.ty=_[2]*u+_[5]*f+_[8]*m,h.setFromMatrix(p),this},t.prototype.updateTransform=function(){var t=n.prototype.updateTransform.call(this);return this._transformID!==this.transform._worldID&&(this.updateConic(),this._transformID=this.transform._worldID),t},t}(o.Container);return n.Conic=p,n.ConicDisplay=D,n}({},pixiBatchRenderer,constants,core,math,display);Object.assign(this.PIXI,_pixi_essentials_conic);
//# sourceMappingURL=conic.js.map
