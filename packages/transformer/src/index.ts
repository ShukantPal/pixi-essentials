// This will ensure the InteractionTarget mixin is applied on DisplayObject.
import '@pixi/interaction';

export { Transformer } from './Transformer';
export { TransformerHandle } from './TransformerHandle';
export { TransformerWireframe } from './TransformerWireframe';

export type {
    Handle,
    RotateHandle,
    ScaleHandle,
    SkewHandle,
    ITransformerOptions,
    ITransformerStyle
} from './Transformer';
export type { ITransformerHandleStyle } from './TransformerHandle';
