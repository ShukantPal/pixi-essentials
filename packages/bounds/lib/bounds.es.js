/* eslint-disable */
 
/*!
 * @pixi-essentials/bounds - v1.0.0
 * Compiled Sat, 15 Aug 2020 20:19:34 UTC
 *
 * @pixi-essentials/bounds is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 * 
 * Copyright 2019-2020, Shukant K. Pal, All Rights Reserved
 */
import { Point, ObservablePoint, Matrix } from '@pixi/math';

/// <reference path="../node_modules/pixi.js/pixi.js.d.ts" />
/**
 * Rectangle object is an area defined by its position, as indicated by its top-left corner
 * point (x, y) and by its width and its height.
 *
 * @class
 * @memberof PIXI
 */
class AxisAlignedBounds {
    /**
     * @param {number} [x=0] - The X coordinate of the upper-left corner of the rectangle
     * @param {number} [y=0] - The Y coordinate of the upper-left corner of the rectangle
     * @param {number} [width=0] - The overall width of this rectangle
     * @param {number} [height=0] - The overall height of this rectangle
     */
    constructor(x = 0, y = 0, width = 0, height = 0) {
        this._x = Number(x);
        this._y = Number(y);
        this._width = Number(width);
        this._height = Number(height);
        this._hull = [new Point(), new Point(), new Point(), new Point()];
        this.currentID = -1;
        this.dirtyID = 0;
    }
    get x() {
        return this._x;
    }
    set x(value) {
        this._x = value;
        this.dirtyID++;
    }
    get y() {
        return this._y;
    }
    set y(value) {
        this._y = value;
        this.dirtyID++;
    }
    get width() {
        return this._width;
    }
    set width(value) {
        this._width = value;
        this.dirtyID++;
    }
    get height() {
        return this._height;
    }
    set height(value) {
        this._height = value;
        this.dirtyID++;
    }
    get hull() {
        if (this.isDirty())
            this.update();
        return this._hull;
    }
    get topLeft() {
        if (this.isDirty())
            this.update();
        return this._hull[0];
    }
    get topRight() {
        if (this.isDirty())
            this.update();
        return this._hull[1];
    }
    get bottomRight() {
        if (this.isDirty())
            this.update();
        return this._hull[2];
    }
    get bottomLeft() {
        if (this.isDirty())
            this.update();
        return this._hull[3];
    }
    isDirty() {
        return this.currentID !== this.dirtyID;
    }
    update() {
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
    get left() {
        return this.x;
    }
    /**
     * returns the right edge of the rectangle
     *
     * @member {number}
     */
    get right() {
        return this.x + this.width;
    }
    /**
     * returns the top edge of the rectangle
     *
     * @member {number}
     */
    get top() {
        return this.y;
    }
    /**
     * returns the bottom edge of the rectangle
     *
     * @member {number}
     */
    get bottom() {
        return this.y + this.height;
    }
    /**
     * Creates a clone of this Rectangle
     *
     * @return {PIXI.Rectangle} a copy of the rectangle
     */
    clone() {
        return new AxisAlignedBounds(this.x, this.y, this.width, this.height);
    }
    /**
     * Copies another rectangle to this one.
     *
     * @param rectangle - The rectangle to copy from.
     * @return Returns itself.
     */
    copyFrom(rectangle) {
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
    copyTo(rectangle) {
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
    contains(x, y) {
        if (this.width <= 0 || this.height <= 0) {
            return false;
        }
        if (x >= this.x && x < this.x + this.width) {
            if (y >= this.y && y < this.y + this.height) {
                return true;
            }
        }
        return false;
    }
    /**
     * Checks whether the given {@link bounds} are equal to this.
     *
     * @param bounds
     */
    equals(bounds) {
        if (!bounds)
            return false;
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
    pad(paddingX = 0, paddingY = paddingX) {
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
    fit(rectangle) {
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
     * @param [resolution=1] resolution
     * @param [eps=0.001] precision
     * @return Returns itself.
     */
    ceil(resolution = 1, eps = 0.001) {
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
    enlarge(rectangle) {
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

/// <reference path="../node_modules/pixi.js/pixi.js.d.ts" />
/**
 * An oriented bounding box is a rotated rectangle.
 *
 * An oriented bounding box is modelled by rotating its (axis-aligned) {@link OrientedBounds#innerBounds}
 * by an angle {@link OrientedBounds#angle} around its center. The center of an oriented bounding box and
 * its axis-aligned inner-bounds coincide.
 */
class OrientedBounds {
    constructor(x = 0, y = 0, width = 0, height = 0, angle = 0) {
        if (x instanceof AxisAlignedBounds) {
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
        this._center = new ObservablePoint(this.updateCenter, this);
        this._hull = [new Point(), new Point(), new Point(), new Point()];
        this._matrix = new Matrix();
        this.currentID = -1;
        this.dirtyID = 0;
    }
    /**
     * The angle, in radians, by which this bounding box is tilted.
     */
    get rotation() {
        return this._rotation;
    }
    set rotation(value) {
        this._rotation = value;
        this.dirtyID++;
    }
    /**
     * The center of this bounding box.
     *
     * The center of this and {@code this.innerBounds} will always coincide.
     */
    get center() {
        if (this.isDirty())
            this.update();
        return this._center;
    }
    set center(value) {
        // this.updateCenter will automatically be fired!
        this.center.copyFrom(value);
    }
    /**
     * The four-corners of this bounding, in clockwise order starting from the top-left.
     *
     * @readonly
     */
    get hull() {
        if (this.isDirty())
            this.update();
        return this._hull;
    }
    /**
     * The top-left corner of this bounding box. The returned instance should not be modified directly.
     *
     * @readonly
     */
    get topLeft() {
        if (this.isDirty())
            this.update();
        return this._hull[0];
    }
    /**
     * The top-right corner of this bounding box. The returned instance should not be modified directly.
     *
     * @readonly
     */
    get topRight() {
        if (this.isDirty())
            this.update();
        return this._hull[1];
    }
    /**
     * The bottom-right corner of this bounding box. The returned instance should not be modified directly.
     */
    get bottomRight() {
        if (this.isDirty())
            this.update();
        return this._hull[2];
    }
    /**
     * The bottom-left corner of this bounding box. The returned instance should not be modified directly.
     */
    get bottomLeft() {
        if (this.isDirty())
            this.update();
        return this._hull[3];
    }
    /**
     * Checks whether the given {@code bounds} are equal to this.
     *
     * @param bounds
     */
    equals(bounds) {
        if (!bounds)
            return false;
        return this.innerBounds.equals(bounds.innerBounds)
            && this.rotation === bounds.rotation;
    }
    /**
     * Copies {@code bounds} into this instance.
     *
     * @param bounds
     */
    copyFrom(bounds) {
        this.innerBounds.copyFrom(bounds.innerBounds);
        this.rotation = bounds.rotation;
        this.dirtyID++;
        return this;
    }
    /**
     * Whether any internal state needs to be recalculated.
     */
    isDirty() {
        return this.currentID !== this.dirtyID + this.innerBounds.dirtyID;
    }
    /**
     * This will recalculate the center, orientation matrix, and the hull vertices. It should be called only if
     * {@code this.isDirty} returns true.
     */
    update() {
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
    updateCenter() {
        const center = this.center;
        const innerBounds = this.innerBounds;
        innerBounds.x = center.x - (innerBounds.width / 2);
        innerBounds.y = center.y - (innerBounds.height / 2);
    }
}

export { AxisAlignedBounds, OrientedBounds };
//# sourceMappingURL=bounds.es.js.map
