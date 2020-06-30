/*!
 * @pixi-essentials/cull - v1.0.0
 * Compiled Tue, 30 Jun 2020 16:20:53 UTC
 *
 * @pixi-essentials/cull is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 */
this.PIXI=this.PIXI||{};var _pixi_essentials_cull=function(t,e){"use strict";var i=new PIXI.Rectangle,r=function(){function t(t){void 0===t&&(t={}),this._toggle=t.toggle||"visible",this._targetList=new Set}return t.prototype.add=function(t){this._targetList.add(t)},t.prototype.addAll=function(t){for(var e=0,i=t.length;e<i;e++)this._targetList.add(t[e])},t.prototype.remove=function(t){this._targetList.delete(t)},t.prototype.removeAll=function(t){for(var e=0,i=t.length;e<i;e++)this._targetList.delete(t[e])},t.prototype.clear=function(){this._targetList.clear()},t.prototype.cull=function(t,e){var i=this;void 0===e&&(e=!1),this._targetList.forEach((function(r){if(!e){var o=r.parent;r.parent||(r.parent=r._tempDisplayObjectParent),r.updateTransform(),r.parent=o}i.cullRecursive(t,r)}))},t.prototype.cullRecursive=function(t,e){var r=e.getBounds(!0,i);e[this._toggle]=r.right>t.left&&r.left<t.right&&r.bottom>t.top&&r.top<t.bottom,e[this._toggle]&&this.cullRecursive(t,e)},t}();return t.Cull=r,t}({});Object.assign(this.PIXI,_pixi_essentials_cull);
//# sourceMappingURL=cull.js.map
