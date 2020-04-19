import * as PIXI from 'pixi.js';

/**
 * Used to generating a unique-ID for display-objects with different batching dependencies
 * (like textures or uniforms) excluding the geometry.
 *
 * @memberof PIXI.ooo
 * @interface
 */
export interface IBatchHasher
{
    /**
     * @param {PIXI.DisplayObject} displayObject
     */
    batchID(displayObject: PIXI.DisplayObject): number;

    /**
     * The no. of batches that can be stacked and rendered in one draw call in the given renderer.
     *
     * @param {PIXI.Renderer} renderer
     */
    stackSize(renderer: PIXI.Renderer): number;
}
