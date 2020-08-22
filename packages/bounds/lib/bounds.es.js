/* eslint-disable */
 
/*!
 * @pixi-essentials/bounds - v2.0.0
 * Compiled Sat, 22 Aug 2020 22:41:53 UTC
 *
 * @pixi-essentials/bounds is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 * 
 * Copyright 2019-2020, Shukant K. Pal <shukantpal@outlook.com>, All Rights Reserved
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
var AxisAlignedBounds = /** @class */ (function () {
    /**
     * @param {number} [x=0] - The X coordinate of the upper-left corner of the rectangle
     * @param {number} [y=0] - The Y coordinate of the upper-left corner of the rectangle
     * @param {number} [width=0] - The overall width of this rectangle
     * @param {number} [height=0] - The overall height of this rectangle
     */
    function AxisAlignedBounds(x, y, width, height) {
        if (x === void 0) { x = 0; }
        if (y === void 0) { y = 0; }
        if (width === void 0) { width = 0; }
        if (height === void 0) { height = 0; }
        this._x = Number(x);
        this._y = Number(y);
        this._width = Number(width);
        this._height = Number(height);
        this._hull = [new Point(), new Point(), new Point(), new Point()];
        this.currentID = -1;
        this.dirtyID = 0;
    }
    Object.defineProperty(AxisAlignedBounds.prototype, "x", {
        get: function () {
            return this._x;
        },
        set: function (value) {
            this._x = value;
            this.dirtyID++;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(AxisAlignedBounds.prototype, "y", {
        get: function () {
            return this._y;
        },
        set: function (value) {
            this._y = value;
            this.dirtyID++;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(AxisAlignedBounds.prototype, "width", {
        get: function () {
            return this._width;
        },
        set: function (value) {
            this._width = value;
            this.dirtyID++;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(AxisAlignedBounds.prototype, "height", {
        get: function () {
            return this._height;
        },
        set: function (value) {
            this._height = value;
            this.dirtyID++;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(AxisAlignedBounds.prototype, "hull", {
        get: function () {
            if (this.isDirty())
                this.update();
            return this._hull;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(AxisAlignedBounds.prototype, "topLeft", {
        get: function () {
            if (this.isDirty())
                this.update();
            return this._hull[0];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(AxisAlignedBounds.prototype, "topRight", {
        get: function () {
            if (this.isDirty())
                this.update();
            return this._hull[1];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(AxisAlignedBounds.prototype, "bottomRight", {
        get: function () {
            if (this.isDirty())
                this.update();
            return this._hull[2];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(AxisAlignedBounds.prototype, "bottomLeft", {
        get: function () {
            if (this.isDirty())
                this.update();
            return this._hull[3];
        },
        enumerable: false,
        configurable: true
    });
    AxisAlignedBounds.prototype.isDirty = function () {
        return this.currentID !== this.dirtyID;
    };
    AxisAlignedBounds.prototype.update = function () {
        var _a = this._hull, topLeft = _a[0], topRight = _a[1], bottomRight = _a[2], bottomLeft = _a[3];
        topLeft.set(this._x, this._y);
        topRight.set(this._x + this._width, this._y);
        bottomRight.set(this._x + this._width, this._y + this._height);
        bottomLeft.set(this._x, this._y + this._height);
    };
    Object.defineProperty(AxisAlignedBounds.prototype, "left", {
        /**
         * returns the left edge of the rectangle
         *
         * @member {number}
         */
        get: function () {
            return this.x;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(AxisAlignedBounds.prototype, "right", {
        /**
         * returns the right edge of the rectangle
         *
         * @member {number}
         */
        get: function () {
            return this.x + this.width;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(AxisAlignedBounds.prototype, "top", {
        /**
         * returns the top edge of the rectangle
         *
         * @member {number}
         */
        get: function () {
            return this.y;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(AxisAlignedBounds.prototype, "bottom", {
        /**
         * returns the bottom edge of the rectangle
         *
         * @member {number}
         */
        get: function () {
            return this.y + this.height;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Creates a clone of this Rectangle
     *
     * @return {PIXI.Rectangle} a copy of the rectangle
     */
    AxisAlignedBounds.prototype.clone = function () {
        return new AxisAlignedBounds(this.x, this.y, this.width, this.height);
    };
    /**
     * Copies another rectangle to this one.
     *
     * @param rectangle - The rectangle to copy from.
     * @return Returns itself.
     */
    AxisAlignedBounds.prototype.copyFrom = function (rectangle) {
        this.x = rectangle.x;
        this.y = rectangle.y;
        this.width = rectangle.width;
        this.height = rectangle.height;
        return this;
    };
    /**
     * Copies this rectangle to another one.
     *
     * @param rectangle - The rectangle to copy to.
     * @return Returns given parameter.
     */
    AxisAlignedBounds.prototype.copyTo = function (rectangle) {
        rectangle.x = this.x;
        rectangle.y = this.y;
        rectangle.width = this.width;
        rectangle.height = this.height;
        return rectangle;
    };
    /**
     * Checks whether the x and y coordinates given are contained within this Rectangle
     *
     * @param x - The X coordinate of the point to test
     * @param y - The Y coordinate of the point to test
     * @return Whether the x/y coordinates are within this Rectangle
     */
    AxisAlignedBounds.prototype.contains = function (x, y) {
        if (this.width <= 0 || this.height <= 0) {
            return false;
        }
        if (x >= this.x && x < this.x + this.width) {
            if (y >= this.y && y < this.y + this.height) {
                return true;
            }
        }
        return false;
    };
    /**
     * Checks whether the given {@link bounds} are equal to this.
     *
     * @param bounds
     */
    AxisAlignedBounds.prototype.equals = function (bounds) {
        if (!bounds)
            return false;
        return bounds.x === this.x
            && bounds.y === this.y
            && bounds.width === this.width
            && bounds.height === this.height;
    };
    /**
     * Pads the rectangle making it grow in all directions.
     * If paddingY is omitted, both paddingX and paddingY will be set to paddingX.
     *
     * @param [paddingX=0] - The horizontal padding amount.
     * @param [paddingY=0] - The vertical padding amount.
     * @return Returns itself.
     */
    AxisAlignedBounds.prototype.pad = function (paddingX, paddingY) {
        if (paddingX === void 0) { paddingX = 0; }
        if (paddingY === void 0) { paddingY = paddingX; }
        this.x -= paddingX;
        this.y -= paddingY;
        this.width += paddingX * 2;
        this.height += paddingY * 2;
        return this;
    };
    /**
     * Fits this rectangle around the passed one.
     *
     * @param rectangle - The rectangle to fit.
     * @return Returns itself.
     */
    AxisAlignedBounds.prototype.fit = function (rectangle) {
        var x1 = Math.max(this.x, rectangle.x);
        var x2 = Math.min(this.x + this.width, rectangle.x + rectangle.width);
        var y1 = Math.max(this.y, rectangle.y);
        var y2 = Math.min(this.y + this.height, rectangle.y + rectangle.height);
        this.x = x1;
        this.width = Math.max(x2 - x1, 0);
        this.y = y1;
        this.height = Math.max(y2 - y1, 0);
        return this;
    };
    /**
     * Enlarges rectangle that way its corners lie on grid
     *
     * @param [resolution=1] resolution
     * @param [eps=0.001] precision
     * @return Returns itself.
     */
    AxisAlignedBounds.prototype.ceil = function (resolution, eps) {
        if (resolution === void 0) { resolution = 1; }
        if (eps === void 0) { eps = 0.001; }
        var x2 = Math.ceil((this.x + this.width - eps) * resolution) / resolution;
        var y2 = Math.ceil((this.y + this.height - eps) * resolution) / resolution;
        this.x = Math.floor((this.x + eps) * resolution) / resolution;
        this.y = Math.floor((this.y + eps) * resolution) / resolution;
        this.width = x2 - this.x;
        this.height = y2 - this.y;
        return this;
    };
    /**
     * Enlarges this rectangle to include the passed rectangle.
     *
     * @param rectangle - The rectangle to include.
     * @return Returns itself.
     */
    AxisAlignedBounds.prototype.enlarge = function (rectangle) {
        var x1 = Math.min(this.x, rectangle.x);
        var x2 = Math.max(this.x + this.width, rectangle.x + rectangle.width);
        var y1 = Math.min(this.y, rectangle.y);
        var y2 = Math.max(this.y + this.height, rectangle.y + rectangle.height);
        this.x = x1;
        this.width = x2 - x1;
        this.y = y1;
        this.height = y2 - y1;
        return this;
    };
    return AxisAlignedBounds;
}());

/// <reference path="../node_modules/pixi.js/pixi.js.d.ts" />
/**
 * An oriented bounding box is a rotated rectangle.
 *
 * An oriented bounding box is modelled by rotating its (axis-aligned) {@link OrientedBounds#innerBounds}
 * by an angle {@link OrientedBounds#angle} around its center. The center of an oriented bounding box and
 * its axis-aligned inner-bounds coincide.
 */
var OrientedBounds = /** @class */ (function () {
    function OrientedBounds(x, y, width, height, angle) {
        if (x === void 0) { x = 0; }
        if (y === void 0) { y = 0; }
        if (width === void 0) { width = 0; }
        if (height === void 0) { height = 0; }
        if (angle === void 0) { angle = 0; }
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
    Object.defineProperty(OrientedBounds.prototype, "rotation", {
        /**
         * The angle, in radians, by which this bounding box is tilted.
         */
        get: function () {
            return this._rotation;
        },
        set: function (value) {
            this._rotation = value;
            this.dirtyID++;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(OrientedBounds.prototype, "center", {
        /**
         * The center of this bounding box.
         *
         * The center of this and {@code this.innerBounds} will always coincide.
         */
        get: function () {
            if (this.isDirty())
                this.update();
            return this._center;
        },
        set: function (value) {
            // this.updateCenter will automatically be fired!
            this.center.copyFrom(value);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(OrientedBounds.prototype, "hull", {
        /**
         * The four-corners of this bounding, in clockwise order starting from the top-left.
         *
         * @readonly
         */
        get: function () {
            if (this.isDirty())
                this.update();
            return this._hull;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(OrientedBounds.prototype, "topLeft", {
        /**
         * The top-left corner of this bounding box. The returned instance should not be modified directly.
         *
         * @readonly
         */
        get: function () {
            if (this.isDirty())
                this.update();
            return this._hull[0];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(OrientedBounds.prototype, "topRight", {
        /**
         * The top-right corner of this bounding box. The returned instance should not be modified directly.
         *
         * @readonly
         */
        get: function () {
            if (this.isDirty())
                this.update();
            return this._hull[1];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(OrientedBounds.prototype, "bottomRight", {
        /**
         * The bottom-right corner of this bounding box. The returned instance should not be modified directly.
         */
        get: function () {
            if (this.isDirty())
                this.update();
            return this._hull[2];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(OrientedBounds.prototype, "bottomLeft", {
        /**
         * The bottom-left corner of this bounding box. The returned instance should not be modified directly.
         */
        get: function () {
            if (this.isDirty())
                this.update();
            return this._hull[3];
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Checks whether the given {@code bounds} are equal to this.
     *
     * @param bounds
     */
    OrientedBounds.prototype.equals = function (bounds) {
        if (!bounds)
            return false;
        return this.innerBounds.equals(bounds.innerBounds)
            && this.rotation === bounds.rotation;
    };
    /**
     * Copies {@code bounds} into this instance.
     *
     * @param bounds
     */
    OrientedBounds.prototype.copyFrom = function (bounds) {
        this.innerBounds.copyFrom(bounds.innerBounds);
        this.rotation = bounds.rotation;
        this.dirtyID++;
        return this;
    };
    /**
     * Whether any internal state needs to be recalculated.
     */
    OrientedBounds.prototype.isDirty = function () {
        return this.currentID !== this.dirtyID + this.innerBounds.dirtyID;
    };
    /**
     * This will recalculate the center, orientation matrix, and the hull vertices. It should be called only if
     * {@code this.isDirty} returns true.
     */
    OrientedBounds.prototype.update = function () {
        var innerBounds = this.innerBounds;
        var angle = this._rotation;
        var center = this._center;
        var _a = this._hull, topLeft = _a[0], topRight = _a[1], bottomRight = _a[2], bottomLeft = _a[3];
        var matrix = this._matrix;
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
    };
    /**
     * This will translate {@link this.innerBounds} after {@link this.center} is changed to ensure consistency.
     */
    OrientedBounds.prototype.updateCenter = function () {
        var center = this.center;
        var innerBounds = this.innerBounds;
        innerBounds.x = center.x - (innerBounds.width / 2);
        innerBounds.y = center.y - (innerBounds.height / 2);
    };
    return OrientedBounds;
}());

export { AxisAlignedBounds, OrientedBounds };
//# sourceMappingURL=bounds.es.js.map
