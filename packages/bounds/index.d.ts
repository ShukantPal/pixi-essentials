import { Matrix } from '@pixi/math';
import { Point } from '@pixi/math';

/**
 * Rectangle object is an area defined by its position, as indicated by its top-left corner
 * point (x, y) and by its width and its height.
 *
 * @public
 */
export declare class AxisAlignedBounds {
    currentID: number;
    dirtyID: number;
    protected _x: number;
    protected _y: number;
    protected _width: number;
    protected _height: number;
    protected _hull: [Point, Point, Point, Point];
    /**
     * @param [x=0] - The X coordinate of the upper-left corner of the rectangle
     * @param [y=0] - The Y coordinate of the upper-left corner of the rectangle
     * @param [width=0] - The overall width of this rectangle
     * @param [height=0] - The overall height of this rectangle
     */
    constructor(x?: number, y?: number, width?: number, height?: number);
    get x(): number;
    set x(value: number);
    get y(): number;
    set y(value: number);
    get width(): number;
    set width(value: number);
    get height(): number;
    set height(value: number);
    get hull(): Point[];
    get topLeft(): Point;
    get topRight(): Point;
    get bottomRight(): Point;
    get bottomLeft(): Point;
    protected isDirty(): boolean;
    protected update(): void;
    /**
     * returns the left edge of the rectangle
     *
     * @member {number}
     */
    get left(): number;
    /**
     * returns the right edge of the rectangle
     */
    get right(): number;
    /**
     * returns the top edge of the rectangle
     */
    get top(): number;
    /**
     * returns the bottom edge of the rectangle
     */
    get bottom(): number;
    /**
     * Creates a clone of this Rectangle
     *
     * @return A copy of this AxisAlignedBounds.
     */
    clone(): AxisAlignedBounds;
    /**
     * Copies another rectangle to this one.
     *
     * @param rectangle - The rectangle to copy from.
     * @return Returns itself.
     */
    copyFrom(rectangle: AxisAlignedBounds): AxisAlignedBounds;
    /**
     * Copies this rectangle to another one.
     *
     * @param rectangle - The rectangle to copy to.
     * @return Returns given parameter.
     */
    copyTo(rectangle: AxisAlignedBounds): AxisAlignedBounds;
    /**
     * Checks whether the x and y coordinates given are contained within this Rectangle
     *
     * @param x - The X coordinate of the point to test
     * @param y - The Y coordinate of the point to test
     * @return Whether the x/y coordinates are within this Rectangle
     */
    contains(x: number, y: number): boolean;
    /**
     * Checks whether the given {@code bounds} are equal to this.
     *
     * @param bounds
     */
    equals(bounds: AxisAlignedBounds): boolean;
    /**
     * Pads the rectangle making it grow in all directions.
     * If paddingY is omitted, both paddingX and paddingY will be set to paddingX.
     *
     * @param [paddingX=0] - The horizontal padding amount.
     * @param [paddingY=0] - The vertical padding amount.
     * @return Returns itself.
     */
    pad(paddingX?: number, paddingY?: number): this;
    /**
     * Fits this rectangle around the passed one.
     *
     * @param rectangle - The rectangle to fit.
     * @return Returns itself.
     */
    fit(rectangle: AxisAlignedBounds): this;
    /**
     * Enlarges rectangle that way its corners lie on grid
     *
     * @param [resolution=1] - resolution
     * @param [eps=0.001] - precision
     * @return Returns itself.
     */
    ceil(resolution?: number, eps?: number): this;
    /**
     * Enlarges this rectangle to include the passed rectangle.
     *
     * @param rectangle - The rectangle to include.
     * @return Returns itself.
     */
    enlarge(rectangle: AxisAlignedBounds): this;
}

/**
 * An oriented bounding box is a rotated rectangle.
 *
 * An oriented bounding box is modelled by rotating its (axis-aligned) {@link OrientedBounds#innerBounds}
 * by an angle {@link OrientedBounds#angle} around its center. The center of an oriented bounding box and
 * its axis-aligned inner-bounds coincide.
 *
 * @public
 */
export declare class OrientedBounds {
    innerBounds: AxisAlignedBounds;
    currentID: number;
    dirtyID: number;
    protected _rotation: number;
    protected _center: Point;
    protected _hull: [Point, Point, Point, Point];
    protected _matrix: Matrix;
    /**
     * @param innerBounds
     * @param angle
     */
    constructor(innerBounds: AxisAlignedBounds, angle?: number);
    /**
     * @param x
     * @param y
     * @param width
     * @param height
     * @param angle
     */
    constructor(x?: number, y?: number, width?: number, height?: number, angle?: number);
    /**
     * The angle, in radians, by which this bounding box is tilted.
     */
    get rotation(): number;
    set rotation(value: number);
    /**
     * The center of this bounding box.
     *
     * The center of this and {@code this.innerBounds} will always coincide.
     */
    get center(): Point;
    set center(value: Point);
    /**
     * The four-corners of this bounding, in clockwise order starting from the top-left.
     *
     * @readonly
     */
    get hull(): [Point, Point, Point, Point];
    /**
     * The top-left corner of this bounding box. The returned instance should not be modified directly.
     *
     * @readonly
     */
    get topLeft(): Point;
    /**
     * The top-right corner of this bounding box. The returned instance should not be modified directly.
     *
     * @readonly
     */
    get topRight(): Point;
    /**
     * The bottom-right corner of this bounding box. The returned instance should not be modified directly.
     */
    get bottomRight(): Point;
    /**
     * The bottom-left corner of this bounding box. The returned instance should not be modified directly.
     */
    get bottomLeft(): Point;
    /**
     * Checks whether the given {@code bounds} are equal to this.
     *
     * @param bounds
     */
    equals(bounds: OrientedBounds): boolean;
    /**
     * Whether this bounding box contains the given point
     *
     * @param point
     */
    contains(point: Point | number, y?: number): boolean;
    /**
     * Copies {@code bounds} into this instance.
     *
     * @param bounds
     */
    copyFrom(bounds: OrientedBounds): this;
    /**
     * Whether any internal state needs to be recalculated.
     */
    protected isDirty(): boolean;
    /**
     * This will recalculate the center, orientation matrix, and the hull vertices. It should be called only if
     * {@code this.isDirty} returns true.
     */
    protected update(): void;
    /**
     * This will translate {@link OrientedBounds#innerBounds} after {@link OrientedBounds#center} is
     * changed to ensure consistency.
     */
    private updateCenter;
}

export { }
