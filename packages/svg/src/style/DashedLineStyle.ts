import { ConvertedStrokeStyle, StrokeStyle } from 'pixi.js';

export interface DashedStrokeStyle extends StrokeStyle
{
    dashArray: number[];
    dashOffset: number;
}

export type ConvertedDashedStrokeStyle = ConvertedStrokeStyle & { dashArray: number[]; dashOffset: number };
