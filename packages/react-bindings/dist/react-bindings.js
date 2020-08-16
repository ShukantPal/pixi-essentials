/*!
 * @pixi-essentials/react-bindings - v1.0.1
 * Compiled Sun, 16 Aug 2020 16:31:07 UTC
 *
 * @pixi-essentials/react-bindings is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 * 
 * Copyright 2019-2020, Shukant K. Pal, All Rights Reserved
 */
this.ReactPixi=this.ReactPixi||{};var _pixi_essentials_react_bindings=function(e,r,s){"use strict";const t={},i=r.PixiComponent("Transformer",{create:e=>new s.Transformer(e),applyProps(e,r,s){if(e.group=s.group,e.skewRadius=s.skewRadius||e.skewRadius,e.skewTransform=s.skewTransform,e.transientGroupTilt=s.transientGroupTilt,r.handleConstructor!==s.handleConstructor)throw new Error("Transformer does not support changing the TransformerHandleConstructor!");const i=r.handleStyle||t,n=s.handleStyle||t;i.color===n.color&&i.outlineColor===n.outlineColor&&i.outlineThickness===n.outlineThickness&&i.radius===n.radius&&i.shape===n.shape||(e.handleStyle=n);const o=r.wireframeStyle||t,a=s.wireframeStyle||t;o.color===a.color&&o.thickness===a.thickness||(e.wireframeStyle=a)}});return e.Transformer=i,e}({},ReactPixi,PIXI);Object.assign(this.ReactPixi,_pixi_essentials_react_bindings);
//# sourceMappingURL=react-bindings.js.map
