import * as PIXI from 'pixi.js';
import { ObjectPoolFactory } from '@pixi-essentials/object-pool';

/**
 * This class wraps a queued display-object with extra information required to match it
 * with others for batching.
 *
 * @public
 * @memberof PIXI.ooo
 * @class
 */
export class BatchableEntity
{
    public displayObject: PIXI.DisplayObject;
    public layerID: number;
    public batchID: number;

    public next: BatchableEntity;
    public previous: BatchableEntity;

    public isRendered: boolean;
    public bounds: PIXI.Rectangle;

    constructor()
    {
        /**
         * The queued display-object
         * @member {PIXI.DisplayObject} displayObject
         */
        this.displayObject = null;

        /**
         * The no. of display-object directly underneath this one
         * @member {number}
         */
        this.layerID = 0;

        /**
         * The batch hash code uniquely identifying the batching dependencies (textures/uniforms) excluding
         * geometry. It is assumed there is no upper bound to the display-objects that can be rendered at once
         * with the same `batchID`.
         */
        this.batchID = 0;

        /**
         * Next batchable entity in queue
         * @member {PIXI.ooo.BatchableEntity}
         */
        this.next = null;

        /**
         * Previous batchable entity in queue
         * @member {PIXI.ooo.BatchableEntity}
         */
        this.previous = null;

        /**
         * Whether this has been rendered already.
         * @member {boolean}
         */
        this.isRendered = false;

        /**
         * Bounds of the display-object cached.
         * @member {PIXI.Rectangle}
         */
        this.bounds = new PIXI.Rectangle();
    }

    /**
     * Called after the display-object has been rendered.
     */
    rendered(): void
    {
        this.isRendered = true;

        // Remove from queue
        if (this.next && this.previous)
        {
            this.previous.next = this.next;
            this.next.previous = this.previous;
        }
        else if (this.next)
        {
            this.next.previous = null;
        }
        else if (this.previous)
        {
            this.previous.next = null;
        }

        this.next = null;
        this.previous = null;
    }

    /**
     * Resets this entity so it can be reused.
     */
    reset(): void
    {
        this.displayObject = null;
        this.layerID = 0;
        this.batchID = 0;

        this.next = null;
        this.previous = null;

        this.isRendered = false;
    }

    /**
     * Returns the bounds of the display-object, without any transform updates.
     *
     * @param {PIXI.Rectangle}[rect] - output rectangle
     * @returns {PIXI.Rectangle}
     */
    getBounds(rect?: PIXI.Rectangle): PIXI.Rectangle
    {
        if (rect)
        {
            rect.copyFrom(this.bounds);

            return rect;
        }

        return this.bounds.clone();
    }
}

export const entityPool = ObjectPoolFactory.build(BatchableEntity as any);
