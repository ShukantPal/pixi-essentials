/* eslint-disable */
 
/*!
 * @pixi-essentials/react-bindings - v1.0.4
 * Compiled Thu, 20 Aug 2020 15:33:06 UTC
 *
 * @pixi-essentials/react-bindings is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 * 
 * Copyright 2019-2020, Shukant K. Pal, All Rights Reserved
 */
import { Matrix } from '@pixi/math';
import { PixiComponent } from '@inlet/react-pixi';
import { Transformer as Transformer$1 } from '@pixi-essentials/transformer';

/**
 * Removes old listeners and applies the new ones passed in the props
 *
 * @param displayObject - display-object emitting events
 * @param events - object mapping handler prop-names to the fired events
 * @param oldProps - old props. If calling on first props being passed, this should be `{}`.
 * @param newProps - new props.
 */
function applyEventProps(displayObject, events, oldProps, newProps) {
    for (const handlerName in events) {
        const oldHandler = oldProps[handlerName];
        const newHandler = newProps[handlerName];
        const event = events[handlerName];
        if (oldHandler !== newHandler) {
            if (oldHandler) {
                displayObject.off(event, oldHandler);
            }
            if (newHandler) {
                displayObject.on(event, newHandler);
            }
        }
    }
}

const EMPTY = {};
const IDENTITY_MATRIX = Matrix.IDENTITY; // Prevent reinstantation each time
/**
 * @ignore
 */
const HANDLER_TO_EVENT = {
    transformchange: 'transformchange',
    transformcommit: 'transformcommit',
};
/**
 * Transformer component
 *
 * @see https://github.com/SukantPal/pixi-essentials/tree/master/packages/transformer
 */
const Transformer = PixiComponent('Transformer', {
    create: (props) => {
        const transformerImpl = new Transformer$1(props);
        applyEventProps(transformerImpl, HANDLER_TO_EVENT, {}, props);
        return transformerImpl;
    },
    applyProps(instance, oldProps, newProps) {
        applyEventProps(instance, HANDLER_TO_EVENT, oldProps, newProps);
        instance.group = newProps.group || [];
        instance.centeredScaling = newProps.centeredScaling;
        instance.enabledHandles = newProps.enabledHandles;
        instance.projectionTransform.copyFrom(newProps.projectionTransform || IDENTITY_MATRIX);
        instance.skewRadius = newProps.skewRadius || instance.skewRadius;
        instance.rotateEnabled = newProps.rotateEnabled !== false;
        instance.scaleEnabled = newProps.scaleEnabled !== false;
        instance.skewEnabled = newProps.skewEnabled === true;
        instance.translateEnabled = newProps.translateEnabled !== false;
        instance.transientGroupTilt = newProps.transientGroupTilt;
        if (oldProps.handleConstructor !== newProps.handleConstructor) {
            throw new Error('Transformer does not support changing the TransformerHandleConstructor!');
        }
        if (oldProps.rotationSnaps !== newProps.rotationSnaps) {
            instance.rotationSnaps = newProps.rotationSnaps;
        }
        if (oldProps.rotationSnapTolerance !== newProps.rotationSnapTolerance) {
            instance.rotationSnapTolerance = newProps.rotationSnapTolerance;
        }
        if (oldProps.skewSnaps !== newProps.skewSnaps) {
            instance.skewSnaps = newProps.skewSnaps;
        }
        if (oldProps.skewSnapTolerance !== newProps.skewSnapTolerance) {
            instance.skewSnapTolerance = newProps.skewSnapTolerance;
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
