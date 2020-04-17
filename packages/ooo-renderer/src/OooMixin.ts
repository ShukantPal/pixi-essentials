import * as PIXI from 'pixi.js';
import { autoDetectPreset, OooPipeline } from './pipeline';

/**
 * This interface defines extra properties needed to render a display-object
 * in the out-of-order rendering pipeline.
 *
 * @memberof PIXI.ooo
 * @interface OooRenderClient
 */
export interface OooRenderClient
{
    /**
     * Unique ID assigned by out-of-order renderer!
     * @member {number}
     */
    oooID: number;

    /**
     * The rendering pipeline defined
     * @member {PIXI.ooo.OooPipeline}
     */
    oooPipeline: OooPipeline;

    /**
     * Calculates the world space bounds of the display-object!
     *
     * @param {boolean}[skipUpdateTransform=false] - prevents recalculations
     * @param {PIXI.Rectangle}[rect] - output rect
     * @return {PIXI.Rectangle} - world space bounds
     */
    getBounds(skipUpdateTransform: boolean, rect: PIXI.Rectangle): PIXI.Rectangle;
}

/**
 * This mixin modifies the default Container behaviour in Pixi to be
 * compatible with out-of-order rendering.
 *
 * @namespace PIXI.ooo
 * @template <T extends PIXI.DisplayObject>
 * @param {T} displayObject - target to apply mixin on
 * @param {PIXI.ooo.OooPipeline}[pipeline=autoDetectPreset(displayObject)] - custom-defined rendering pipeline
 * @returns {T}
 */
export function OooMixin<T extends PIXI.DisplayObject>(
    displayObject: T, pipeline = autoDetectPreset(displayObject)): T
{
    const client = (displayObject as unknown) as OooRenderClient;

    client.oooID = 0;
    client.oooPipeline = pipeline;

    return ((client as unknown) as T);
}
