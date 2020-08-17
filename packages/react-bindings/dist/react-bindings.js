/*!
 * @pixi-essentials/react-bindings - v1.0.2
 * Compiled Mon, 17 Aug 2020 18:38:22 UTC
 *
 * @pixi-essentials/react-bindings is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 * 
 * Copyright 2019-2020, Shukant K. Pal, All Rights Reserved
 */
this.ReactPixi=this.ReactPixi||{};var _pixi_essentials_react_bindings=function(e,n,a){"use strict";function r(e,n,a,r){for(const t in n){const o=a[t],s=r[t],i=n[t];o!==s&&(o&&e.off(i,o),s&&e.on(i,s))}}const t={},o={transformchange:"transformchange"},s=n.PixiComponent("Transformer",{create:e=>{const n=new a.Transformer(e);return r(n,o,{},e),n},applyProps(e,n,a){if(r(e,o,n,a),e.group=a.group||[],e.centeredScaling=a.centeredScaling,e.enabledHandles=a.enabledHandles,e.skewRadius=a.skewRadius||e.skewRadius,e.rotateEnabled=!1!==a.rotateEnabled,e.scaleEnabled=!1!==a.scaleEnabled,e.skewEnabled=!0===a.skewEnabled,e.translateEnabled=!1!==a.translateEnabled,e.transientGroupTilt=a.transientGroupTilt,n.handleConstructor!==a.handleConstructor)throw new Error("Transformer does not support changing the TransformerHandleConstructor!");n.rotationSnaps!==a.rotationSnaps&&(e.rotationSnaps=a.rotationSnaps),n.rotationSnapTolerance!==a.rotationSnapTolerance&&(e.rotationSnapTolerance=a.rotationSnapTolerance),n.skewSnaps!==a.skewSnaps&&(e.skewSnaps=a.skewSnaps),n.skewSnapTolerance!==a.skewSnapTolerance&&(e.skewSnapTolerance=a.skewSnapTolerance);const s=n.handleStyle||t,i=a.handleStyle||t;s.color===i.color&&s.outlineColor===i.outlineColor&&s.outlineThickness===i.outlineThickness&&s.radius===i.radius&&s.shape===i.shape||(e.handleStyle=i);const l=n.wireframeStyle||t,c=a.wireframeStyle||t;l.color===c.color&&l.thickness===c.thickness||(e.wireframeStyle=c)}});return e.Transformer=s,e}({},ReactPixi,PIXI);Object.assign(this.ReactPixi,_pixi_essentials_react_bindings);
//# sourceMappingURL=react-bindings.js.map
