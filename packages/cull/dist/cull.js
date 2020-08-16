/*!
 * @pixi-essentials/cull - v1.0.6
 * Compiled Sun, 16 Aug 2020 16:31:07 UTC
 *
 * @pixi-essentials/cull is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 * 
 * Copyright 2019-2020, Shukant K. Pal, All Rights Reserved
 */
this.PIXI=this.PIXI||{};var _pixi_essentials_cull=function(t,e){"use strict";const i=new PIXI.Rectangle;return t.Cull=class{constructor(t={}){this._recursive="boolean"!=typeof t.recursive||t.recursive,this._toggle=t.toggle||"visible",this._targetList=new Set}add(t){return this._targetList.add(t),this}addAll(t){for(let e=0,i=t.length;e<i;e++)this._targetList.add(t[e]);return this}remove(t){return this._targetList.delete(t),this}removeAll(t){for(let e=0,i=t.length;e<i;e++)this._targetList.delete(t[e]);return this}clear(){return this._targetList.clear(),this}cull(t,e=!1){return this.uncull(),this._targetList.forEach(s=>{e||s.getBounds(!1,i),this._recursive?this.cullRecursive(t,s):(e&&s.getBounds(!0,i),s[this._toggle]=i.right>t.left&&i.left<t.right&&i.bottom>t.top&&i.top<t.bottom)}),this}uncull(){return this._targetList.forEach(t=>{this._recursive?this.uncullRecursive(t):t[this._toggle]=!1}),this}cullRecursive(t,e){const s=e.getBounds(!0,i);e[this._toggle]=s.right>t.left&&s.left<t.right&&s.bottom>t.top&&s.top<t.bottom;if(!(s.left>=t.left&&s.top>=t.top&&s.right<=t.right&&s.bottom>=t.bottom)&&e.children&&e.children.length){const i=e.children;for(let e=0,s=i.length;e<s;e++)this.cullRecursive(t,i[e])}}uncullRecursive(t){if(t[this._toggle]=!0,t.children&&t.children.length){const e=t.children;for(let t=0,i=e.length;t<i;t++)this.uncullRecursive(e[t])}}},t}({});Object.assign(this.PIXI,_pixi_essentials_cull);
//# sourceMappingURL=cull.js.map
