/*!
 * @pixi-essentials/ooo-renderer - v0.0.1-alpha.0
 * Compiled Sat, 11 Jul 2020 16:47:29 UTC
 *
 * @pixi-essentials/ooo-renderer is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 */
this.PIXI=this.PIXI||{};var _pixi_essentials_ooo_renderer=function(t,e,n,i){"use strict";
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
    ***************************************************************************** */var r=function(t,e){return(r=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(t,e){t.__proto__=e}||function(t,e){for(var n in e)e.hasOwnProperty(n)&&(t[n]=e[n])})(t,e)};var s=function(){function t(){this.zDependencies=[]}return t.prototype.getBounds=function(){return this.displayObject.getBounds(!0)},t}(),o=i.ObjectPoolFactory.build(s),a=function(t){function e(e,i){void 0===i&&(i={});var r=t.call(this,e)||this;return r.spatialHash=new n.SpatialHash(i.blockSize||256),r.pluginProvider=i.pluginProvider||function(t){return t.pluginName},r.batchList=[],r}return function(t,e){function n(){this.constructor=t}r(t,e),t.prototype=null===e?Object.create(e):(n.prototype=e.prototype,new n)}(e,t),e.prototype.start=function(){this.spatialHash.clear(),this.batchList=[]},e.prototype.render=function(t){var e=o.allocate(),n=t.getBounds(!0),i=this.spatialHash.search(n);e.displayObject=t,e.pluginName=this.pluginProvider(t),e.zIndex=i.length?i.reduce((function(t,e){return Math.max(t,e.zIndex)}),0):0,e.zDependencies=i,this.spatialHash.put(e,n);for(var r=i.length?i.reduce((function(t,e){return Math.max(t,e.batchIndex)}),0):0,s=this.batchList.length;r<s;r++){var a=this.batchList[r];if(a.pluginName===e.pluginName)return void a.displayObjects.push(t)}var c={pluginName:e.pluginName,displayObjects:[t]};this.batchList.push(c)},e.prototype.flush=function(){for(var t=this.renderer.plugins,e=0,n=this.batchList.length;e<n;e++){var i=this.batchList[e],r=i.displayObjects,s=t[i.pluginName];s.start();for(var o=0,a=r.length;o<a;o++)s.render(r[o]);s.stop()}},e}(e.ObjectRenderer);return t.OooRenderer=a,t}({},PIXI,pixiSpatialHash,objectPool);Object.assign(this.PIXI,_pixi_essentials_ooo_renderer);
//# sourceMappingURL=pixi-ooo-renderer.js.map
