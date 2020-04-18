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
    batchID(displayObject: PIXI.DisplayObject): number;
}
