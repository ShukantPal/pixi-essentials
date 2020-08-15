import { DisplayObject } from '@pixi/display';
import { PixiComponent } from '@inlet/react-pixi';
import { Transformer as TransformerImpl, TransformerHandle as TransformerHandleImpl } from '@pixi-essentials/transformer';

import type { ITransformerStyle, ITransformerHandleStyle } from '@pixi-essentials/transformer';

const EMPTY: any = {};

/**
 * @internal
 */
export type TransformerProps = {
    group?: DisplayObject[];
    handleConstructor?: typeof TransformerHandleImpl;
    handleStyle?: Partial<ITransformerHandleStyle>;
    wireframeStyle?: Partial<ITransformerStyle>;
};

/**
 * Transformer component
 *
 * @see https://github.com/SukantPal/pixi-essentials/tree/master/packages/transformer
 */
export const Transformer = PixiComponent<TransformerProps, TransformerImpl>('Transformer', {
    create: (props: TransformerProps): TransformerImpl =>
    {
        const instance = new TransformerImpl({
            group: props.group,
            handleConstructor: props.handleConstructor,
            handleStyle: props.handleStyle,
            wireframeStyle: props.wireframeStyle,
        });

        return instance;
    },
    applyProps(instance: TransformerImpl, oldProps: TransformerProps, newProps: TransformerProps): void
    {
        instance.group = newProps.group;

        if (oldProps.handleConstructor !== newProps.handleConstructor)
        {
            throw new Error('Transformer does not support changing the TransformerHandleConstructor!');
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
