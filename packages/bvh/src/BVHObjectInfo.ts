import { Point, Rectangle } from '@pixi/math';
import type { BVHObject } from './BVHObject';

/**
 * Stores all the information required from a `BVHObject`.
 *
 * @internal
 * @memberof PIXI
 * @class
 */
export class BVHObjectInfo
{
    public bounds: Rectangle;
    public boundaryLength: number;
    public centroid: Point;

    constructor()
    {
        /**
         * Axis-aligned bounding box
         * @member {PIXI.Rectangle}
         */
        this.bounds = new Rectangle();

        /**
         * Polygonal perimeter
         * @member {number}
         */
        this.boundaryLength = 0;

        /**
         * Polygonal centroid
         * @member {PIXI.Point}
         */
        this.centroid = new Point();
    }

    /**
     * Sets the bounds, boundary length, and centroid of this to those of the object.
     *
     * @param {BVHObject} object
     * @returns {BVHObjectInfo} this, useful for chaining
     */
    set(object: BVHObject): BVHObjectInfo
    {
        object.getBounds(this.bounds);
        object.getCentroid(this.centroid);

        this.boundaryLength = object.getBoundaryLength();

        return this;
    }
}
