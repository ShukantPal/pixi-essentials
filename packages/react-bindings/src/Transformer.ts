import { DisplayObject } from '@pixi/display';
import { Matrix } from '@pixi/math';
import { PixiComponent, applyDefaultProps } from '@inlet/react-pixi';
import { Transformer as TransformerImpl, TransformerHandle as TransformerHandleImpl } from '@pixi-essentials/transformer';
import { applyEventProps } from './utils/applyEventProps';

import type { ITransformerCursors, ITransformerStyle, ITransformerHandleStyle } from '@pixi-essentials/transformer';
import type React from 'react';

const EMPTY: any = {};

const IDENTITY_MATRIX = Matrix.IDENTITY;// Prevent reinstantation each time

/** @internal */
export type TransformerProps = {
    boundingBoxes?: 'all' | 'groupOnly' | 'none';
    boxScalingEnabled?: boolean;
    boxScalingTolerance?: number;
    boxRotationEnabled?: boolean;
    boxRotationTolerance?: number;
    centeredScaling?: boolean;
    cursors?: Partial<ITransformerCursors>;
    enabledHandles?: Array<string>;
    group?: DisplayObject[];
    handleConstructor?: typeof TransformerHandleImpl;
    handleStyle?: Partial<ITransformerHandleStyle>;
    lockAspectRatio?: boolean;
    projectionTransform?: Matrix;
    rotateEnabled?: boolean;
    rotationSnaps?: number[];
    rotationSnapTolerance?: number;
    scaleEnabled?: boolean;
    skewEnabled?: boolean;
    skewRadius?: number;
    skewSnaps?: number[];
    skewSnapTolerance?: number;
    translateEnabled?: boolean;
    transientGroupTilt?: boolean;
    transformchange?: () => void;
    wireframeStyle?: Partial<ITransformerStyle>;
};

/** @ignore */
const HANDLER_TO_EVENT = {
    transformchange: 'transformchange',
    transformcommit: 'transformcommit',
};

/**
 * Transformer component
 *
 * @see https://github.com/SukantPal/pixi-essentials/tree/master/packages/transformer
 */
export const Transformer: React.FC<TransformerProps> = PixiComponent<TransformerProps, TransformerImpl>('Transformer', {
    create: (props: TransformerProps): TransformerImpl => new TransformerImpl(props as any),
    applyProps(instance: TransformerImpl, oldProps: TransformerProps, newProps: TransformerProps): void
    {
        applyDefaultProps(instance, oldProps, newProps);
        applyEventProps(instance, HANDLER_TO_EVENT, oldProps, newProps);

        if (newProps.cursors)
        {
            Object.assign(instance.cursors, newProps.cursors);
        }

        instance.group = newProps.group || [];

        instance.boundingBoxes = newProps.boundingBoxes || 'all';
        instance.boxScalingEnabled = newProps.boxScalingEnabled === true;
        instance.boxScalingTolerance = newProps.boxScalingTolerance !== undefined
            ? newProps.boxScalingTolerance : instance.boxScalingTolerance;
        instance.boxRotationEnabled = newProps.boxRotationEnabled === true;
        instance.boxRotationTolerance = newProps.boxRotationTolerance !== undefined
            ? newProps.boxRotationTolerance : instance.boxRotationTolerance;
        instance.centeredScaling = newProps.centeredScaling;
        instance.enabledHandles = newProps.enabledHandles as any;
        instance.lockAspectRatio = newProps.lockAspectRatio;
        instance.projectionTransform.copyFrom(newProps.projectionTransform || IDENTITY_MATRIX);
        instance.skewRadius = newProps.skewRadius || instance.skewRadius;
        instance.rotateEnabled = newProps.rotateEnabled !== false;
        instance.scaleEnabled = newProps.scaleEnabled !== false;
        instance.skewEnabled = newProps.skewEnabled === true;
        instance.translateEnabled = newProps.translateEnabled !== false;
        instance.transientGroupTilt = newProps.transientGroupTilt;

        if (oldProps.handleConstructor !== newProps.handleConstructor)
        {
            throw new Error('Transformer does not support changing the TransformerHandleConstructor!');
        }

        if (oldProps.rotationSnaps !== newProps.rotationSnaps)
        {
            instance.rotationSnaps = newProps.rotationSnaps;
        }
        if (oldProps.rotationSnapTolerance !== newProps.rotationSnapTolerance)
        {
            instance.rotationSnapTolerance = newProps.rotationSnapTolerance;
        }
        if (oldProps.skewSnaps !== newProps.skewSnaps)
        {
            instance.skewSnaps = newProps.skewSnaps;
        }
        if (oldProps.skewSnapTolerance !== newProps.skewSnapTolerance)
        {
            instance.skewSnapTolerance = newProps.skewSnapTolerance;
        }

        const oldHandleStyle = oldProps.handleStyle || EMPTY;
        const newHandleStyle = newProps.handleStyle || EMPTY;

        if (oldHandleStyle.color !== newHandleStyle.color
                || oldHandleStyle.outlineColor !== newHandleStyle.outlineColor
                || oldHandleStyle.outlineThickness !== newHandleStyle.outlineThickness
                || oldHandleStyle.radius !== newHandleStyle.radius
                || oldHandleStyle.shape !== newHandleStyle.shape)
        {
            instance.handleStyle = newHandleStyle;
        }

        const oldWireframeStyle = oldProps.wireframeStyle || EMPTY;
        const newWireframeStyle = newProps.wireframeStyle || EMPTY;

        if (oldWireframeStyle.color !== newWireframeStyle.color
            || oldWireframeStyle.thickness !== newWireframeStyle.thickness)
        {
            instance.wireframeStyle = newWireframeStyle;
        }
    },
});
