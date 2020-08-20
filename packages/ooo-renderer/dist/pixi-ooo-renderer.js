/*!
 * @pixi-essentials/ooo-renderer - v0.0.2
 * Compiled Thu, 20 Aug 2020 23:24:32 UTC
 *
 * @pixi-essentials/ooo-renderer is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 * 
 * Copyright 2019-2020, Shukant K. Pal, All Rights Reserved
 */
this.PIXI=this.PIXI||{};var _pixi_essentials_ooo_renderer=function(t,s,e,i){"use strict";const a=i.ObjectPoolFactory.build(class{getBounds(){return this.displayObject.getBounds(!0)}});class n extends s.ObjectRenderer{constructor(t,s={}){super(t),this.spatialHash=new e.SpatialHash(s.blockSize||256),this.pluginProvider=s.pluginProvider||(t=>t.pluginName),this.batchList=[]}start(){this.spatialHash.clear(),this.batchList=[]}render(t){const s=a.allocate(),e=t.getBounds(!0),i=this.spatialHash.search(e);s.displayObject=t,s.pluginName=this.pluginProvider(t),s.zIndex=i.length?i.reduce((t,s)=>Math.max(t,s.zIndex),0):0,s.zDependencies=i,this.spatialHash.put(s,e);for(let e=i.length?i.reduce((t,s)=>Math.max(t,s.batchIndex),0):0,a=this.batchList.length;e<a;e++){const i=this.batchList[e];if(i.pluginName===s.pluginName)return void i.displayObjects.push(t)}const n={pluginName:s.pluginName,displayObjects:[t]};this.batchList.push(n)}flush(){const t=this.renderer.plugins;for(let s=0,e=this.batchList.length;s<e;s++){const e=this.batchList[s],i=e.displayObjects,a=t[e.pluginName];a.start();for(let t=0,s=i.length;t<s;t++)a.render(i[t]);a.stop()}}}return t.OooRenderer=n,t.OooRendererPluginFactory=class{static from(t){return class extends n{constructor(s){super(s,t)}}}},t}({},PIXI,pixiSpatialHash,PIXI);Object.assign(this.PIXI,_pixi_essentials_ooo_renderer);
//# sourceMappingURL=pixi-ooo-renderer.js.map
