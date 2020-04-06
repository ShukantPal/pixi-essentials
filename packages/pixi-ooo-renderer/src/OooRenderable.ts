import * as PIXI from 'pixi.js';

/**
 * This mixin defines the subset of properties on a `PIXI.DisplayObject`
 * required for out-of-order rendering.
 *
 * @namespace PIXI.ooo
 * @class
 */
export class OooRenderable
{
    /**
     * Unique ID assigned by the out-of-order renderer when buffered.
     * @member {number}
     */
    oooID?: number;

    /**
     * The opaqueness of the object when rendered to the screen.
     * @member {number}
     */
    worldAlpha?: number;
}
