/*!
 * @pixi-essentials/react-bindings - v1.0.4
 * Compiled Thu, 20 Aug 2020 23:24:32 UTC
 *
 * @pixi-essentials/react-bindings is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 * 
 * Copyright 2019-2020, Shukant K. Pal, All Rights Reserved
 */
this.ReactPixi=this.ReactPixi||{};var _pixi_essentials_react_bindings=function(e,n,a,r){"use strict";const o={},t=n.Matrix.IDENTITY,s={transformchange:"transformchange",transformcommit:"transformcommit"},i=a.PixiComponent("Transformer",{create:e=>new r.Transformer(e),applyProps(e,n,a){if(function(e,n,a,r){for(const o in n){const t=a[o],s=r[o],i=n[o];t!==s&&(t&&e.off(i,t),s&&e.on(i,s))}}(e,s,n,a),e.group=a.group||[],e.centeredScaling=a.centeredScaling,e.enabledHandles=a.enabledHandles,e.projectionTransform.copyFrom(a.projectionTransform||t),e.skewRadius=a.skewRadius||e.skewRadius,e.rotateEnabled=!1!==a.rotateEnabled,e.scaleEnabled=!1!==a.scaleEnabled,e.skewEnabled=!0===a.skewEnabled,e.translateEnabled=!1!==a.translateEnabled,e.transientGroupTilt=a.transientGroupTilt,n.handleConstructor!==a.handleConstructor)throw new Error("Transformer does not support changing the TransformerHandleConstructor!");n.rotationSnaps!==a.rotationSnaps&&(e.rotationSnaps=a.rotationSnaps),n.rotationSnapTolerance!==a.rotationSnapTolerance&&(e.rotationSnapTolerance=a.rotationSnapTolerance),n.skewSnaps!==a.skewSnaps&&(e.skewSnaps=a.skewSnaps),n.skewSnapTolerance!==a.skewSnapTolerance&&(e.skewSnapTolerance=a.skewSnapTolerance);const r=n.handleStyle||o,i=a.handleStyle||o;r.color===i.color&&r.outlineColor===i.outlineColor&&r.outlineThickness===i.outlineThickness&&r.radius===i.radius&&r.shape===i.shape||(e.handleStyle=i);const l=n.wireframeStyle||o,c=a.wireframeStyle||o;l.color===c.color&&l.thickness===c.thickness||(e.wireframeStyle=c)}});return e.Transformer=i,e}({},PIXI,ReactPixi,PIXI);Object.assign(this.ReactPixi,_pixi_essentials_react_bindings);
//# sourceMappingURL=react-bindings.js.map
