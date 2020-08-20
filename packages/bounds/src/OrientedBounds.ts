/// <reference path="../node_modules/pixi.js/pixi.js.d.ts" />
import { AxisAlignedBounds } from './AxisAlignedBounds';
import { Matrix, ObservablePoint, Point } from '@pixi/math';

/**
 * An oriented bounding box is a rotated rectangle.
 *
 * An oriented bounding box is modelled by rotating its (axis-aligned) {@link OrientedBounds#innerBounds}
 * by an angle {@link OrientedBounds#angle} around its center. The center of an oriented bounding box and
 * its axis-aligned inner-bounds coincide.
 */
export class OrientedBounds
{
    public innerBounds: AxisAlignedBounds;
    public currentID: number;
    public dirtyID: number;

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

    constructor(x: number | AxisAlignedBounds = 0, y = 0, width = 0, height = 0, angle = 0)
    {
        if (x instanceof AxisAlignedBounds)
        {
            angle = y || 0;

            y = x.y;
            width = x.width;
            height = x.height;

            x = x.x;
        }

        /**
         * The unrotated version of this bounding box.
         */
        this.innerBounds = new AxisAlignedBounds(x, y, width, height);

        this._rotation = angle;
        this._center = new ObservablePoint<OrientedBounds>(this.updateCenter, this);
        this._hull = [new Point(), new Point(), new Point(), new Point()];
        this._matrix = new Matrix();

        this.currentID = -1;
        this.dirtyID = 0;
    }

    /**
     * The angle, in radians, by which this bounding box is tilted.
     */
    get rotation(): number
    {
        return this._rotation;
    }

    set rotation(value: number)
    {
        this._rotation = value;
        this.dirtyID++;
    }

    /**
     * The center of this bounding box.
     *
     * The center of this and {@code this.innerBounds} will always coincide.
     */
    get center(): ObservablePoint
    {
        if (this.isDirty()) this.update();

        return this._center;
    }

    set center(value: Point)
    {
        // this.updateCenter will automatically be fired!
        this.center.copyFrom(value);
    }

    /**
     * The four-corners of this bounding, in clockwise order starting from the top-left.
     *
     * @readonly
     */
    get hull(): [Point, Point, Point, Point]
    {
        if (this.isDirty()) this.update();

        return this._hull;
    }

    /**
     * The top-left corner of this bounding box. The returned instance should not be modified directly.
     *
     * @readonly
     */
    get topLeft(): Point
    {
        if (this.isDirty()) this.update();

        return this._hull[0];
    }

    /**
     * The top-right corner of this bounding box. The returned instance should not be modified directly.
     *
     * @readonly
     */
    get topRight(): Point
    {
        if (this.isDirty()) this.update();

        return this._hull[1];
    }

    /**
     * The bottom-right corner of this bounding box. The returned instance should not be modified directly.
     */
    get bottomRight(): Point
    {
        if (this.isDirty()) this.update();

        return this._hull[2];
    }

    /**
     * The bottom-left corner of this bounding box. The returned instance should not be modified directly.
     */
    get bottomLeft(): Point
    {
        if (this.isDirty()) this.update();

        return this._hull[3];
    }

    /**
     * Checks whether the given {@code bounds} are equal to this.
     *
     * @param bounds
     */
    equals(bounds: OrientedBounds): boolean
    {
        if (!bounds) return false;

        return this.innerBounds.equals(bounds.innerBounds)
            && this.rotation === bounds.rotation;
    }

    /**
     * Copies {@code bounds} into this instance.
     *
     * @param bounds
     */
    copyFrom(bounds: OrientedBounds): this
    {
        this.innerBounds.copyFrom(bounds.innerBounds);
        this.rotation = bounds.rotation;
        this.dirtyID++;

        return this;
    }

    /**
     * Whether any internal state needs to be recalculated.
     */
    protected isDirty(): boolean
    {
        return this.currentID !== this.dirtyID + this.innerBounds.dirtyID;
    }

    /**
     * This will recalculate the center, orientation matrix, and the hull vertices. It should be called only if
     * {@code this.isDirty} returns true.
     */
    protected update(): void
    {
        const innerBounds = this.innerBounds;
        const angle = this._rotation;

        const center = this._center;
        const [topLeft, topRight, bottomRight, bottomLeft] = this._hull;
        const matrix = this._matrix;

        // Calculate center
        // Do not set [x|y] so to prevent this.updateCenter from being fired!
        center._x = innerBounds.x + (innerBounds.width / 2);
        center._y = innerBounds.y + (innerBounds.height / 2);

        // Calculate orientation matrix
        matrix.identity()
            .translate(-center.x, -center.y)
            .rotate(angle)
            .translate(center.x, center.y);

        // Calculate hull vertices
        matrix.apply(innerBounds.topLeft, topLeft);
        matrix.apply(innerBounds.topRight, topRight);
        matrix.apply(innerBounds.bottomRight, bottomRight);
        matrix.apply(innerBounds.bottomLeft, bottomLeft);

        // Update currentID so isDirty() is false
        this.currentID = this.dirtyID + this.innerBounds.dirtyID;
    }

    /**
     * This will translate {@link this.innerBounds} after {@link this.center} is changed to ensure consistency.
     */
    private updateCenter(): void
    {
        const center = this.center;
        const innerBounds = this.innerBounds;

        innerBounds.x = center.x - (innerBounds.width / 2);
        innerBounds.y = center.y - (innerBounds.height / 2);
    }
}
