/* eslint-disable */
 
/*!
 * @pixi-essentials/react-bindings - v1.0.1
 * Compiled Sun, 16 Aug 2020 19:22:28 UTC
 *
 * @pixi-essentials/react-bindings is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 * 
 * Copyright 2019-2020, Shukant K. Pal, All Rights Reserved
 */
import { PixiComponent } from '@inlet/react-pixi';
import { Transformer as Transformer$1 } from '@pixi-essentials/transformer';

const EMPTY = {};
/**
 * Transformer component
 *
 * @see https://github.com/SukantPal/pixi-essentials/tree/master/packages/transformer
 */
const Transformer = PixiComponent('Transformer', {
    create: (props) => new Transformer$1(props),
    applyProps(instance, oldProps, newProps) {
        instance.group = newProps.group;
        instance.centeredScaling = newProps.centeredScaling;
        instance.enabledHandles = newProps.enabledHandles;
        instance.skewRadius = newProps.skewRadius || instance.skewRadius;
        instance.rotateEnabled = newProps.rotateEnabled !== false;
        instance.scaleEnabled = newProps.scaleEnabled !== false;
        instance.skewEnabled = newProps.skewEnabled === true;
        instance.translateEnabled = newProps.translateEnabled !== false;
        instance.transientGroupTilt = newProps.transientGroupTilt;
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

export { Transformer };
//# sourceMappingURL=react-bindings.es.js.map
