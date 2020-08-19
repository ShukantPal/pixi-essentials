/*!
 * @pixi-essentials/react-bindings - v1.0.3
 * Compiled Wed, 19 Aug 2020 15:26:43 UTC
 *
 * @pixi-essentials/react-bindings is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 * 
 * Copyright 2019-2020, Shukant K. Pal, All Rights Reserved
 */
this.ReactPixi=this.ReactPixi||{};var _pixi_essentials_react_bindings=function(e,n,a,r){"use strict";function o(e,n,a,r){for(const o in n){const t=a[o],s=r[o],i=n[o];t!==s&&(t&&e.off(i,t),s&&e.on(i,s))}}const t={},s=n.Matrix.IDENTITY,i={transformchange:"transformchange",transformcommit:"transformcommit"},l=a.PixiComponent("Transformer",{create:e=>{const n=new r.Transformer(e);return o(n,i,{},e),n},applyProps(e,n,a){if(o(e,i,n,a),e.group=a.group||[],e.centeredScaling=a.centeredScaling,e.enabledHandles=a.enabledHandles,e.projectionTransform.copyFrom(a.projectionTransform||s),e.skewRadius=a.skewRadius||e.skewRadius,e.rotateEnabled=!1!==a.rotateEnabled,e.scaleEnabled=!1!==a.scaleEnabled,e.skewEnabled=!0===a.skewEnabled,e.translateEnabled=!1!==a.translateEnabled,e.transientGroupTilt=a.transientGroupTilt,n.handleConstructor!==a.handleConstructor)throw new Error("Transformer does not support changing the TransformerHandleConstructor!");n.rotationSnaps!==a.rotationSnaps&&(e.rotationSnaps=a.rotationSnaps),n.rotationSnapTolerance!==a.rotationSnapTolerance&&(e.rotationSnapTolerance=a.rotationSnapTolerance),n.skewSnaps!==a.skewSnaps&&(e.skewSnaps=a.skewSnaps),n.skewSnapTolerance!==a.skewSnapTolerance&&(e.skewSnapTolerance=a.skewSnapTolerance);const r=n.handleStyle||t,l=a.handleStyle||t;r.color===l.color&&r.outlineColor===l.outlineColor&&r.outlineThickness===l.outlineThickness&&r.radius===l.radius&&r.shape===l.shape||(e.handleStyle=l);const c=n.wireframeStyle||t,p=a.wireframeStyle||t;c.color===p.color&&c.thickness===p.thickness||(e.wireframeStyle=p)}});return e.Transformer=l,e}({},PIXI,ReactPixi,PIXI);Object.assign(this.ReactPixi,_pixi_essentials_react_bindings);
//# sourceMappingURL=react-bindings.js.map
