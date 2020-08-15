/* eslint-disable */
 
/*!
 * @pixi-essentials/transformer - v1.0.0
 * Compiled Sat, 15 Aug 2020 19:41:52 UTC
 *
 * @pixi-essentials/transformer is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 * 
 * Copyright 2019-2020, Shukant K. Pal, All Rights Reserved
 */
import '@pixi/interaction';
import { Container } from '@pixi/display';
import { Point, Matrix, Transform, Rectangle } from '@pixi/math';
import { Graphics } from '@pixi/graphics';
import { OrientedBounds } from '@pixi-essentials/bounds';
import { ObjectPoolFactory } from '@pixi-essentials/object-pool';

/// <reference path="./types.d.ts" />
const tempPoint = new Point();
const tempDelta = new Point();
/**
 * The default transfomer handle implementation.
 */
class TransformerHandle extends Graphics {
    constructor(styleOpts = {}, handler, cursor) {
        super();
        const style = Object.assign({
            color: 0xffffff,
            outlineColor: 0x000000,
            outlineThickness: 1,
            radius: 8,
            shape: 'square',
        }, styleOpts);
        this.style = style;
        this.cursor = cursor || 'move';
        this.onHandleDelta = handler;
        this.lineStyle(style.outlineThickness, style.outlineColor)
            .beginFill(style.color);
        if (style.shape === 'square') {
            this.drawRect(-style.radius / 2, -style.radius / 2, style.radius, style.radius);
        }
        else {
            this.drawCircle(0, 0, style.radius);
        }
        this.endFill();
        this._pointerDown = false;
        this._pointerDragging = false;
        this._pointerPosition = new Point();
        this.interactive = true;
        this.on('mousedown', () => { console.log('MD'); });
        this.on('mousedown', this.onPointerDown, this);
        this.on('mousemove', this.onPointerMove, this);
        this.on('mouseup', this.onPointerUp, this);
        this.on('mouseupoutside', this.onPointerUp, this);
    }
    onPointerDown() {
        this._pointerDown = true;
        this._pointerDragging = false;
    }
    onPointerMove(e) {
        if (!this._pointerDown) {
            return;
        }
        if (this._pointerDragging) {
            this.onDrag(e);
        }
        else {
            this.onDragStart(e);
        }
    }
    onPointerUp(e) {
        if (this._pointerDragging) {
            this.onDragEnd(e);
        }
        this._pointerDown = false;
    }
    onDragStart(e) {
        e.data.getLocalPosition(this.parent, this._pointerPosition);
        this._pointerDragging = true;
    }
    onDrag(e) {
        const lastPosition = this._pointerPosition;
        const currentPosition = e.data.getLocalPosition(this.parent, tempPoint);
        // Callback handles the rest!
        if (this.onHandleDelta) {
            tempDelta.x = currentPosition.x - lastPosition.x;
            tempDelta.y = currentPosition.y - lastPosition.y;
            this.onHandleDelta(lastPosition, tempDelta);
        }
        this._pointerPosition.copyFrom(tempPoint);
    }
    onDragEnd(_) {
        this._pointerDragging = false;
    }
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
function decomposeTransform(transform, matrix, rotation, pivot = transform.pivot) {
    const a = matrix.a;
    const b = matrix.b;
    const c = matrix.c;
    const d = matrix.d;
    const skewX = -Math.atan2(-c, d);
    const skewY = Math.atan2(b, a);
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
const tempMatrix = new Matrix();
const tempParentMatrix = new Matrix();
/**
 * Multiplies the transformation matrix {@code transform} to the display-object's transform.
 *
 * @param displayObject
 * @param transform
 * @param skipUpdate
 */
function multiplyTransform(displayObject, transform, skipUpdate) {
    if (!skipUpdate) {
        const parent = !displayObject.parent ? displayObject.enableTempParent() : displayObject.parent;
        displayObject.updateTransform();
        displayObject.disableTempParent(parent);
    }
    const worldTransform = displayObject.worldTransform;
    const parentTransform = displayObject.parent
        ? tempParentMatrix.copyFrom(displayObject.parent.worldTransform)
        : Matrix.IDENTITY;
    tempMatrix.copyFrom(worldTransform);
    tempMatrix.prepend(transform);
    tempMatrix.prepend(parentTransform.invert()); // gets new "local" transform
    decomposeTransform(displayObject.transform, tempMatrix);
}

/// <reference path="./types.d.ts" />
// Preallocated objects
const tempTransform = new Transform();
const tempCorners = [new Point(), new Point(), new Point(), new Point()];
const tempMatrix$1 = new Matrix();
const tempPoint$1 = new Point();
const tempBounds = new OrientedBounds();
const tempRect = new Rectangle();
// Pool for allocating an arbitrary number of points
const pointPool = ObjectPoolFactory.build(Point);
/**
 * Specific cursors for each handle
 *
 * @internal
 * @ignore
 */
const HANDLE_TO_CURSOR = {
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
const SCALE_HANDLES = [
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
const SCALE_COMPONENTS = {
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
 * {@code Transformer} provides an interactive interface for editing the transforms in a group. It supports translating,
 * scaling, rotating, and skewing display-objects both through interaction and code.
 */
class Transformer extends Container {
    /**
     * @param {object}[options]
     * @param {DisplayObject[]}[options.group] - the group of display-objects being transformed
     * @param {typeof TransformerHandle}[options.handleConstructor] - a custom transformer-handle class
     * @param {object}[options.handleStyle] - styling options for the handle. These cannot be modified afterwards!
     * @param {number}[options.handleStyle.color] - handle color
     * @param {string}[options.handleStyle.outlineColor] - color of the handle outline (stroke)
     * @param {string}[options.handleStyle.outlineThickness] - thickness of the handle outline (stroke)
     * @param {number}[options.handleStyle.radius] - dimensions of the handle
     * @param {string}[options.handleStyle.shape] - 'circle' or 'square'
     * @param {object}[options.wireframeStyle] - styling options for the wireframe.
     * @param {number}[options.wireframeStyle.color] - color of the lines
     * @param {number}[options.wireframeStyle.thickness] - thickness of the lines
     */
    constructor(options = {}) {
        super();
        /**
         * This will rotate the group such that the {@code origin} point will move by {@code delta}.
         *
         * @param handle - the rotator handle was dragged
         * @param origin - the original pointer position (before dragging)
         * @param delta - the difference in pointer position (after dragging)
         */
        this.rotateGroup = (_, origin, delta) => {
            const bounds = this.groupBounds;
            const destination = tempPoint$1.set(origin.x + delta.x, origin.y + delta.y);
            // Center of rotation - does not change in transformation
            const rOrigin = bounds.center;
            // Original angle subtended by pointer
            const orgAngle = Math.atan2(origin.y - rOrigin.y, origin.x - rOrigin.x);
            // Final angle subtended by pointer
            const dstAngle = Math.atan2(destination.y - rOrigin.y, destination.x - rOrigin.x);
            // The angle by which bounds should be rotated
            const deltaAngle = dstAngle - orgAngle;
            // Rotation matrix
            const matrix = tempMatrix$1
                .identity()
                .translate(-rOrigin.x, -rOrigin.y)
                .rotate(deltaAngle)
                .translate(rOrigin.x, rOrigin.y);
            this.prependTransform(matrix, true);
            this.updateGroupBounds(bounds.rotation + deltaAngle);
        };
        /**
         * This will scale the group such that the handle will move by {@code delta}.
         *
         * @param handle - the scaling handle that was dragged
         * @param delta - the change in pointer position since the last event
         */
        this.scaleGroup = (handle, delta) => {
            // Directions along x,y axes that will produce positive scaling
            const xDir = SCALE_COMPONENTS[handle].x;
            const yDir = SCALE_COMPONENTS[handle].y;
            const bounds = this.groupBounds;
            const angle = bounds.rotation;
            const innerBounds = bounds.innerBounds;
            // Delta vector in world frame
            const dx = delta.x;
            const dy = delta.y;
            // Unit vector along u-axis (horizontal axis after rotation) of bounds
            const uxvec = (bounds.topRight.x - bounds.topLeft.x) / innerBounds.width;
            const uyvec = (bounds.topRight.y - bounds.topLeft.y) / innerBounds.width;
            // Unit vector along v-axis (vertical axis after rotation) of bounds
            const vxvec = (bounds.bottomLeft.x - bounds.topLeft.x) / innerBounds.height;
            const vyvec = (bounds.bottomLeft.y - bounds.topLeft.y) / innerBounds.height;
            // Delta vector in rotated frame of bounds
            const du = (dx * uxvec) + (dy * uyvec);
            const dv = (dx * vxvec) + (dy * vyvec);
            // Scaling factors along x,y axes
            const sx = 1 + (du * xDir / innerBounds.width);
            const sy = 1 + (dv * yDir / innerBounds.height);
            const matrix = tempMatrix$1.identity();
            if (xDir !== 0) {
                // Origin of horizontal scaling - a point which does not move after applying the transform
                const hsOrigin = xDir === 1 ? bounds.topLeft : bounds.topRight;
                matrix.translate(-hsOrigin.x, -hsOrigin.y)
                    .rotate(-angle)
                    .scale(sx, 1)
                    .rotate(angle)
                    .translate(hsOrigin.x, hsOrigin.y);
            }
            if (yDir !== 0) {
                // Origin of vertical scaling - a point which does not move after applying the transform
                const vsOrigin = yDir === 1 ? bounds.topLeft : bounds.bottomLeft;
                matrix.translate(-vsOrigin.x, -vsOrigin.y)
                    .rotate(-angle)
                    .scale(1, sy)
                    .rotate(angle)
                    .translate(vsOrigin.x, vsOrigin.y);
            }
            this.prependTransform(matrix);
        };
        this.group = options.group || [];
        this.interactive = true;
        this.cursor = 'move';
        /**
         * Draws the bounding boxes
         */
        this.wireframe = this.addChild(new Graphics());
        /**
         * The wireframe style applied on the transformer
         */
        this.wireframeStyle = Object.assign({
            color: 0x000000,
            thickness: 2,
        }, options.wireframeStyle || {});
        const HandleConstructor = options.handleConstructor || TransformerHandle;
        const handleStyle = options.handleStyle || {};
        this.handleStyle = handleStyle;
        // Initialize transformer handles
        const rotatorHandles = {
            rotator: this.addChild(new HandleConstructor(handleStyle, (origin, delta) => { this.rotateGroup('rotator', origin, delta); })),
        };
        const scaleHandles = SCALE_HANDLES.reduce((scaleHandles, handleKey) => {
            const handleDelta = (_, delta) => {
                this.scaleGroup(handleKey, delta);
            };
            scaleHandles[handleKey] = new HandleConstructor(handleStyle, handleDelta, HANDLE_TO_CURSOR[handleKey]);
            this.addChild(scaleHandles[handleKey]);
            return scaleHandles;
        }, {});
        this.handles = Object.assign({}, rotatorHandles, scaleHandles);
        this.handles.middleCenter.visible = false;
        // Update groupBounds immediately. This is because mouse events can propagate before the next animation frame.
        this.groupBounds = new OrientedBounds();
        this.updateGroupBounds();
    }
    /**
     * This will update the transformer's geometry and render it to the canvas.
     *
     * @override
     * @param renderer
     */
    render(renderer) {
        const targets = this.group;
        const { color, thickness } = this.wireframeStyle;
        // Updates occur right here!
        this.wireframe.clear()
            .lineStyle(thickness, color);
        for (let i = 0, j = targets.length; i < j; i++) {
            this.drawBounds(Transformer.calculateOrientedBounds(targets[i], tempBounds));
        }
        // groupBounds may change on each render-loop b/c of any ongoing animation
        const groupBounds = Transformer.calculateGroupOrientedBounds(targets, this.groupBounds.rotation, tempBounds, true);
        // Redraw skeleton and position handles
        this.drawBounds(groupBounds);
        this.drawHandles(groupBounds);
        // Update cached groupBounds
        this.groupBounds.copyFrom(groupBounds);
        super.render(renderer);
    }
    /**
     * Draws the bounding box into {@code this.skeleton}.
     *
     * @param bounds
     */
    drawBounds(bounds) {
        this.wireframe
            .drawPolygon(bounds.hull);
    }
    /**
     * Draw the handles and any remaining parts of the skeleton
     *
     * @param groupBounds
     */
    drawHandles(groupBounds) {
        const handles = this.handles;
        const { topLeft, topRight, bottomLeft, bottomRight } = groupBounds;
        handles.topLeft.position.copyFrom(topLeft);
        handles.topCenter.position.set((topLeft.x + topRight.x) / 2, (topLeft.y + topRight.y) / 2);
        handles.topRight.position.copyFrom(topRight);
        handles.middleLeft.position.set((topLeft.x + bottomLeft.x) / 2, (topLeft.y + bottomLeft.y) / 2);
        handles.middleCenter.position.set((topLeft.x + bottomRight.x) / 2, (topLeft.y + bottomRight.y) / 2);
        handles.middleRight.position.set((topRight.x + bottomRight.x) / 2, (topRight.y + bottomRight.y) / 2);
        handles.bottomLeft.position.copyFrom(bottomLeft);
        handles.bottomCenter.position.set((bottomLeft.x + bottomRight.x) / 2, (bottomLeft.y + bottomRight.y) / 2);
        handles.bottomRight.position.copyFrom(bottomRight);
        groupBounds.innerBounds.pad(32);
        handles.rotator.position.x = (groupBounds.topLeft.x + groupBounds.topRight.x) / 2;
        handles.rotator.position.y = (groupBounds.topLeft.y + groupBounds.topRight.y) / 2;
        groupBounds.innerBounds.pad(-32);
        const bx = (groupBounds.topLeft.x + groupBounds.topRight.x) / 2;
        const by = (groupBounds.topLeft.y + groupBounds.topRight.y) / 2;
        this.wireframe.moveTo(bx, by)
            .lineTo(handles.rotator.position.x, handles.rotator.position.y);
        // Update transforms
        for (const handleName in handles) {
            const handle = handles[handleName];
            handle.rotation = groupBounds.rotation;
            handle.getBounds(false, tempRect);
        }
    }
    /**
     * Applies the given transformation matrix {@code delta} to all the display-objects in the group.
     *
     * @param delta - transformation matrix
     * @param skipUpdate - whether to skip updating the group-bounds after applying the transform
     */
    prependTransform(delta, skipUpdate = false) {
        const group = this.group;
        for (let i = 0, j = group.length; i < j; i++) {
            multiplyTransform(group[i], delta, false);
        }
        if (!skipUpdate) {
            this.updateGroupBounds();
        }
    }
    /**
     * Recalculates {@code this.groupBounds} at the same angle.
     *
     * @param rotation - override the group's rotation
     */
    updateGroupBounds(rotation = this.groupBounds.rotation) {
        Transformer.calculateGroupOrientedBounds(this.group, rotation, this.groupBounds);
    }
    /**
     * Calculates the positions of the four corners of the display-object. The quadrilateral formed by
     * these points will be the tightest fit around it.
     *
     * @param displayObject - The display object whose corners are to be calculated
     * @param transform - The transform applied on the display-object. By default, this is its world-transform
     * @param corners - Optional array of four points to put the result into
     * @param index - Optional index into "corners"
     */
    static calculateTransformedCorners(displayObject, transform = displayObject.worldTransform, corners, index = 0) {
        const localBounds = displayObject.getLocalBounds();
        // Don't modify transforms
        displayObject.getBounds();
        corners = corners || [new Point(), new Point(), new Point(), new Point()];
        corners[index].set(localBounds.x, localBounds.y);
        corners[index + 1].set(localBounds.x + localBounds.width, localBounds.y);
        corners[index + 2].set(localBounds.x + localBounds.width, localBounds.y + localBounds.height);
        corners[index + 3].set(localBounds.x, localBounds.y + localBounds.height);
        transform.apply(corners[index], corners[index]);
        transform.apply(corners[index + 1], corners[index + 1]);
        transform.apply(corners[index + 2], corners[index + 2]);
        transform.apply(corners[index + 3], corners[index + 3]);
        return corners;
    }
    /**
     * Calculates the oriented bounding box of the display-object. This would not bending with any skew
     * applied on the display-object, i.e. it is guaranteed to be rectangular.
     *
     * @param displayObject
     * @param bounds - the bounds instance to set
     */
    static calculateOrientedBounds(displayObject, bounds) {
        const parent = !displayObject.parent ? displayObject.enableTempParent() : displayObject.parent;
        displayObject.updateTransform();
        displayObject.disableTempParent(parent);
        // Decompose displayObject.worldTransform to get its (world) rotation
        decomposeTransform(tempTransform, displayObject.worldTransform);
        tempTransform.updateLocalTransform();
        const angle = tempTransform.rotation;
        const corners = Transformer.calculateTransformedCorners(displayObject, displayObject.worldTransform, tempCorners);
        // Calculate centroid, which is our center of rotatation
        const cx = (corners[0].x + corners[1].x + corners[2].x + corners[3].x) / 4;
        const cy = (corners[0].y + corners[1].y + corners[2].y + corners[3].y) / 4;
        // Unrotation matrix
        const matrix = tempMatrix$1
            .identity()
            .translate(-cx, -cy)
            .rotate(-tempTransform.rotation)
            .translate(cx, cy);
        // Calculate unrotated corners
        matrix.apply(corners[0], corners[0]);
        matrix.apply(corners[1], corners[1]);
        matrix.apply(corners[2], corners[2]);
        matrix.apply(corners[3], corners[3]);
        bounds = bounds || new OrientedBounds();
        bounds.rotation = angle;
        bounds.innerBounds.x = Math.min(corners[0].x, corners[1].x, corners[2].x, corners[3].x);
        bounds.innerBounds.y = Math.min(corners[0].y, corners[1].y, corners[2].y, corners[3].y);
        bounds.innerBounds.width = Math.max(corners[0].x, corners[1].x, corners[2].x, corners[3].x) - bounds.innerBounds.x;
        bounds.innerBounds.height = Math.max(corners[0].y, corners[1].y, corners[2].y, corners[3].y) - bounds.innerBounds.y;
        return bounds;
    }
    /**
     * Calculates the oriented bounding box of a group of display-objects at a specific angle.
     *
     * @param group
     * @param rotation
     * @param bounds
     * @param skipUpdate
     */
    static calculateGroupOrientedBounds(group, rotation, bounds, skipUpdate = false) {
        const groupLength = group.length;
        const frames = pointPool.allocateArray(groupLength * 4); // Zero allocations!
        // Calculate display-object frame vertices
        for (let i = 0; i < groupLength; i++) {
            const displayObject = group[i];
            // Update worldTransform
            if (!skipUpdate) {
                const parent = !displayObject.parent ? displayObject.enableTempParent() : displayObject.parent;
                displayObject.updateTransform();
                displayObject.disableTempParent(parent);
            }
            Transformer.calculateTransformedCorners(displayObject, displayObject.worldTransform, frames, i * 4);
        }
        // Unrotation matrix
        const matrix = tempMatrix$1
            .identity()
            .rotate(-rotation);
        let minX = Number.MAX_VALUE;
        let minY = Number.MAX_VALUE;
        let maxX = -Number.MAX_VALUE;
        let maxY = -Number.MAX_VALUE;
        // Unrotate all frame vertices, calculate minX, minY, maxX, maxY for innerBounds
        for (let i = 0, j = frames.length; i < j; i++) {
            const point = frames[i];
            matrix.apply(point, point);
            const x = point.x;
            const y = point.y;
            minX = x < minX ? x : minX;
            minY = y < minY ? y : minY;
            maxX = x > maxX ? x : maxX;
            maxY = y > maxY ? y : maxY;
        }
        pointPool.releaseArray(frames);
        bounds = bounds || new OrientedBounds();
        bounds.innerBounds.x = minX;
        bounds.innerBounds.y = minY;
        bounds.innerBounds.width = maxX - minX;
        bounds.innerBounds.height = maxY - minY;
        bounds.rotation = rotation;
        matrix.applyInverse(bounds.center, tempPoint$1);
        bounds.center.copyFrom(tempPoint$1);
        return bounds;
    }
}

export { Transformer, TransformerHandle };
//# sourceMappingURL=transformer.es.js.map
