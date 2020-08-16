/*!
 * @pixi-essentials/react-bindings - v1.0.1
 * Compiled Sun, 16 Aug 2020 19:22:28 UTC
 *
 * @pixi-essentials/react-bindings is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 * 
 * Copyright 2019-2020, Shukant K. Pal, All Rights Reserved
 */
this.ReactPixi=this.ReactPixi||{};var _pixi_essentials_react_bindings=function(e,n,r){"use strict";const t={},a=n.PixiComponent("Transformer",{create:e=>new r.Transformer(e),applyProps(e,n,r){if(e.group=r.group,e.centeredScaling=r.centeredScaling,e.enabledHandles=r.enabledHandles,e.skewRadius=r.skewRadius||e.skewRadius,e.rotateEnabled=!1!==r.rotateEnabled,e.scaleEnabled=!1!==r.scaleEnabled,e.skewEnabled=!0===r.skewEnabled,e.translateEnabled=!1!==r.translateEnabled,e.transientGroupTilt=r.transientGroupTilt,n.handleConstructor!==r.handleConstructor)throw new Error("Transformer does not support changing the TransformerHandleConstructor!");const a=n.handleStyle||t,s=r.handleStyle||t;a.color===s.color&&a.outlineColor===s.outlineColor&&a.outlineThickness===s.outlineThickness&&a.radius===s.radius&&a.shape===s.shape||(e.handleStyle=s);const i=n.wireframeStyle||t,l=r.wireframeStyle||t;i.color===l.color&&i.thickness===l.thickness||(e.wireframeStyle=l)}});return e.Transformer=a,e}({},ReactPixi,PIXI);Object.assign(this.ReactPixi,_pixi_essentials_react_bindings);
//# sourceMappingURL=react-bindings.js.map
