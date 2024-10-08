import { Container, IFederatedContainer } from "pixi.js";

export { Transformer } from './Transformer';
export { TransformerHandle } from './TransformerHandle';
export { TransformerWireframe } from './TransformerWireframe';

export type {
    Handle,
    RotateHandle,
    ScaleHandle,
    SkewHandle,
    ITransformerOptions,
    ITransformerStyle,
    ITransformerCursors,
} from './Transformer';
export type { ITransformerHandleStyle } from './TransformerHandle';

export interface IFederatedDisplayObject extends IFederatedContainer {}

export class DisplayObject extends Container {
  constructor() {
    super();
  }
}