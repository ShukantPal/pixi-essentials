import { Geometry } from '@pixi/core';
import { Rectangle } from '@pixi/math';
/**
 * {@class BoundedGeometry} is an abstraction for a geometry whose bounding box is
 * known in the local space.
 *
 * @class
 * @extends PIXI.Geometry
 */
export abstract class BoundedGeometry extends Geometry
{
    /**
     * Calculates the minimum bounding box of the geometry in its vertex/local reference frame.
     *
     * @param {Rectangle}[rect] - output rectangle
     */
    abstract getBounds(rect?: Rectangle): Rectangle;
}
