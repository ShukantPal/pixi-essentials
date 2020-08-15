import { DisplayObject } from '@pixi/display';
import {
    Transformer as TransformerImpl,
    ITransformerHandleStyle,
    ITransformerStyle,
} from '@pixi-essentials/transformer';

declare type TransformerProps = {
    group?: DisplayObject[];
    handleConstructor?: typeof TransformerImpl;
    handleStyle?: Partial<ITransformerHandleStyle>;
    wireframeStyle?: Partial<ITransformerStyle>;
};

declare const Transformer: any;
