import { DisplayObject } from '@pixi/display';
import {
    ITransformerHandleStyle,
    ITransformerStyle,
} from '@pixi-essentials/transformer';
import React from 'react';

declare type TransformerProps = {
    centeredScaling?: boolean;
    group?: DisplayObject[];
    handleConstructor?: any;
    handleStyle?: Partial<ITransformerHandleStyle>;
    rotateEnabled?: boolean;
    scaleEnabled?: boolean;
    skewEnabled?: boolean;
    skewRadius?: number;
    translateEnabled?: boolean;
    transientGroupTilt?: boolean;
    wireframeStyle?: Partial<ITransformerStyle>;
};

declare const Transformer: React.FC<TransformerProps>;
