// import { Point } from '@pixi/math';
import { Point } from 'pixi.js';

/**
 * Rectangle object is an area defined by its position, as indicated by its top-left corner
 * point (x, y) and by its width and its height.
 *
 * @public
 */
export class AxisAlignedBounds
{
    public currentID: number;
    public dirtyID: number;

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
    constructor(x = 0, y = 0, width = 0, height = 0)
    {
        this._x = Number(x);
        this._y = Number(y);
        this._width = Number(width);
        this._height = Number(height);
        this._hull = [new Point(), new Point(), new Point(), new Point()];

        this.currentID = -1;
        this.dirtyID = 0;
    }

    get x(): number
    {
        return this._x;
    }
    set x(value: number)
    {
        this._x = value;
        this.dirtyID++;
    }

    get y(): number
    {
        return this._y;
    }
    set y(value: number)
    {
        this._y = value;
        this.dirtyID++;
    }

    get width(): number
    {
        return this._width;
    }
    set width(value: number)
    {
        this._width = value;
        this.dirtyID++;
    }

    get height(): number
    {
        return this._height;
    }
    set height(value: number)
    {
        this._height = value;
        this.dirtyID++;
    }

    get hull(): Point[]
    {
        if (this.isDirty()) this.update();

        return this._hull;
    }

    get topLeft(): Point
    {
        if (this.isDirty()) this.update();

        return this._hull[0];
    }

    get topRight(): Point
    {
        if (this.isDirty()) this.update();

        return this._hull[1];
    }

    get bottomRight(): Point
    {
        if (this.isDirty()) this.update();

        return this._hull[2];
    }

    get bottomLeft(): Point
    {
        if (this.isDirty()) this.update();

        return this._hull[3];
    }

    protected isDirty(): boolean
    {
        return this.currentID !== this.dirtyID;
    }

    protected update(): void
    {
        const [topLeft, topRight, bottomRight, bottomLeft] = this._hull;

        topLeft.set(this._x, this._y);
        topRight.set(this._x + this._width, this._y);
        bottomRight.set(this._x + this._width, this._y + this._height);
        bottomLeft.set(this._x, this._y + this._height);
    }

    /**
     * returns the left edge of the rectangle
     *
     * @member {number}
     */
    get left(): number
    {
        return this.x;
    }

    /**
     * returns the right edge of the rectangle
     */
    get right(): number
    {
        return this.x + this.width;
    }

    /**
     * returns the top edge of the rectangle
     */
    get top(): number
    {
        return this.y;
    }

    /**
     * returns the bottom edge of the rectangle
     */
    get bottom(): number
    {
        return this.y + this.height;
    }

    /**
     * Creates a clone of this Rectangle
     *
     * @return A copy of this AxisAlignedBounds.
     */
    clone(): AxisAlignedBounds
    {
        return new AxisAlignedBounds(this.x, this.y, this.width, this.height);
    }

    /**
     * Copies another rectangle to this one.
     *
     * @param rectangle - The rectangle to copy from.
     * @return Returns itself.
     */
    copyFrom(rectangle: AxisAlignedBounds): AxisAlignedBounds
    {
        this.x = rectangle.x;
        this.y = rectangle.y;
        this.width = rectangle.width;
        this.height = rectangle.height;

        return this;
    }

    /**
     * Copies this rectangle to another one.
     *
     * @param rectangle - The rectangle to copy to.
     * @return Returns given parameter.
     */
    copyTo(rectangle: AxisAlignedBounds): AxisAlignedBounds
    {
        rectangle.x = this.x;
        rectangle.y = this.y;
        rectangle.width = this.width;
        rectangle.height = this.height;

        return rectangle;
    }

    /**
     * Checks whether the x and y coordinates given are contained within this Rectangle
     *
     * @param x - The X coordinate of the point to test
     * @param y - The Y coordinate of the point to test
     * @return Whether the x/y coordinates are within this Rectangle
     */
    contains(x: number, y: number): boolean
    {
        if (this.width <= 0 || this.height <= 0)
        {
            return false;
        }

        if (x >= this.x && x < this.x + this.width)
        {
            if (y >= this.y && y < this.y + this.height)
            {
                return true;
            }
        }

        return false;
    }

    /**
     * Checks whether the given {@code bounds} are equal to this.
     *
     * @param bounds
     */
    equals(bounds: AxisAlignedBounds): boolean
    {
        if (!bounds) return false;

        return bounds.x === this.x
            && bounds.y === this.y
            && bounds.width === this.width
            && bounds.height === this.height;
    }

    /**
     * Pads the rectangle making it grow in all directions.
     * If paddingY is omitted, both paddingX and paddingY will be set to paddingX.
     *
     * @param [paddingX=0] - The horizontal padding amount.
     * @param [paddingY=0] - The vertical padding amount.
     * @return Returns itself.
     */
    pad(paddingX = 0, paddingY = paddingX): this
    {
        this.x -= paddingX;
        this.y -= paddingY;

        this.width += paddingX * 2;
        this.height += paddingY * 2;

        return this;
    }

    /**
     * Fits this rectangle around the passed one.
     *
     * @param rectangle - The rectangle to fit.
     * @return Returns itself.
     */
    fit(rectangle: AxisAlignedBounds): this
    {
        const x1 = Math.max(this.x, rectangle.x);
        const x2 = Math.min(this.x + this.width, rectangle.x + rectangle.width);
        const y1 = Math.max(this.y, rectangle.y);
        const y2 = Math.min(this.y + this.height, rectangle.y + rectangle.height);

        this.x = x1;
        this.width = Math.max(x2 - x1, 0);
        this.y = y1;
        this.height = Math.max(y2 - y1, 0);

        return this;
    }

    /**
     * Enlarges rectangle that way its corners lie on grid
     *
     * @param [resolution=1] - resolution
     * @param [eps=0.001] - precision
     * @return Returns itself.
     */
    ceil(resolution = 1, eps = 0.001): this
    {
        const x2 = Math.ceil((this.x + this.width - eps) * resolution) / resolution;
        const y2 = Math.ceil((this.y + this.height - eps) * resolution) / resolution;

        this.x = Math.floor((this.x + eps) * resolution) / resolution;
        this.y = Math.floor((this.y + eps) * resolution) / resolution;

        this.width = x2 - this.x;
        this.height = y2 - this.y;

        return this;
    }

    /**
     * Enlarges this rectangle to include the passed rectangle.
     *
     * @param rectangle - The rectangle to include.
     * @return Returns itself.
     */
    enlarge(rectangle: AxisAlignedBounds): this
    {
        const x1 = Math.min(this.x, rectangle.x);
        const x2 = Math.max(this.x + this.width, rectangle.x + rectangle.width);
        const y1 = Math.min(this.y, rectangle.y);
        const y2 = Math.max(this.y + this.height, rectangle.y + rectangle.height);

        this.x = x1;
        this.width = x2 - x1;
        this.y = y1;
        this.height = y2 - y1;

        return this;
    }
}
