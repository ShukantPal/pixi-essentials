/* eslint-disable */
 
/*!
 * @pixi-essentials/react-bindings - v1.0.5
 * Compiled Sat, 22 Aug 2020 21:46:47 UTC
 *
 * @pixi-essentials/react-bindings is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 * 
 * Copyright 2019-2020, Shukant K. Pal <shukantpal@outlook.com>, All Rights Reserved
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
    for (var handlerName in events) {
        var oldHandler = oldProps[handlerName];
        var newHandler = newProps[handlerName];
        var event = events[handlerName];
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

var EMPTY = {};
var IDENTITY_MATRIX = Matrix.IDENTITY; // Prevent reinstantation each time
/**
 * @ignore
 */
var HANDLER_TO_EVENT = {
    transformchange: 'transformchange',
    transformcommit: 'transformcommit',
};
/**
 * Transformer component
 *
 * @see https://github.com/SukantPal/pixi-essentials/tree/master/packages/transformer
 */
var Transformer = PixiComponent('Transformer', {
    create: function (props) { return new Transformer$1(props); },
    applyProps: function (instance, oldProps, newProps) {
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
        var oldHandleStyle = oldProps.handleStyle || EMPTY;
        var newHandleStyle = newProps.handleStyle || EMPTY;
        if (oldHandleStyle.color !== newHandleStyle.color
            || oldHandleStyle.outlineColor !== newHandleStyle.outlineColor
            || oldHandleStyle.outlineThickness !== newHandleStyle.outlineThickness
            || oldHandleStyle.radius !== newHandleStyle.radius
            || oldHandleStyle.shape !== newHandleStyle.shape) {
            instance.handleStyle = newHandleStyle;
        }
        var oldWireframeStyle = oldProps.wireframeStyle || EMPTY;
        var newWireframeStyle = newProps.wireframeStyle || EMPTY;
        if (oldWireframeStyle.color !== newWireframeStyle.color
            || oldWireframeStyle.thickness !== newWireframeStyle.thickness) {
            instance.wireframeStyle = newWireframeStyle;
        }
    },
});

export { Transformer };
//# sourceMappingURL=react-bindings.es.js.map
