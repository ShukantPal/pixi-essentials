/*!
 * @pixi-essentials/mixin-smart-mask - v1.0.1
 * Compiled Sun, 09 Aug 2020 15:59:00 UTC
 *
 * @pixi-essentials/mixin-smart-mask is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 * 
 * Copyright 2019-2020, Shukant K. Pal, All Rights Reserved
 * 
 */
this.PIXI=this.PIXI||{},function(t,e,s){"use strict";const i=s.ObjectPoolFactory.build(e.Rectangle),a=new t.Bounds,l=new e.Rectangle,n=[];t.DisplayObject.prototype.smartMask=null,t.DisplayObject.prototype.updateSmartMask=function(t=!0,e=!0){if(!this.smartMask)return t?this.getBounds(e,i.allocate()):null;const s=this.smartMask,r=i.allocate(),o=i.allocate();if(s.getBounds(e,r),e||(this._recursivePostUpdateTransform(),this.parent?this.displayObjectUpdateTransform():(this.parent=this._tempDisplayObjectParent,this.displayObjectUpdateTransform(),this.parent=null)),this.filterArea)o.copyFrom(this.filterArea);else{const t=this._bounds,e=this.children;a.clear(),this._bounds=a,this.children=n,this.calculateBounds(),this._bounds=t,this.children=e,o.copyFrom(a.getRectangle(o))}const c=this.children;if(c&&c.length)if(t)for(let t=0,s=c.length;t<s;t++){const s=c[t];if(!s.renderable||!s.visible)continue;const a=s.updateSmartMask(!0,e);o.enlarge(a),i.release(a)}else for(let t=0,s=c.length;t<s;t++){const s=c[t];s.renderable&&s.visible&&o.enlarge(s.getBounds(e,l))}return o.left<r.left||o.top<r.top||o.right>r.right||o.bottom>r.bottom?this.mask=s:this.mask=null,t?(o.fit(r),i.release(r),o):(i.release(r),i.release(o),null)}}(display,math,objectPool),Object.assign(this.PIXI,_pixi_essentials_mixin_smart_mask);
//# sourceMappingURL=smart-mask.js.map
