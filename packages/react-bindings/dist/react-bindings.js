/*!
 * @pixi-essentials/react-bindings - v1.0.0
 * Compiled Sat, 15 Aug 2020 21:31:08 UTC
 *
 * @pixi-essentials/react-bindings is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 * 
 * Copyright 2019-2020, Shukant K. Pal, All Rights Reserved
 */
this.ReactPixi=this.ReactPixi||{};var _pixi_essentials_react_bindings=function(e,r,t){"use strict";const n=r.PixiComponent("Transformer",{create:e=>new t.Transformer({group:e.group,handleConstructor:e.handleConstructor,handleStyle:e.handleStyle,wireframeStyle:e.wireframeStyle}),applyProps(e,r,t){if(e.group=t.group,r.handleConstructor!==t.handleConstructor)throw new Error("Transformer does not support changing the TransformerHandleConstructor!");r.handleStyle.color===t.handleStyle.color&&r.handleStyle.outlineColor===t.handleStyle.outlineColor&&r.handleStyle.outlineThickness===t.handleStyle.outlineThickness&&r.handleStyle.radius===t.handleStyle.radius&&r.handleStyle.shape===t.handleStyle.shape||(e.handleStyle=t.handleStyle),r.wireframeStyle.color===t.wireframeStyle.color&&r.wireframeStyle.thickness===t.wireframeStyle.thickness||(e.wireframeStyle=t.wireframeStyle)}});return e.Transformer=n,e}({},ReactPixi,PIXI);Object.assign(this.ReactPixi,_pixi_essentials_react_bindings);
//# sourceMappingURL=react-bindings.js.map
