/* eslint-disable */
 
/*!
 * @pixi-essentials/react-bindings - v1.0.0
 * Compiled Sat, 15 Aug 2020 21:57:06 UTC
 *
 * @pixi-essentials/react-bindings is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 * 
 * Copyright 2019-2020, Shukant K. Pal, All Rights Reserved
 */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var reactPixi = require('@inlet/react-pixi');
var transformer = require('@pixi-essentials/transformer');

const EMPTY = {};
/**
 * Transformer component
 *
 * @see https://github.com/SukantPal/pixi-essentials/tree/master/packages/transformer
 */
const Transformer = reactPixi.PixiComponent('Transformer', {
    create: (props) => {
        const instance = new transformer.Transformer({
            group: props.group,
            handleConstructor: props.handleConstructor,
            handleStyle: props.handleStyle,
            wireframeStyle: props.wireframeStyle,
        });
        return instance;
    },
    applyProps(instance, oldProps, newProps) {
        instance.group = newProps.group;
        if (oldProps.handleConstructor !== newProps.handleConstructor) {
            throw new Error('Transformer does not support changing the TransformerHandleConstructor!');
        }
        const oldHandleStyle = oldProps.handleStyle || EMPTY;
        const newHandleStyle = newProps.handleStyle || EMPTY;
        if (oldHandleStyle.color !== newHandleStyle.color
            || oldHandleStyle.outlineColor !== newHandleStyle.outlineColor
            || oldHandleStyle.outlineThickness !== newHandleStyle.outlineThickness
            || oldHandleStyle.radius !== newHandleStyle.radius
            || oldHandleStyle.shape !== newHandleStyle.shape) {
            instance.handleStyle = newHandleStyle;
        }
        const oldWireframeStyle = oldProps.wireframeStyle || EMPTY;
        const newWireframeStyle = newProps.wireframeStyle || EMPTY;
        if (oldWireframeStyle.color !== newWireframeStyle.color
            || oldWireframeStyle.thickness !== newWireframeStyle.thickness) {
            instance.wireframeStyle = newWireframeStyle;
        }
    },
});

exports.Transformer = Transformer;
//# sourceMappingURL=react-bindings.js.map
