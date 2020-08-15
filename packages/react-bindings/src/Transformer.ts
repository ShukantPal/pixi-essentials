import { DisplayObject } from '@pixi/display';
import { PixiComponent } from '@inlet/react-pixi';
import { Transformer as TransformerImpl, TransformerHandle as TransformerHandleImpl } from '@pixi-essentials/transformer';

import type { ITransformerStyle, ITransformerHandleStyle } from '@pixi-essentials/transformer';

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

        if (oldProps.handleStyle.color !== newProps.handleStyle.color
                || oldProps.handleStyle.outlineColor !== newProps.handleStyle.outlineColor
                || oldProps.handleStyle.outlineThickness !== newProps.handleStyle.outlineThickness
                || oldProps.handleStyle.radius !== newProps.handleStyle.radius
                || oldProps.handleStyle.shape !== newProps.handleStyle.shape)
        {
            instance.handleStyle = newProps.handleStyle;
        }

        if (oldProps.wireframeStyle.color !== newProps.wireframeStyle.color
            || oldProps.wireframeStyle.thickness !== newProps.wireframeStyle.thickness)
        {
            instance.wireframeStyle = newProps.wireframeStyle;
        }
    },
});
