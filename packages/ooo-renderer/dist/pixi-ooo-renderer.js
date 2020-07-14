/*!
 * @pixi-essentials/ooo-renderer - v0.0.1-alpha.0
 * Compiled Tue, 14 Jul 2020 17:57:17 UTC
 *
 * @pixi-essentials/ooo-renderer is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 */
this.PIXI=this.PIXI||{};var _pixi_essentials_ooo_renderer=function(t,n,e,r){"use strict";
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
    ***************************************************************************** */var i=function(t,n){return(i=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(t,n){t.__proto__=n}||function(t,n){for(var e in n)n.hasOwnProperty(e)&&(t[e]=n[e])})(t,n)};function o(t,n){function e(){this.constructor=t}i(t,n),t.prototype=null===n?Object.create(n):(e.prototype=n.prototype,new e)}var a=function(){function t(){}return t.prototype.getBounds=function(){return this.displayObject.getBounds(!0)},t}(),s=r.ObjectPoolFactory.build(a),u=function(t){function n(n,r){void 0===r&&(r={});var i=t.call(this,n)||this;return i.spatialHash=new e.SpatialHash(r.blockSize||256),i.pluginProvider=r.pluginProvider||function(t){return t.pluginName},i.batchList=[],i}return o(n,t),n.prototype.start=function(){this.spatialHash.clear(),this.batchList=[]},n.prototype.render=function(t){var n=s.allocate(),e=t.getBounds(!0),r=this.spatialHash.search(e);n.displayObject=t,n.pluginName=this.pluginProvider(t),n.zIndex=r.length?r.reduce((function(t,n){return Math.max(t,n.zIndex)}),0):0,n.zDependencies=r,this.spatialHash.put(n,e);for(var i=r.length?r.reduce((function(t,n){return Math.max(t,n.batchIndex)}),0):0,o=this.batchList.length;i<o;i++){var a=this.batchList[i];if(a.pluginName===n.pluginName)return void a.displayObjects.push(t)}var u={pluginName:n.pluginName,displayObjects:[t]};this.batchList.push(u)},n.prototype.flush=function(){for(var t=this.renderer.plugins,n=0,e=this.batchList.length;n<e;n++){var r=this.batchList[n],i=r.displayObjects,o=t[r.pluginName];o.start();for(var a=0,s=i.length;a<s;a++)o.render(i[a]);o.stop()}},n}(n.ObjectRenderer),c=function(){function t(){}return t.from=function(t){return function(n){function e(e){return n.call(this,e,t)||this}return o(e,n),e}(u)},t}();return t.OooRenderer=u,t.OooRendererPluginFactory=c,t}({},PIXI,pixiSpatialHash,objectPool);Object.assign(this.PIXI,_pixi_essentials_ooo_renderer);
//# sourceMappingURL=pixi-ooo-renderer.js.map
