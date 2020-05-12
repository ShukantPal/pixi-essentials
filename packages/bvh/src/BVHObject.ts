import { Point, Rectangle } from '@pixi/math';

/**
 * A bounded polygon that has a measurable perimeter (boundary length). This can be used with
 * `PIXI.BVHSystem` to create bounded volume hierarchies.
 *
 * It is expected that these polygons are **convex**.
 *
 * @memberof PIXI
 * @interface
 */
export interface BVHObject
{
    /**
     * The axis-aligned bounding box for this object
     *
     * @returns {Rectangle}
     */
    getBounds(): Rectangle;

    /**
     * The length of the polygon's boundary, i.e. its perimeter.
     *
     * @returns {number}
     */
    getBoundaryLength(): number;

    /**
     * The average of all vertices in this polygon
     *
     * @returns {PIXI.Point}
     */
    getCentroid(): Point;
}
