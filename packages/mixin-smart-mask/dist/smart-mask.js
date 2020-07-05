/*!
 * @pixi-essentials/mixin-smart-mask - v1.0.0
 * Compiled Sun, 05 Jul 2020 21:41:15 UTC
 *
 * @pixi-essentials/mixin-smart-mask is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 */
this.PIXI=this.PIXI||{},function(t,e,s){"use strict";var a=s.ObjectPoolFactory.build(e.Rectangle),i=new t.Bounds,r=new e.Rectangle,l=[];t.DisplayObject.prototype.smartMask=null,t.DisplayObject.prototype.updateSmartMask=function(t,e){if(void 0===t&&(t=!0),void 0===e&&(e=!0),!this.smartMask)return t?this.getBounds(e,a.allocate()):null;var s=this.smartMask,n=a.allocate(),o=a.allocate();if(s.getBounds(e,n),e||(this._recursivePostUpdateTransform(),this.parent?this.displayObjectUpdateTransform():(this.parent=this._tempDisplayObjectParent,this.displayObjectUpdateTransform(),this.parent=null)),this.filterArea)o.copyFrom(this.filterArea);else{var h=this._bounds,c=this.children;i.clear(),this._bounds=i,this.children=l,this.calculateBounds(),this._bounds=h,this.children=c,o.copyFrom(i.getRectangle(o))}var d=this.children;if(d&&d.length)if(t)for(var p=0,u=d.length;p<u;p++){if((b=d[p]).renderable&&b.visible){var m=b.updateSmartMask(!0,e);o.enlarge(m),a.release(m)}}else for(p=0,u=d.length;p<u;p++){var b;(b=d[p]).renderable&&b.visible&&o.enlarge(b.getBounds(e,r))}return o.left<n.left||o.top<n.top||o.right>n.right||o.bottom>n.bottom?this.mask=s:this.mask=null,t?(o.fit(n),a.release(n),o):(a.release(n),a.release(o),null)}}(display,math,objectPool),Object.assign(this.PIXI,_pixi_essentials_mixin_smart_mask);
//# sourceMappingURL=smart-mask.js.map
