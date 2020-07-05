/*!
 * @pixi-essentials/instanced-renderer - v0.0.1-alpha.1
 * Compiled Sun, 05 Jul 2020 21:41:15 UTC
 *
 * @pixi-essentials/instanced-renderer is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 */
this.PIXI=this.PIXI||{};var _pixi_essentials_instanced_renderer=function(t,e,i,n){"use strict";
/*! *****************************************************************************
    Copyright (c) Microsoft Corporation. All rights reserved.
    Licensed under the Apache License, Version 2.0 (the "License"); you may not use
    this file except in compliance with the License. You may obtain a copy of the
    License at http://www.apache.org/licenses/LICENSE-2.0

    THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
    WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
    MERCHANTABLITY OR NON-INFRINGEMENT.

    See the Apache Version 2.0 License for specific language governing permissions
    and limitations under the License.
    ***************************************************************************** */var r=function(t,e){return(r=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(t,e){t.__proto__=e}||function(t,e){for(var i in e)e.hasOwnProperty(i)&&(t[i]=e[i])})(t,e)};function s(t,e){function i(){this.constructor=t}r(t,e),t.prototype=null===e?Object.create(e):(i.prototype=e.prototype,new i)}var a=0,o=function(t){function r(i,n){var r=t.call(this,i)||this;return r._aBuffers=[],r.instanceRendererID="instanceRenderer-"+a+++"-ID",r._instanceBuilder=n.instanceBuilder,r._geometry=n.geometry,r._shader=n.shader,r._state=n.state||e.State.for2d(),r._instanceAttribSizes={},r._instanceAttribViews={},r._instanceSize=r._calculateInstanceSizesAndViews(),r._objectBuffer=[],r._objectCount=0,r._initInstanceBuffer(),r}return s(r,t),r.prototype.start=function(){this._objectCount=0},r.prototype.render=function(t){this._objectBuffer[this._objectCount]=t,++this._objectCount},r.prototype.flush=function(){for(var t=this._instanceBuilder,e=this._instanceSize,n=this._getBuffer(this._objectCount*this._instanceSize),r=0;r<this._objectCount;r++){var s=0,a=this._objectBuffer[r];for(var o in this._instanceBuilder){var c=this._geometry.attributes[o];if(c.instance){var _=c.size,u=n[this._instanceAttribViews[o]],f=this._instanceAttribSizes[o],h=(r*e+s)/f,d=t[o];if(1===_)u[h]=a[d];else for(var b=0;b<_;b++)u[h+b]=a[d][b];s+=f}}}this._instanceBuffer.update(n.rawBinaryData);var l=this.renderer;l.shader.bind(this._shader),l.geometry.bind(this._geometry),l.state.set(this._state),l.geometry.draw(i.DRAW_MODES.TRIANGLES,void 0,void 0,this._objectCount),this._objectCount=0},r.prototype._getBuffer=function(t){var i=n.nextPow2(Math.ceil(t)),r=n.log2(i),s=i;this._aBuffers.length<=r&&(this._aBuffers.length=r+1);var a=this._aBuffers[s];return a||(this._aBuffers[s]=a=new e.ViewableBuffer(s)),a},r.prototype._calculateInstanceSizesAndViews=function(){var t=0;for(var e in this._geometry.attributes){var n=this._geometry.attributes[e];if(n.instance){var r=0,s=void 0;switch(n.type){case i.TYPES.UNSIGNED_BYTE:r=1,s="uint8View";break;case i.TYPES.UNSIGNED_SHORT:case i.TYPES.UNSIGNED_SHORT_5_6_5:case i.TYPES.UNSIGNED_SHORT_4_4_4_4:case i.TYPES.UNSIGNED_SHORT_5_5_5_1:case i.TYPES.HALF_FLOAT:r=2,s="uint16View";break;case i.TYPES.FLOAT:r=4,s="float32View"}var a=n.size*r;this._instanceAttribViews[e]=s,this._instanceAttribSizes[e]=a,t+=a}}return t},r.prototype._initInstanceBuffer=function(){this._instanceBuffer=new e.Buffer;var t=new e.Geometry;for(var i in this._geometry.attributes){var n=this._geometry.attributes[i],r=n.instance;console.log(i),console.log(this._geometry.buffers[n.buffer]),t.addAttribute(i,r?this._instanceBuffer:this._geometry.buffers[n.buffer],n.size,n.normalized,n.type,r?n.start:void 0,r?n.stride:void 0,n.instance)}this._geometry=t},r}(e.ObjectRenderer),c=function(){function t(){}return t.from=function(t){return function(e){function i(i){return e.call(this,i,t)||this}return s(i,e),i}(o)},t}();return t.InstancedRenderer=o,t.InstancedRendererPluginFactory=c,t}({},core,constants,utils);Object.assign(this.PIXI,_pixi_essentials_instanced_renderer);
//# sourceMappingURL=instanced-renderer.js.map
