import { Point, Rectangle } from '@pixi/math';

/**
 * A bounded polygon that has a measurable perimeter (boundary length). This is what constitutes a
 * leaf node in `BVHTree`.
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
     * @param {PIXI.Rectangle}[rect] - the rectangle to store the bounds in
     * @returns {PIXI.Rectangle}
     */
    getBounds(rect?: Rectangle): Rectangle;

    /**
     * The length of the polygon's boundary, i.e. its perimeter.
     *
     * @returns {number}
     */
    getBoundaryLength(): number;

    /**
     * The average of all vertices in this polygon
     *
     * @param {PIXI.Point}[point] - the point to store the centroid in
     * @returns {PIXI.Point}
     */
    getCentroid(point?: Point): Point;
}
