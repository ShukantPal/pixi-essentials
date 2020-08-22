/* eslint-disable */
 
/*!
 * @pixi-essentials/transformer - v2.0.5
 * Compiled Sat, 22 Aug 2020 23:15:48 UTC
 *
 * @pixi-essentials/transformer is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 * 
 * Copyright 2019-2020, Shukant K. Pal <shukantpal@outlook.com>, All Rights Reserved
 */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

require('@pixi/interaction');
var display = require('@pixi/display');
var math = require('@pixi/math');
var graphics = require('@pixi/graphics');
var bounds = require('@pixi-essentials/bounds');
var objectPool = require('@pixi-essentials/object-pool');

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise */

var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
    return extendStatics(d, b);
};

function __extends(d, b) {
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

function __spreadArrays() {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
}

/// <reference path="./types.d.ts" />
/**
 * The default transformer handle style.
 *
 * @ignore
 */
var DEFAULT_HANDLE_STYLE = {
    color: 0xffffff,
    outlineColor: 0x000000,
    outlineThickness: 1,
    radius: 8,
    shape: 'tooth',
};
/**
 * The transfomer handle base implementation.
 */
var TransformerHandle = /** @class */ (function (_super) {
    __extends(TransformerHandle, _super);
    /**
     * @param {string} handle - the type of handle being drawn
     * @param {object} styleOpts - styling options passed by the user
     * @param {function} handler - handler for drag events, it receives the pointer position; used by {@code onDrag}.
     * @param {function} commit - handler for drag-end events.
     * @param {string}[cursor='move'] - a custom cursor to be applied on this handle
     */
    function TransformerHandle(handle, styleOpts, handler, commit, cursor) {
        if (styleOpts === void 0) { styleOpts = {}; }
        var _this = _super.call(this) || this;
        var style = Object.assign({}, DEFAULT_HANDLE_STYLE, styleOpts);
        _this._handle = handle;
        _this._style = style;
        _this.onHandleDelta = handler;
        _this.onHandleCommit = commit;
        /**
         * This flags whether this handle should be redrawn in the next frame due to style changes.
         */
        _this._dirty = true;
        // Pointer events
        _this.interactive = true;
        _this.cursor = cursor || 'move';
        _this._pointerDown = false;
        _this._pointerDragging = false;
        _this._pointerPosition = new math.Point();
        _this.on('mousedown', _this.onPointerDown, _this);
        _this.on('mousemove', _this.onPointerMove, _this);
        _this.on('mouseup', _this.onPointerUp, _this);
        _this.on('mouseupoutside', _this.onPointerUp, _this);
        return _this;
    }
    Object.defineProperty(TransformerHandle.prototype, "style", {
        /**
         * The currently applied handle style.
         */
        get: function () {
            return this._style;
        },
        set: function (value) {
            this._style = Object.assign({}, DEFAULT_HANDLE_STYLE, value);
            this._dirty = true;
        },
        enumerable: false,
        configurable: true
    });
    TransformerHandle.prototype.render = function (renderer) {
        if (this._dirty) {
            this.draw();
            this._dirty = false;
        }
        _super.prototype.render.call(this, renderer);
    };
    /**
     * Redraws the handle's geometry. This is called on a `render` if {@code this._dirty} is true.
     */
    TransformerHandle.prototype.draw = function () {
        var handle = this._handle;
        var style = this._style;
        var radius = style.radius;
        this.lineStyle(style.outlineThickness, style.outlineColor)
            .beginFill(style.color);
        if (style.shape === 'square') {
            this.drawRect(-radius / 2, -radius / 2, radius, radius);
        }
        else if (style.shape === 'tooth') {
            switch (handle) {
                case 'middleLeft':
                    this.drawPolygon([
                        -radius / 2, -radius / 2,
                        -radius / 2, radius / 2,
                        radius / 2, radius / 2,
                        radius * 1.1, 0,
                        radius / 2, -radius / 2,
                    ]);
                    break;
                case 'topCenter':
                    this.drawPolygon([
                        -radius / 2, -radius / 2,
                        radius / 2, -radius / 2,
                        radius / 2, radius / 2,
                        0, radius * 1.1,
                        -radius / 2, radius / 2,
                    ]);
                    break;
                case 'middleRight':
                    this.drawPolygon([
                        -radius / 2, radius / 2,
                        -radius * 1.1, 0,
                        -radius / 2, -radius / 2,
                        radius / 2, -radius / 2,
                        radius / 2, radius / 2,
                    ]);
                    break;
                case 'bottomCenter':
                    this.drawPolygon([
                        0, -radius * 1.1,
                        radius / 2, -radius / 2,
                        radius / 2, radius / 2,
                        -radius / 2, radius / 2,
                        -radius / 2, -radius / 2,
                    ]);
                    break;
                case 'rotator':
                    this.drawCircle(0, 0, radius / Math.sqrt(2));
                    break;
                default:
                    this.drawRect(-radius / 2, -radius / 2, radius, radius);
                    break;
            }
        }
        else {
            this.drawCircle(0, 0, radius);
        }
        this.endFill();
    };
    /**
     * Handles the `pointerdown` event. You must call the super implementation.
     *
     * @param e
     */
    TransformerHandle.prototype.onPointerDown = function (e) {
        this._pointerDown = true;
        this._pointerDragging = false;
        e.stopPropagation();
    };
    /**
     * Handles the `pointermove` event. You must call the super implementation.
     *
     * @param e
     */
    TransformerHandle.prototype.onPointerMove = function (e) {
        if (!this._pointerDown) {
            return;
        }
        if (this._pointerDragging) {
            this.onDrag(e);
        }
        else {
            this.onDragStart(e);
        }
        e.stopPropagation();
    };
    /**
     * Handles the `pointerup` event. You must call the super implementation.
     *
     * @param e
     */
    TransformerHandle.prototype.onPointerUp = function (e) {
        if (this._pointerDragging) {
            this.onDragEnd(e);
        }
        this._pointerDown = false;
    };
    /**
     * Called on the first `pointermove` when {@code this._pointerDown} is true. You must call the super implementation.
     *
     * @param e
     */
    TransformerHandle.prototype.onDragStart = function (e) {
        this._pointerPosition.copyFrom(e.data.global);
        this._pointerDragging = true;
    };
    /**
     * Called on a `pointermove` when {@code this._pointerDown} & {@code this._pointerDragging}.
     *
     * @param e
     */
    TransformerHandle.prototype.onDrag = function (e) {
        var currentPosition = e.data.global;
        // Callback handles the rest!
        if (this.onHandleDelta) {
            this.onHandleDelta(currentPosition);
        }
        this._pointerPosition.copyFrom(currentPosition);
    };
    /**
     * Called on a `pointerup` or `pointerupoutside` & {@code this._pointerDragging} was true.
     *
     * @param _
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    TransformerHandle.prototype.onDragEnd = function (_) {
        this._pointerDragging = false;
        if (this.onHandleCommit) {
            this.onHandleCommit();
        }
    };
    return TransformerHandle;
}(graphics.Graphics));

/// <reference path="../types.d.ts" />
var tempMatrix = new math.Matrix();
/**
 * @param angle
 * @returns a horizontal skew matrix
 */
function createHorizontalSkew(angle) {
    var matrix = tempMatrix.identity();
    matrix.c = Math.tan(angle);
    return matrix;
}
/**
 * @param angle
 * @returns a vertical skew matrix
 */
function createVerticalSkew(angle) {
    var matrix = tempMatrix.identity();
    matrix.b = Math.tan(angle);
    return matrix;
}

/// <reference path="../types.d.ts" />
/**
 * Decomposes the matrix into transform, while preserving rotation & the pivot.
 *
 * @ignore
 * @param transform
 * @param matrix
 * @param rotation
 * @param pivot
 */
function decomposeTransform(transform, matrix, rotation, pivot) {
    if (pivot === void 0) { pivot = transform.pivot; }
    var a = matrix.a;
    var b = matrix.b;
    var c = matrix.c;
    var d = matrix.d;
    var skewX = -Math.atan2(-c, d);
    var skewY = Math.atan2(b, a);
    rotation = rotation !== undefined && rotation !== null ? rotation : skewY;
    // set pivot
    transform.pivot.set(pivot.x, pivot.y);
    // next set rotation, skew angles
    transform.rotation = rotation;
    transform.skew.x = rotation + skewX;
    transform.skew.y = -rotation + skewY;
    // next set scale
    transform.scale.x = Math.sqrt((a * a) + (b * b));
    transform.scale.y = Math.sqrt((c * c) + (d * d));
    // next set position
    transform.position.x = matrix.tx + ((pivot.x * matrix.a) + (pivot.y * matrix.c));
    transform.position.y = matrix.ty + ((pivot.x * matrix.b) + (pivot.y * matrix.d));
    return transform;
}

/// <reference path="../types.d.ts" />
var tempMatrix$1 = new math.Matrix();
var tempParentMatrix = new math.Matrix();
/**
 * Multiplies the transformation matrix {@code transform} to the display-object's transform.
 *
 * @param displayObject
 * @param transform
 * @param skipUpdate
 */
function multiplyTransform(displayObject, transform, skipUpdate) {
    if (!skipUpdate) {
        var parent = !displayObject.parent ? displayObject.enableTempParent() : displayObject.parent;
        displayObject.updateTransform();
        displayObject.disableTempParent(parent);
    }
    var worldTransform = displayObject.worldTransform;
    var parentTransform = displayObject.parent
        ? tempParentMatrix.copyFrom(displayObject.parent.worldTransform)
        : math.Matrix.IDENTITY;
    tempMatrix$1.copyFrom(worldTransform);
    tempMatrix$1.prepend(transform);
    tempMatrix$1.prepend(parentTransform.invert()); // gets new "local" transform
    decomposeTransform(displayObject.transform, tempMatrix$1);
}

/// <reference path="./types.d.ts" />
// Preallocated objects
var tempTransform = new math.Transform();
var tempCorners = [new math.Point(), new math.Point(), new math.Point(), new math.Point()];
var tempMatrix$2 = new math.Matrix();
var tempPoint = new math.Point();
var tempBounds = new bounds.OrientedBounds();
var tempRect = new math.Rectangle();
var tempHull = [new math.Point(), new math.Point(), new math.Point(), new math.Point()];
var tempPointer = new math.Point();
// Pool for allocating an arbitrary number of points
var pointPool = objectPool.ObjectPoolFactory.build(math.Point);
/**
 * Specific cursors for each handle
 *
 * @internal
 * @ignore
 */
var HANDLE_TO_CURSOR = {
    topLeft: 'nw-resize',
    topCenter: 'n-resize',
    topRight: 'ne-resize',
    middleLeft: 'w-resize',
    middleRight: 'e-resize',
    bottomLeft: 'sw-resize',
    bottomCenter: 's-resize',
    bottomRight: 'se-resize',
};
/**
 * An array of all {@link ScaleHandle} values.
 *
 * @internal
 * @ignore
 */
var SCALE_HANDLES = [
    'topLeft',
    'topCenter',
    'topRight',
    'middleLeft',
    'middleCenter',
    'middleRight',
    'bottomLeft',
    'bottomCenter',
    'bottomRight',
];
/**
 * This maps each scaling handle to the directions in which the x, y components are outward. A value of
 * zero means that no scaling occurs along that component's axis.
 *
 * @internal
 * @ignore
 */
var SCALE_COMPONENTS = {
    topLeft: { x: -1, y: -1 },
    topCenter: { x: 0, y: -1 },
    topRight: { x: 1, y: -1 },
    middleLeft: { x: -1, y: 0 },
    middleCenter: { x: 0, y: 0 },
    middleRight: { x: 1, y: 0 },
    bottomLeft: { x: -1, y: 1 },
    bottomCenter: { x: 0, y: 1 },
    bottomRight: { x: 1, y: 1 },
};
/**
 * All possible values of {@link Handle}.
 *
 * @ignore
 */
var HANDLES = __spreadArrays(SCALE_HANDLES, [
    'rotator',
    'skewHorizontal',
    'skewVertical',
]);
/**
 * The default snap angles for rotation, in radians.
 *
 * @ignore
 */
var DEFAULT_ROTATION_SNAPS = [
    Math.PI / 4,
    Math.PI / 2,
    Math.PI * 3 / 4,
    Math.PI,
    -Math.PI / 4,
    -Math.PI / 2,
    -Math.PI * 3 / 4,
    -Math.PI,
];
/**
 * The default snap tolerance, i.e. the maximum angle b/w the pointer & nearest snap ray for snapping.
 *
 * @ignore
 */
var DEFAULT_ROTATION_SNAP_TOLERANCE = Math.PI / 90;
/**
 * The default snap angles for skewing, in radians.
 *
 * @ignore
 */
var DEFAULT_SKEW_SNAPS = [
    Math.PI / 4,
    -Math.PI / 4,
];
/**
 * The default snap tolerance for skewing.
 *
 * @ignore
 */
var DEFAULT_SKEW_SNAP_TOLERANCE = Math.PI / 90;
/**
 * The default wireframe style for {@link Transformer}.
 *
 * @ignore
 */
var DEFAULT_WIREFRAME_STYLE = {
    color: 0x000000,
    thickness: 2,
};
/**
 * {@code Transformer} provides an interactive interface for editing the transforms in a group. It supports translating,
 * scaling, rotating, and skewing display-objects both through interaction and code.
 *
 * A transformer operates in world-space, and it is best to not to position, scale, rotate, or skew one. If you do so, the
 * wireframe itself will not distort (i.e. will adapt _against_ your transforms). However, the wireframe may become
 * thinner/thicker and the handles will scale & rotate. For example, setting `transformer.scale.set(2)` will make the handles
 * twice as big, but will not scale the wireframe (assuming the display-object group itself has not been
 * scaled up).
 *
 * NOTE: The transformer needs to capture all interaction events that would otherwise go to the display-objects in the
 * group. Hence, it must be placed after them in the scene graph.
 */
var Transformer = /** @class */ (function (_super) {
    __extends(Transformer, _super);
    /* eslint-disable max-len */
    /**
     * | Handle                | Type                     | Notes |
     * | --------------------- | ------------------------ | ----- |
     * | rotator               | Rotate                   | |
     * | topLeft               | Scale                    | |
     * | topCenter             | Scale                    | |
     * | topRight              | Scale                    | |
     * | middleLeft            | Scale                    | |
     * | middleCenter          | Scale                    | This cannot be enabled!                                             |
     * | middleRight           | Scale                    | |
     * | bottomLeft            | Scale                    | |
     * | bottomCenter          | Scale                    | |
     * | bottomRight           | Scale                    | |
     * | skewHorizontal        | Skew                     | Applies vertical shear. Handle segment is horizontal at skew.y = 0! |
     * | skewVertical          | Skew                     | Applied horizontal shear. Handle segment is vertical at skew.x = 0! |
     *
     * @param {object}[options]
     * @param {DisplayObject[]}[options.group] - the group of display-objects being transformed
     * @param {boolean}[options.enabledHandles] - specifically define which handles are to be enabled
     * @param {typeof TransformerHandle}[options.handleConstructor] - a custom transformer-handle class
     * @param {object}[options.handleStyle] - styling options for the handle. These cannot be modified afterwards!
     * @param {number}[options.handleStyle.color=0xffffff] - handle color
     * @param {string}[options.handleStyle.outlineColor=0x000000] - color of the handle outline (stroke)
     * @param {string}[options.handleStyle.outlineThickness=1] - thickness of the handle outline (stroke)
     * @param {number}[options.handleStyle.radius=8] - dimensions of the handle
     * @param {string}[options.handleStyle.shape='tooth'] - 'circle', 'tooth', or 'square'
     * @param {boolean}[options.handleStyle.scaleInvariant] - whether the handles should not become bigger when the whole scene
     *  is scaled up.
     * @param {boolean}[options.rotateEnabled=true] - whether rotate handles are enabled
     * @param {number[]}[options.rotationSnaps] - the rotation snap angles, in radians. By default, transformer will
     *      snap for each 1/8th of a revolution.
     * @param {number}[options.rotationSnapTolerance] - the snap tolerance for rotation in radians
     * @param {boolean}[options.scaleEnabled=true] - whether scale handles are enabled
     * @param {boolean}[options.skewEnabled=true] - whether skew handles are enabled
     * @param {number}[options.skewRadius] - distance of skew handles from center of transformer box
     *      (`skewTransform` should be enabled)
     * @param {number[]}[options.skewSnaps] - the skew snap angles, in radians.
     * @param {number}[options.skewSnapTolerance] - the skew snap tolerance angle.
     * @param {boolean}[options.translateEnabled=true] - whether dragging the transformer should move the group
     * @param {boolean}[options.transientGroupTilt=true] - whether the transformer should reset the wireframe's rotation
     *      after a rotator handle is "defocused".
     * @param {object}[options.wireframeStyle] - styling options for the wireframe.
     * @param {number}[options.wireframeStyle.color] - color of the lines
     * @param {number}[options.wireframeStyle.thickness] - thickness of the lines
     */
    function Transformer(options) {
        if (options === void 0) { options = {}; }
        var _this = 
        /* eslint-enable max-len */
        _super.call(this) || this;
        /**
         * This will translate the group by {@code delta} in their world-space.
         *
         * NOTE: There is no handle that provides translation. The user drags the transformer directly.
         *
         * @param delta
         */
        _this.translateGroup = function (delta) {
            _this._transformType = 'translate';
            // Translation matrix
            var matrix = tempMatrix$2
                .identity()
                .translate(delta.x, delta.y);
            _this.prependTransform(matrix);
        };
        /**
         * This will rotate the group such that the handle will come to {@code pointerPosition}.
         *
         * @param handle - the rotator handle was dragged
         * @param pointerPosition - the new pointer position, in screen space
         */
        _this.rotateGroup = function (handle, pointerPosition) {
            _this._transformType = 'rotate';
            var bounds = _this.groupBounds;
            var handlePosition = _this.worldTransform.apply(_this.handles[handle].position, tempPoint);
            _this.projectionTransform.applyInverse(handlePosition, handlePosition);
            pointerPosition = _this.projectionTransform.applyInverse(pointerPosition, tempPointer);
            // Center of rotation - does not change in transformation
            var rOrigin = bounds.center;
            // Original tilt
            var orgAngle = Math.atan2(handlePosition.y - rOrigin.y, handlePosition.x - rOrigin.x);
            // Final tilt
            var dstAngle = Math.atan2(pointerPosition.y - rOrigin.y, pointerPosition.x - rOrigin.x);
            // The angle by which bounds should be rotated
            var deltaAngle = dstAngle - orgAngle;
            // Snap
            var newRotation = _this.groupBounds.rotation + deltaAngle;
            newRotation = _this.snapAngle(newRotation, _this.rotationSnapTolerance, _this.rotationSnaps);
            deltaAngle = newRotation - _this.groupBounds.rotation;
            // Rotation matrix
            var matrix = tempMatrix$2
                .identity()
                .translate(-rOrigin.x, -rOrigin.y)
                .rotate(deltaAngle)
                .translate(rOrigin.x, rOrigin.y);
            _this.prependTransform(matrix, true);
            _this.updateGroupBounds(newRotation);
            // Rotation moves both skew.x & skew.y
            _this._skewX += deltaAngle;
            _this._skewY += deltaAngle;
        };
        /**
         * This will scale the group such that the scale handle will come under {@code pointerPosition}.
         *
         * @param handle - the scaling handle that was dragged
         * @param pointerPosition - the new pointer position, in screen space
         */
        _this.scaleGroup = function (handle, pointerPosition) {
            _this._transformType = 'scale';
            // Directions along x,y axes that will produce positive scaling
            var xDir = SCALE_COMPONENTS[handle].x;
            var yDir = SCALE_COMPONENTS[handle].y;
            var bounds = _this.groupBounds;
            var angle = bounds.rotation;
            var innerBounds = bounds.innerBounds;
            // Position of handle in the group's world-space
            var handlePosition = _this.worldTransform.apply(_this.handles[handle].position, tempPoint);
            _this.projectionTransform.applyInverse(handlePosition, handlePosition);
            pointerPosition = _this.projectionTransform.applyInverse(pointerPosition, tempPointer);
            // Delta vector in world frame
            var dx = pointerPosition.x - handlePosition.x;
            var dy = pointerPosition.y - handlePosition.y;
            // Unit vector along u-axis (horizontal axis after rotation) of bounds
            var uxvec = (bounds.topRight.x - bounds.topLeft.x) / innerBounds.width;
            var uyvec = (bounds.topRight.y - bounds.topLeft.y) / innerBounds.width;
            // Unit vector along v-axis (vertical axis after rotation) of bounds
            var vxvec = (bounds.bottomLeft.x - bounds.topLeft.x) / innerBounds.height;
            var vyvec = (bounds.bottomLeft.y - bounds.topLeft.y) / innerBounds.height;
            // Delta vector in rotated frame of bounds
            var du = (dx * uxvec) + (dy * uyvec);
            var dv = (dx * vxvec) + (dy * vyvec);
            // Scaling factors along x,y axes
            var sx = 1 + (du * xDir / innerBounds.width);
            var sy = 1 + (dv * yDir / innerBounds.height);
            var matrix = tempMatrix$2.identity();
            if (xDir !== 0) {
                // Origin of horizontal scaling - a point which does not move after applying the transform
                // eslint-disable-next-line no-nested-ternary
                var hsOrigin = !_this.centeredScaling ? (xDir === 1 ? bounds.topLeft : bounds.topRight) : bounds.center;
                matrix.translate(-hsOrigin.x, -hsOrigin.y)
                    .rotate(-angle)
                    .scale(sx, 1)
                    .rotate(angle)
                    .translate(hsOrigin.x, hsOrigin.y);
            }
            if (yDir !== 0) {
                // Origin of vertical scaling - a point which does not move after applying the transform
                // eslint-disable-next-line no-nested-ternary
                var vsOrigin = !_this.centeredScaling ? (yDir === 1 ? bounds.topLeft : bounds.bottomLeft) : bounds.center;
                matrix.translate(-vsOrigin.x, -vsOrigin.y)
                    .rotate(-angle)
                    .scale(1, sy)
                    .rotate(angle)
                    .translate(vsOrigin.x, vsOrigin.y);
            }
            _this.prependTransform(matrix);
        };
        /**
         * This will skew the group such that the skew handle would move to the {@code pointerPosition}.
         *
         * @param handle
         * @param pointerPosition - pointer position, in screen space
         */
        _this.skewGroup = function (handle, pointerPosition) {
            _this._transformType = 'skew';
            var bounds = _this.groupBounds;
            // Destination point
            var dst = tempPoint.copyFrom(pointerPosition);
            _this.projectionTransform.applyInverse(dst, dst);
            // Center of skew (same as center of rotation!)
            var sOrigin = bounds.center;
            // Skew matrix
            var matrix = tempMatrix$2.identity()
                .translate(-sOrigin.x, -sOrigin.y);
            var rotation = _this.groupBounds.rotation;
            if (handle === 'skewHorizontal') {
                var oldSkew = _this._skewX;
                // Calculate new skew
                _this._skewX = Math.atan2(dst.y - sOrigin.y, dst.x - sOrigin.x);
                _this._skewX = _this.snapAngle(_this._skewX, _this.skewSnapTolerance, _this.skewSnaps);
                // Skew by new skew.x
                matrix.prepend(createVerticalSkew(-oldSkew));
                matrix.prepend(createVerticalSkew(_this._skewX));
            }
            else // skewVertical
             {
                var oldSkew = _this._skewY;
                // Calculate new skew
                var newSkew = Math.atan2(dst.y - sOrigin.y, dst.x - sOrigin.x) - (Math.PI / 2);
                _this._skewY = newSkew;
                _this._skewY = _this.snapAngle(_this._skewY, _this.skewSnapTolerance, _this.skewSnaps);
                // HINT: skewY is applied negatively b/c y-axis is flipped
                matrix.prepend(createHorizontalSkew(oldSkew));
                matrix.prepend(createHorizontalSkew(-_this._skewY));
                rotation -= _this._skewY - oldSkew;
            }
            matrix.translate(sOrigin.x, sOrigin.y);
            _this.prependTransform(matrix, true);
            _this.updateGroupBounds(rotation);
        };
        /**
         * This is called after the user finishes dragging a handle. If {@link this.transientGroupTilt} is enabled, it will
         * reset the rotation of this group (if more than one display-object is grouped).
         */
        _this.commitGroup = function () {
            _this._transformType = 'none';
            if (_this.transientGroupTilt !== false && _this.group.length > 1) {
                _this.updateGroupBounds(0);
            }
            _this.emit('transformcommit');
        };
        _this.interactive = true;
        _this.cursor = 'move';
        /**
         * The group of display-objects under transformation.
         */
        _this.group = options.group || [];
        /**
         * This will prevent the wireframe's center from shifting on scaling.
         */
        _this.centeredScaling = !!options.centeredScaling;
        /**
         * This is used when the display-object group are rendered through a projection transformation (i.e. are disconnected
         * from the transformer in the scene graph). The transformer project itself into their frame-of-reference using this
         * transform.
         *
         * Specifically, the projection-transform converts points from the group's world space to the transformer's world
         * space. If you are not applying a projection on the transformer itself, this means it is the group's
         * world-to-screen transformation.
         */
        _this.projectionTransform = new math.Matrix();
        /**
         * The angles at which rotation should snap.
         */
        _this.rotationSnaps = options.rotationSnaps || DEFAULT_ROTATION_SNAPS;
        /**
         * The maximum angular difference for snapping rotation.
         */
        _this.rotationSnapTolerance = options.rotationSnapTolerance !== undefined
            ? options.rotationSnapTolerance
            : DEFAULT_ROTATION_SNAP_TOLERANCE;
        /**
         * The distance of skewing handles from the group's center.
         */
        _this.skewRadius = options.skewRadius || 64;
        /**
         * The angles at which both the horizontal & vertical skew handles should snap.
         */
        _this.skewSnaps = options.skewSnaps || DEFAULT_SKEW_SNAPS;
        /**
         * The maximum angular difference for snapping skew handles.
         */
        _this.skewSnapTolerance = options.skewSnapTolerance !== undefined
            ? options.skewSnapTolerance
            : DEFAULT_SKEW_SNAP_TOLERANCE;
        _this._rotateEnabled = options.rotateEnabled !== false;
        _this._scaleEnabled = options.scaleEnabled !== false;
        _this._skewEnabled = options.skewEnabled === true;
        /**
         * This will enable translation on dragging the transformer. By default, it is turned on.
         *
         * @default true
         */
        _this.translateEnabled = options.translateEnabled !== false;
        /**
         * This will reset the rotation angle after the user finishes rotating a group with more than one display-object.
         *
         * @default true
         */
        _this.transientGroupTilt = options.transientGroupTilt !== undefined ? options.transientGroupTilt : true;
        /**
         * Draws the bounding boxes
         */
        _this.wireframe = _this.addChild(new graphics.Graphics());
        /**
         * The horizontal skew value. Rotating the group by 𝜽 will also change this value by 𝜽.
         */
        _this._skewX = 0;
        /**
         * The vertical skew value. Rotating the group by 𝜽 will also change this value by 𝜽.
         */
        _this._skewY = 0;
        /**
         * The current type of transform being applied by the user.
         */
        _this._transformType = 'none';
        /**
         * The wireframe style applied on the transformer
         */
        _this._wireframeStyle = Object.assign({}, DEFAULT_WIREFRAME_STYLE, options.wireframeStyle || {});
        var HandleConstructor = options.handleConstructor || TransformerHandle;
        var handleStyle = options.handleStyle || {};
        _this._handleStyle = handleStyle;
        // Initialize transformer handles
        var rotatorHandles = {
            rotator: _this.addChild(new HandleConstructor('rotator', handleStyle, function (pointerPosition) {
                // The origin is the rotator handle's position, yes.
                _this.rotateGroup('rotator', pointerPosition);
            }, _this.commitGroup)),
        };
        var scaleHandles = SCALE_HANDLES.reduce(function (scaleHandles, handleKey) {
            var handleDelta = function (pointerPosition) {
                _this.scaleGroup(handleKey, pointerPosition);
            };
            scaleHandles[handleKey] = new HandleConstructor(handleKey, handleStyle, handleDelta, _this.commitGroup, HANDLE_TO_CURSOR[handleKey]);
            scaleHandles[handleKey].visible = _this._scaleEnabled;
            _this.addChild(scaleHandles[handleKey]);
            return scaleHandles;
        }, {});
        var skewHandles = {
            skewHorizontal: _this.addChild(new HandleConstructor('skewHorizontal', handleStyle, function (pointerPosition) { _this.skewGroup('skewHorizontal', pointerPosition); }, _this.commitGroup, 'pointer')),
            skewVertical: _this.addChild(new HandleConstructor('skewVertical', handleStyle, function (pointerPosition) { _this.skewGroup('skewVertical', pointerPosition); }, _this.commitGroup, 'pointer')),
        };
        /**
         * Object mapping handle-names to the handle display-objects.
         */
        _this.handles = Object.assign({}, rotatorHandles, scaleHandles, skewHandles);
        _this.handles.middleCenter.visible = false;
        _this.handles.skewHorizontal.visible = _this._skewEnabled;
        _this.handles.skewVertical.visible = _this._skewEnabled;
        // Update groupBounds immediately. This is because mouse events can propagate before the next animation frame.
        _this.groupBounds = new bounds.OrientedBounds();
        _this.updateGroupBounds();
        // Pointer events
        _this._pointerDown = false;
        _this._pointerDragging = false;
        _this._pointerPosition = new math.Point();
        _this.on('pointerdown', _this.onPointerDown, _this);
        _this.on('pointermove', _this.onPointerMove, _this);
        _this.on('pointerup', _this.onPointerUp, _this);
        _this.on('pointerupoutside', _this.onPointerUp, _this);
        return _this;
    }
    Object.defineProperty(Transformer.prototype, "enabledHandles", {
        /**
         * The list of enabled handles, if applied manually.
         */
        get: function () {
            return this._enabledHandles;
        },
        set: function (value) {
            var _this = this;
            if (!this._enabledHandles && !value) {
                return;
            }
            this._enabledHandles = value;
            HANDLES.forEach(function (handleKey) { _this.handles[handleKey].visible = false; });
            if (value) {
                value.forEach(function (handleKey) { _this.handles[handleKey].visible = true; });
            }
            else {
                this.handles.rotator.visible = this._rotateEnabled;
                this.handles.skewHorizontal.visible = this._skewEnabled;
                this.handles.skewVertical.visible = this._skewEnabled;
                SCALE_HANDLES.forEach(function (handleKey) {
                    if (handleKey === 'middleCenter')
                        return;
                    _this.handles[handleKey].visible = _this._scaleEnabled;
                });
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Transformer.prototype, "handleStyle", {
        /**
         * The currently applied handle style. If you have edited the transformer handles directly, this may be inaccurate.
         */
        get: function () {
            return this._handleStyle;
        },
        set: function (value) {
            var handles = this.handles;
            for (var handleKey in handles) {
                handles[handleKey].style = value;
            }
            this._handleStyle = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Transformer.prototype, "rotateEnabled", {
        /**
         * This will enable the rotate handles.
         */
        get: function () {
            return this._rotateEnabled;
        },
        set: function (value) {
            if (!this._rotateEnabled !== value) {
                this._rotateEnabled = value;
                if (this._enabledHandles) {
                    return;
                }
                this.handles.rotator.visible = value;
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Transformer.prototype, "scaleEnabled", {
        /**
         * This will enable the scale handles.
         */
        get: function () {
            return this._scaleEnabled;
        },
        set: function (value) {
            var _this = this;
            if (!this._scaleEnabled !== value) {
                this._scaleEnabled = value;
                if (this._enabledHandles) {
                    return;
                }
                SCALE_HANDLES.forEach(function (handleKey) {
                    if (handleKey === 'middleCenter') {
                        return;
                    }
                    _this.handles[handleKey].visible = value;
                });
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Transformer.prototype, "skewEnabled", {
        /**
         * This will enable the skew handles.
         */
        get: function () {
            return this._skewEnabled;
        },
        set: function (value) {
            if (this._skewEnabled !== value) {
                this._skewEnabled = value;
                if (this._enabledHandles) {
                    return;
                }
                this.handles.skewHorizontal.visible = value;
                this.handles.skewVertical.visible = value;
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Transformer.prototype, "transformType", {
        /**
         * This is the type of transformation being applied by the user on the group. It can be inaccurate if you call one of
         * `translateGroup`, `scaleGroup`, `rotateGroup`, `skewGroup` without calling `commitGroup` afterwards.
         *
         * @readonly
         */
        get: function () {
            return this._transformType;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Transformer.prototype, "wireframeStyle", {
        /**
         * The currently applied wireframe style.
         */
        get: function () {
            return this._wireframeStyle;
        },
        set: function (value) {
            this._wireframeStyle = Object.assign({}, DEFAULT_WIREFRAME_STYLE, value);
        },
        enumerable: false,
        configurable: true
    });
    /**
     * @param forceUpdate - forces a recalculation of the group bounds
     * @returns the oriented bounding box of the wireframe
     */
    Transformer.prototype.getGroupBounds = function (forceUpdate) {
        if (forceUpdate === void 0) { forceUpdate = false; }
        if (forceUpdate) {
            this.updateGroupBounds();
        }
        return this.groupBounds;
    };
    /**
     * This will update the transformer's geometry and render it to the canvas.
     *
     * @override
     * @param renderer
     */
    Transformer.prototype.render = function (renderer) {
        this.draw();
        _super.prototype.render.call(this, renderer);
    };
    /**
     * Recalculates the transformer's geometry. This is called on each render.
     */
    Transformer.prototype.draw = function () {
        var targets = this.group;
        var _a = this._wireframeStyle, color = _a.color, thickness = _a.thickness;
        // Updates occur right here!
        this.wireframe.clear()
            .lineStyle(thickness, color);
        for (var i = 0, j = targets.length; i < j; i++) {
            this.drawBounds(Transformer.calculateOrientedBounds(targets[i], tempBounds));
        }
        // groupBounds may change on each render-loop b/c of any ongoing animation
        var groupBounds = targets.length !== 1
            ? Transformer.calculateGroupOrientedBounds(targets, this.groupBounds.rotation, tempBounds, true)
            : Transformer.calculateOrientedBounds(targets[0], tempBounds); // Auto-detect rotation
        // Redraw skeleton and position handles
        this.drawBounds(groupBounds);
        this.drawHandles(groupBounds);
        // Update cached groupBounds
        this.groupBounds.copyFrom(groupBounds);
    };
    /**
     * Draws the bounding box into {@code this.wireframe}.
     *
     * @param bounds
     */
    Transformer.prototype.drawBounds = function (bounds) {
        var hull = tempHull;
        // Bring hull into local-space
        for (var i = 0; i < 4; i++) {
            this.toTransformerLocal(bounds.hull[i], hull[i]);
        }
        // Fill polygon with ultra-low alpha to capture pointer events.
        this.wireframe
            .beginFill(0xffffff, 1e-4)
            .drawPolygon(hull)
            .endFill();
    };
    /**
     * Draw the handles and any remaining parts of the wireframe.
     *
     * @param groupBounds
     */
    Transformer.prototype.drawHandles = function (groupBounds) {
        var handles = this.handles;
        var worldTopLeft = groupBounds.topLeft, worldTopRight = groupBounds.topRight, worldBottomLeft = groupBounds.bottomLeft, worldBottomRight = groupBounds.bottomRight, worldCenter = groupBounds.center;
        var topLeft = tempHull[0], topRight = tempHull[1], bottomLeft = tempHull[2], bottomRight = tempHull[3];
        var center = tempPoint;
        this.toTransformerLocal(worldTopLeft, topLeft);
        this.toTransformerLocal(worldTopRight, topRight);
        this.toTransformerLocal(worldBottomLeft, bottomLeft);
        this.toTransformerLocal(worldBottomRight, bottomRight);
        this.toTransformerLocal(worldCenter, center);
        if (this._rotateEnabled) {
            // Midpoint from topLeft to topRight
            var bx = (topLeft.x + topRight.x) / 2;
            var by = (topLeft.y + topRight.y) / 2;
            // Vector perpendicular to <bx,by>.
            var px = -(topLeft.y - topRight.y);
            var py = (topLeft.x - topRight.x);
            // Normalize <px,py> to 32 units.
            var pl = Math.sqrt((px * px) + (py * py));
            px *= 32 / pl;
            py *= 32 / pl;
            handles.rotator.position.x = bx + px;
            handles.rotator.position.y = by + py;
            this.wireframe.moveTo(bx, by)
                .lineTo(handles.rotator.position.x, handles.rotator.position.y);
        }
        if (this._scaleEnabled) {
            // Scale handles
            handles.topLeft.position.copyFrom(topLeft);
            handles.topCenter.position.set((topLeft.x + topRight.x) / 2, (topLeft.y + topRight.y) / 2);
            handles.topRight.position.copyFrom(topRight);
            handles.middleLeft.position.set((topLeft.x + bottomLeft.x) / 2, (topLeft.y + bottomLeft.y) / 2);
            handles.middleCenter.position.set((topLeft.x + bottomRight.x) / 2, (topLeft.y + bottomRight.y) / 2);
            handles.middleRight.position.set((topRight.x + bottomRight.x) / 2, (topRight.y + bottomRight.y) / 2);
            handles.bottomLeft.position.copyFrom(bottomLeft);
            handles.bottomCenter.position.set((bottomLeft.x + bottomRight.x) / 2, (bottomLeft.y + bottomRight.y) / 2);
            handles.bottomRight.position.copyFrom(bottomRight);
        }
        if (this._skewEnabled) {
            var cx = center.x;
            var cy = center.y;
            // Transform center into screen space
            this.worldTransform.apply(center, center);
            // Calculate skew handle positions in screen space, and then transform back into local-space. This ensures that
            // the handles appear at skewRadius distance, regardless of the projection.
            handles.skewHorizontal.position.set(center.x + (Math.cos(this._skewX) * this.skewRadius), center.y + (Math.sin(this._skewX) * this.skewRadius));
            handles.skewVertical.position.set(// HINT: Slope = skew.y + Math.PI / 2
            center.x + (-Math.sin(this._skewY) * this.skewRadius), center.y + (Math.cos(this._skewY) * this.skewRadius));
            this.worldTransform.applyInverse(handles.skewHorizontal.position, handles.skewHorizontal.position);
            this.worldTransform.applyInverse(handles.skewVertical.position, handles.skewVertical.position);
            // Restore center to local-space
            center.set(cx, cy);
            this.wireframe
                .beginFill(this.wireframeStyle.color)
                .drawCircle(center.x, center.y, this.wireframeStyle.thickness * 2)
                .endFill();
            this.wireframe
                .moveTo(center.x, center.y)
                .lineTo(handles.skewHorizontal.x, handles.skewHorizontal.y)
                .moveTo(center.x, center.y)
                .lineTo(handles.skewVertical.x, handles.skewVertical.y);
        }
        // Update transforms
        for (var handleName in handles) {
            var rotation = this.groupBounds.rotation;
            if (handleName === 'skewHorizontal') {
                rotation = this._skewX;
            }
            else if (handleName === 'skewVertical') {
                rotation = this._skewY;
            }
            var handle = handles[handleName];
            handle.rotation = rotation;
            handle.getBounds(false, tempRect);
        }
    };
    /**
     * Called on the `pointerdown` event. You must call the super implementation.
     *
     * @param e
     */
    Transformer.prototype.onPointerDown = function (e) {
        this._pointerDown = true;
        this._pointerDragging = false;
        e.stopPropagation();
    };
    /**
     * Called on the `pointermove` event. You must call the super implementation.
     *
     * @param e
     */
    Transformer.prototype.onPointerMove = function (e) {
        if (!this._pointerDown) {
            return;
        }
        var lastPointerPosition = this._pointerPosition;
        var currentPointerPosition = tempPoint.copyFrom(e.data.global);
        var cx = currentPointerPosition.x;
        var cy = currentPointerPosition.y;
        // Translate group by difference
        if (this._pointerDragging && this.translateEnabled) {
            var worldOrigin = tempHull[0], worldDestination = tempHull[1], worldDelta = tempHull[2];
            // HINT: The pointer has moved from lastPointerPosition to currentPointerPosition in the transformer's
            // world space. However, we want to translate the display-object's in their world space; to do this,
            // we project (0,0) and the delta into their world-space, and take the difference.
            worldOrigin.set(0, 0);
            worldDestination.set(currentPointerPosition.x - lastPointerPosition.x, currentPointerPosition.y - lastPointerPosition.y);
            this.projectionTransform.applyInverse(worldOrigin, worldOrigin);
            this.projectionTransform.applyInverse(worldDestination, worldDestination);
            worldDelta.set(worldDestination.x - worldOrigin.x, worldDestination.y - worldOrigin.y);
            this.translateGroup(worldDelta);
        }
        this._pointerPosition.x = cx;
        this._pointerPosition.y = cy;
        this._pointerDragging = true;
        e.stopPropagation();
    };
    /**
     * Called on the `pointerup` and `pointerupoutside` events. You must call the super implementation.
     *
     * @param e
     */
    Transformer.prototype.onPointerUp = function (e) {
        this._pointerDragging = false;
        this._pointerDown = false;
        e.stopPropagation();
    };
    /**
     * Applies the given transformation matrix {@code delta} to all the display-objects in the group.
     *
     * @param delta - transformation matrix
     * @param skipUpdate - whether to skip updating the group-bounds after applying the transform
     */
    Transformer.prototype.prependTransform = function (delta, skipUpdate) {
        if (skipUpdate === void 0) { skipUpdate = false; }
        var group = this.group;
        for (var i = 0, j = group.length; i < j; i++) {
            multiplyTransform(group[i], delta, false);
        }
        if (!skipUpdate) {
            this.updateGroupBounds();
        }
        this.emit('transformchange', delta);
    };
    /**
     * Recalculates {@code this.groupBounds} at the same angle.
     *
     * @param rotation - override the group's rotation
     */
    Transformer.prototype.updateGroupBounds = function (rotation) {
        if (rotation === void 0) { rotation = this.groupBounds.rotation; }
        Transformer.calculateGroupOrientedBounds(this.group, rotation, this.groupBounds);
    };
    /**
     * Snaps the given {@code angle} to one of the snapping angles, if possible.
     *
     * @param angle - the input angle
     * @param snapTolerance - the maximum difference b/w the given angle & a snapping angle
     * @param snaps - the snapping angles
     * @returns the snapped angle
     */
    Transformer.prototype.snapAngle = function (angle, snapTolerance, snaps) {
        angle = angle % (Math.PI * 2);
        if (!snaps || snaps.length === 1 || !snapTolerance) {
            return angle;
        }
        for (var i = 0, j = snaps.length; i < j; i++) {
            if (Math.abs(angle - snaps[i]) <= snapTolerance) {
                return snaps[i];
            }
        }
        return angle;
    };
    /**
     * Transforms {@code input} from the group's world space into the transformer's local space, and puts the result
     * into {@code output}.
     *
     * @param input
     * @param output
     * @returns the output
     */
    Transformer.prototype.toTransformerLocal = function (input, output) {
        this.projectionTransform.apply(input, output);
        this.worldTransform.applyInverse(output, output);
        return output;
    };
    /**
     * Calculates the positions of the four corners of the display-object. The quadrilateral formed by
     * these points will be the tightest fit around it.
     *
     * @param displayObject - The display object whose corners are to be calculated
     * @param transform - The transform applied on the display-object. By default, this is its world-transform
     * @param corners - Optional array of four points to put the result into
     * @param index - Optional index into "corners"
     * @returns an array of four points holding the positions of the corners
     */
    Transformer.calculateTransformedCorners = function (displayObject, transform, corners, index) {
        if (transform === void 0) { transform = displayObject.worldTransform; }
        if (index === void 0) { index = 0; }
        var localBounds = displayObject.getLocalBounds();
        // Don't modify transforms
        displayObject.getBounds();
        corners = corners || [new math.Point(), new math.Point(), new math.Point(), new math.Point()];
        corners[index].set(localBounds.x, localBounds.y);
        corners[index + 1].set(localBounds.x + localBounds.width, localBounds.y);
        corners[index + 2].set(localBounds.x + localBounds.width, localBounds.y + localBounds.height);
        corners[index + 3].set(localBounds.x, localBounds.y + localBounds.height);
        transform.apply(corners[index], corners[index]);
        transform.apply(corners[index + 1], corners[index + 1]);
        transform.apply(corners[index + 2], corners[index + 2]);
        transform.apply(corners[index + 3], corners[index + 3]);
        return corners;
    };
    /**
     * Calculates the oriented bounding box of the display-object. This would not bending with any skew
     * applied on the display-object, i.e. it is guaranteed to be rectangular.
     *
     * @param displayObject
     * @param bounds - the bounds instance to set
     */
    Transformer.calculateOrientedBounds = function (displayObject, bounds$1) {
        var parent = !displayObject.parent ? displayObject.enableTempParent() : displayObject.parent;
        displayObject.updateTransform();
        displayObject.disableTempParent(parent);
        // Decompose displayObject.worldTransform to get its (world) rotation
        decomposeTransform(tempTransform, displayObject.worldTransform);
        tempTransform.updateLocalTransform();
        var angle = tempTransform.rotation;
        var corners = Transformer.calculateTransformedCorners(displayObject, displayObject.worldTransform, tempCorners);
        // Calculate centroid, which is our center of rotation
        var cx = (corners[0].x + corners[1].x + corners[2].x + corners[3].x) / 4;
        var cy = (corners[0].y + corners[1].y + corners[2].y + corners[3].y) / 4;
        // Unrotation matrix
        var matrix = tempMatrix$2
            .identity()
            .translate(-cx, -cy)
            .rotate(-tempTransform.rotation)
            .translate(cx, cy);
        // Calculate unrotated corners
        matrix.apply(corners[0], corners[0]);
        matrix.apply(corners[1], corners[1]);
        matrix.apply(corners[2], corners[2]);
        matrix.apply(corners[3], corners[3]);
        bounds$1 = bounds$1 || new bounds.OrientedBounds();
        bounds$1.rotation = angle;
        bounds$1.innerBounds.x = Math.min(corners[0].x, corners[1].x, corners[2].x, corners[3].x);
        bounds$1.innerBounds.y = Math.min(corners[0].y, corners[1].y, corners[2].y, corners[3].y);
        bounds$1.innerBounds.width = Math.max(corners[0].x, corners[1].x, corners[2].x, corners[3].x) - bounds$1.innerBounds.x;
        bounds$1.innerBounds.height = Math.max(corners[0].y, corners[1].y, corners[2].y, corners[3].y) - bounds$1.innerBounds.y;
        return bounds$1;
    };
    /**
     * Calculates the oriented bounding box of a group of display-objects at a specific angle.
     *
     * @param group
     * @param rotation
     * @param bounds
     * @param skipUpdate
     */
    Transformer.calculateGroupOrientedBounds = function (group, rotation, bounds$1, skipUpdate) {
        if (skipUpdate === void 0) { skipUpdate = false; }
        var groupLength = group.length;
        var frames = pointPool.allocateArray(groupLength * 4); // Zero allocations!
        // Calculate display-object frame vertices
        for (var i = 0; i < groupLength; i++) {
            var displayObject = group[i];
            // Update worldTransform
            if (!skipUpdate) {
                var parent = !displayObject.parent ? displayObject.enableTempParent() : displayObject.parent;
                displayObject.updateTransform();
                displayObject.disableTempParent(parent);
            }
            Transformer.calculateTransformedCorners(displayObject, displayObject.worldTransform, frames, i * 4);
        }
        // Unrotation matrix
        var matrix = tempMatrix$2
            .identity()
            .rotate(-rotation);
        var minX = Number.MAX_VALUE;
        var minY = Number.MAX_VALUE;
        var maxX = -Number.MAX_VALUE;
        var maxY = -Number.MAX_VALUE;
        // Unrotate all frame vertices, calculate minX, minY, maxX, maxY for innerBounds
        for (var i = 0, j = frames.length; i < j; i++) {
            var point = frames[i];
            matrix.apply(point, point);
            var x = point.x;
            var y = point.y;
            minX = x < minX ? x : minX;
            minY = y < minY ? y : minY;
            maxX = x > maxX ? x : maxX;
            maxY = y > maxY ? y : maxY;
        }
        pointPool.releaseArray(frames);
        bounds$1 = bounds$1 || new bounds.OrientedBounds();
        bounds$1.innerBounds.x = minX;
        bounds$1.innerBounds.y = minY;
        bounds$1.innerBounds.width = maxX - minX;
        bounds$1.innerBounds.height = maxY - minY;
        bounds$1.rotation = rotation;
        matrix.applyInverse(bounds$1.center, tempPoint);
        bounds$1.center.copyFrom(tempPoint);
        return bounds$1;
    };
    return Transformer;
}(display.Container));
/**
 * This is fired when the transformer modifies the transforms of display-objects.
 *
 * @event Transformer#transformchange
 * @type {Matrix}
 */
/**
 * This is fired when the user lifts the mouse button after dragging a transformer handle. It can be used
 *
 * @event Transformer#transformcommit
 */

exports.Transformer = Transformer;
exports.TransformerHandle = TransformerHandle;
//# sourceMappingURL=transformer.js.map
