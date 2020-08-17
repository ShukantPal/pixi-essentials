/*!
 * @pixi-essentials/react-bindings - v1.0.2
 * Compiled Mon, 17 Aug 2020 15:35:55 UTC
 *
 * @pixi-essentials/react-bindings is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 * 
 * Copyright 2019-2020, Shukant K. Pal, All Rights Reserved
 */
this.ReactPixi=this.ReactPixi||{};var _pixi_essentials_react_bindings=function(e,n,a){"use strict";const r={},t=n.PixiComponent("Transformer",{create:e=>new a.Transformer(e),applyProps(e,n,a){if(e.group=a.group||[],e.centeredScaling=a.centeredScaling,e.enabledHandles=a.enabledHandles,e.skewRadius=a.skewRadius||e.skewRadius,e.rotateEnabled=!1!==a.rotateEnabled,e.scaleEnabled=!1!==a.scaleEnabled,e.skewEnabled=!0===a.skewEnabled,e.translateEnabled=!1!==a.translateEnabled,e.transientGroupTilt=a.transientGroupTilt,n.handleConstructor!==a.handleConstructor)throw new Error("Transformer does not support changing the TransformerHandleConstructor!");n.rotationSnaps!==a.rotationSnaps&&(e.rotationSnaps=a.rotationSnaps),n.rotationSnapTolerance!==a.rotationSnapTolerance&&(e.rotationSnapTolerance=a.rotationSnapTolerance),n.skewSnaps!==a.skewSnaps&&(e.skewSnaps=a.skewSnaps),n.skewSnapTolerance!==a.skewSnapTolerance&&(e.skewSnapTolerance=a.skewSnapTolerance);const t=n.handleStyle||r,s=a.handleStyle||r;t.color===s.color&&t.outlineColor===s.outlineColor&&t.outlineThickness===s.outlineThickness&&t.radius===s.radius&&t.shape===s.shape||(e.handleStyle=s);const o=n.wireframeStyle||r,i=a.wireframeStyle||r;o.color===i.color&&o.thickness===i.thickness||(e.wireframeStyle=i)}});return e.Transformer=t,e}({},ReactPixi,PIXI);Object.assign(this.ReactPixi,_pixi_essentials_react_bindings);
//# sourceMappingURL=react-bindings.js.map
