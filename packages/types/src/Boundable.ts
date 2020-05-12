import { Rectangle } from '@pixi/math';

/**
 * An object that can be represented by an axis-aligned bounding box
 *
 * @interface
 */
export interface Boundable {
    /**
     * @returns {PIXI.Rectangle} axis-aligned bounding box inside which this object exists
     */
    getBounds(): Rectangle;
}
