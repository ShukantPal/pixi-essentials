/*!
 * @pixi-essentials/shader-preprocessor - v1.0.0
 * Compiled Sun, 09 Aug 2020 15:59:00 UTC
 *
 * @pixi-essentials/shader-preprocessor is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 * 
 * Copyright 2019-2020, Shukant K. Pal, All Rights Reserved
 * 
 */
this.PIXI=this.PIXI||{};var _pixi_essentials_shader_preprocessor=function(e,t){"use strict";const r=/%([\w$]+)(\([\w$, ]*\))?%/g;class a{constructor(e,r,a="pixi-shader-template"){this.vertexTemplateSrc=e||t.Program.defaultVertexSrc,this.fragmentTemplateSrc=r||t.Program.defaultFragmentSrc,this.name=a,this.programCache=new Map,this.vertexMacroData=this.extractData(this.vertexTemplateSrc),this.fragmentMacroData=this.extractData(this.fragmentTemplateSrc)}generateProgram(e,r){const a=this.processData(this.vertexTemplateSrc,this.vertexMacroData,e),s=this.processData(this.fragmentTemplateSrc,this.fragmentMacroData,e),i=a+s,n=this.programCache.get(i);if(n)return n;const c=new t.Program(a,s,r||this.name||"pixi-processed-shader");return this.programCache.set(i,c),c}extractData(e){const t=[],a=new RegExp(r);let s;for(;null!==(s=a.exec(e));){const e=s[1];let r=s[2];r&&(r=r.slice(1,-1).split(",").map(e=>e.trim())),t.push({id:e,args:r,position:{start:s.index,end:s.index+s[0].length},type:r?"function":"field"})}return t}processData(e,t,r){let a=e;for(let e=t.length-1;e>=0;e--){const s=t[e],i=r[s.id];let n="";n="function"==typeof i?i(...s.args):""+i,a=a.slice(0,s.position.start)+n+a.slice(s.position.end)}return a}}class s{static generateShader(e,r,a,i,n){const c=s.from(e,r,n).generateProgram(i,n);return new t.Shader(c,a)}static from(e,t,r){const i=e+t;let n=s.managedTemplates[i];return n||(n=s.managedTemplates[i]=new a(e,t,r)),n}}return s.managedTemplates={},e.ProgramTemplate=a,e.ShaderPreprocessor=s,e}({},core);Object.assign(this.PIXI,_pixi_essentials_shader_preprocessor);
//# sourceMappingURL=shader-preprocessor.js.map
