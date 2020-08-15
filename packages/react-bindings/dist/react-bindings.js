/*!
 * @pixi-essentials/react-bindings - v1.0.0
 * Compiled Sat, 15 Aug 2020 21:57:06 UTC
 *
 * @pixi-essentials/react-bindings is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 * 
 * Copyright 2019-2020, Shukant K. Pal, All Rights Reserved
 */
this.ReactPixi=this.ReactPixi||{};var _pixi_essentials_react_bindings=function(e,r,t){"use strict";const n={},o=r.PixiComponent("Transformer",{create:e=>new t.Transformer({group:e.group,handleConstructor:e.handleConstructor,handleStyle:e.handleStyle,wireframeStyle:e.wireframeStyle}),applyProps(e,r,t){if(e.group=t.group,r.handleConstructor!==t.handleConstructor)throw new Error("Transformer does not support changing the TransformerHandleConstructor!");const o=r.handleStyle||n,i=t.handleStyle||n;o.color===i.color&&o.outlineColor===i.outlineColor&&o.outlineThickness===i.outlineThickness&&o.radius===i.radius&&o.shape===i.shape||(e.handleStyle=i);const s=r.wireframeStyle||n,a=t.wireframeStyle||n;s.color===a.color&&s.thickness===a.thickness||(e.wireframeStyle=a)}});return e.Transformer=o,e}({},ReactPixi,PIXI);Object.assign(this.ReactPixi,_pixi_essentials_react_bindings);
//# sourceMappingURL=react-bindings.js.map
