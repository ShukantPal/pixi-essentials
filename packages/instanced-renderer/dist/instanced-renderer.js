/*!
 * @pixi-essentials/instanced-renderer - v0.0.1-alpha.0
 * Compiled Mon, 04 May 2020 16:01:19 UTC
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
    ***************************************************************************** */var r=function(t,e){return(r=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(t,e){t.__proto__=e}||function(t,e){for(var i in e)e.hasOwnProperty(i)&&(t[i]=e[i])})(t,e)};var s=0,a=function(t){function a(i,n){var r=t.call(this,i)||this;return r._instanceAttribViews={},r.instanceRendererID="instanceRenderer-"+s+++"-ID",r._instanceBuilder=n.instanceBuilder,r._geometry=n.geometry,r._shader=n.shader,r._state=n.state||e.State.for2d(),r._instanceSize=r.calculateInstanceSizesAndViews(),r._instanceAttribSizes={},r._instanceAttribViews={},r._objectBuffer=[],r._objectCount=0,r._initInstanceBuffer(),r}return function(t,e){function i(){this.constructor=t}r(t,e),t.prototype=null===e?Object.create(e):(i.prototype=e.prototype,new i)}(a,t),a.prototype.start=function(){this._objectCount=0},a.prototype.render=function(t){this._objectBuffer[this._objectCount]=t,++this._objectCount},a.prototype.flush=function(){var t=this._instanceBuilder,e=this._instanceSize,n=this._getBuffer(this._objectCount*this._instanceSize);this._instanceBuffer.data=n.rawBinaryData;for(var r=0;r<this._objectCount;r++){var s=0,a=this._objectBuffer[r];for(var o in this._instanceBuilder){var _=this._geometry.attributes[o].size,c=n[this._instanceAttribViews[o]],u=this._instanceAttribSizes[o],f=(r*e+s)/u,h=t[o];if(1===_)c[f]=a[h];else for(var d=0;d<_;d++)c[f+d]=a[h][d];s+=u}}var b=this.renderer;b.geometry.bind(this._geometry),b.shader.bind(this._shader),b.state.set(this._state),b.geometry.draw(i.DRAW_MODES.TRIANGLE,void 0,void 0,this._objectCount),this._objectCount=0},a.prototype._getBuffer=function(t){var i=n.nextPow2(Math.ceil(t)),r=n.log2(i),s=i;this._aBuffers.length<=r&&(this._aBuffers.length=r+1);var a=this._aBuffers[s];return a||(this._aBuffers[s]=a=new e.ViewableBuffer(s)),a},a.prototype.calculateInstanceSizesAndViews=function(){var t=0;for(var e in this._geometry.attributes){var n=this._geometry[e];if(n.instance){var r=0,s=void 0;switch(n.type){case i.TYPES.UNSIGNED_BYTE:r=1,s="uint8View";break;case i.TYPES.UNSIGNED_SHORT:case i.TYPES.UNSIGNED_SHORT_5_6_5:case i.TYPES.UNSIGNED_SHORT_4_4_4_4:case i.TYPES.UNSIGNED_SHORT_5_5_5_1:case i.TYPES.HALF_FLOAT:r=2,s="uint16View";break;case i.TYPES.FLOAT:r=4,s="float32View"}var a=n.size*r;this._instanceAttribViews[e]=s,this._instanceAttribSizes[e]=a,t+=a}}return t},a.prototype._initInstanceBuffer=function(){this._instanceBuffer=new e.Buffer;var t=new e.Geometry;for(var i in this._geometry.attributes){var n=this._geometry[i],r=n.instance;t.addAttribute(i,r?this._instanceBuffer:n.buffer,n.size,n.normalized,n.type,r?n.start:void 0,r?n.stride:void 0,n.instance)}this._geometry=t},a}(e.ObjectRenderer);return t.InstancedRenderer=a,t}({},core,constants,utils);Object.assign(this.PIXI,_pixi_essentials_instanced_renderer);
//# sourceMappingURL=instanced-renderer.js.map
