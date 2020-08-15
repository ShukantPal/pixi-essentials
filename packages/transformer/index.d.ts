import { Container } from '@pixi/display';
import { DisplayObject } from '@pixi/display';
import { Matrix } from '@pixi/math';
import { OrientedBounds } from '@pixi-essentials/bounds';
import { Point } from '@pixi/math';

declare interface ITransformerOptions {
    boundsFunc: (object: DisplayObject) => OrientedBounds;
}

export declare class Transformer extends Container {
    protected _targetList: DisplayObject[];
    protected _boundsFunc: (object: DisplayObject) => OrientedBounds;
    constructor(options?: Partial<ITransformerOptions>);
    /**
     * Calculates the positions of the four corners of the display-object. The quadrilateral formed by
     * these points will be the tightest fit around it.
     *
     * @param displayObject - The display object whose corners are to be calculated
     * @param transform - The transform applied on the display-object. By default, this is its world-transform
     * @param corners - Optional array of four points to put the result into
     * @param index - Optional index into "corners"
     */
    static calculateTransformedCorners(displayObject: DisplayObject, transform?: Matrix, corners?: Point[], index?: number): Point[];
    /**
     * Calculates the oriented bounding box of the display-object. This would not bending with any skew
     * applied on the display-object, i.e. it is guaranteed to be rectangular.
     *
     * @param displayObject
     */
    static calculateOrientedBounds(displayObject: DisplayObject): OrientedBounds;
    /**
     * Calculates the oriented bounding box of a group of display-objects at a specific angle.
     *
     * @param group
     * @param angle
     * @param skipUpdate
     */
    static calculateGroupOrientedBounds(group: DisplayObject[], angle: number, skipUpdate?: boolean): OrientedBounds;
}

export { }
