/* eslint-disable */
 
/*!
 * @pixi-essentials/react-bindings - v1.0.0
 * Compiled Sat, 15 Aug 2020 21:31:08 UTC
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
        if (oldProps.handleStyle.color !== newProps.handleStyle.color
            || oldProps.handleStyle.outlineColor !== newProps.handleStyle.outlineColor
            || oldProps.handleStyle.outlineThickness !== newProps.handleStyle.outlineThickness
            || oldProps.handleStyle.radius !== newProps.handleStyle.radius
            || oldProps.handleStyle.shape !== newProps.handleStyle.shape) {
            instance.handleStyle = newProps.handleStyle;
        }
        if (oldProps.wireframeStyle.color !== newProps.wireframeStyle.color
            || oldProps.wireframeStyle.thickness !== newProps.wireframeStyle.thickness) {
            instance.wireframeStyle = newProps.wireframeStyle;
        }
    },
});

exports.Transformer = Transformer;
//# sourceMappingURL=react-bindings.js.map
