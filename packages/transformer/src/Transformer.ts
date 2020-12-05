/// <reference path="./types.d.ts" />

import { Renderer } from '@pixi/core';
import { DisplayObject, Container } from '@pixi/display';
import { Point, Matrix, Transform, Rectangle } from '@pixi/math';
import { Graphics } from '@pixi/graphics';
import { AxisAlignedBounds, OrientedBounds } from '@pixi-essentials/bounds';
import { ObjectPoolFactory } from '@pixi-essentials/object-pool';
import { TransformerHandle } from './TransformerHandle';
import { TransformerWireframe } from './TransformerWireframe';
import { createHorizontalSkew, createVerticalSkew } from './utils/skewTransform';
import { distanceToLine } from './utils/distanceToLine';
import { decomposeTransform } from './utils/decomposeTransform';
import { multiplyTransform } from './utils/multiplyTransform';

import type { InteractionEvent } from '@pixi/interaction';
import type { ITransformerHandleStyle } from './TransformerHandle';

// Preallocated objects
const tempTransform = new Transform();
const tempCorners: [Point, Point, Point, Point] = [new Point(), new Point(), new Point(), new Point()];
const tempMatrix = new Matrix();
const tempPoint = new Point();
const tempBounds = new OrientedBounds();
const tempRect = new Rectangle();
const tempHull = [new Point(), new Point(), new Point(), new Point()];
const tempPointer = new Point();
const emitMatrix = new Matrix();// Used to pass to event handlers

// Pool for allocating an arbitrary number of points
const pointPool = ObjectPoolFactory.build(Point as any);

/**
 * The handles used for rotation.
 *
 * @internal
 * @ignore
 */
type RotateHandle = 'rotator'
    | 'boxRotateTopLeft'
    | 'boxRotateTopRight'
    | 'boxRotateBottomLeft'
    | 'boxRotateBottomRight';

/**
 * The handles used for scaling.
 *
 * @internal
 * @ignore
 */
type ScaleHandle = 'topLeft' |
    'topCenter' |
    'topRight' |
    'middleLeft' |
    'middleCenter' |
    'middleRight' |
    'bottomLeft' |
    'bottomCenter' |
    'bottomRight';

/**
 * The handles used for skewing
 *
 * @internal
 * @ignore
 */
type SkewHandle = 'skewHorizontal' | 'skewVertical';

/**
 * All the handles provided by {@link Transformer}.
 *
 * @internal
 * @ignore
 */
export type Handle = RotateHandle | ScaleHandle | SkewHandle;

/**
 * Specific cursors for each handle
 *
 * @internal
 * @ignore
 */
export const HANDLE_TO_CURSOR: { [H in Handle]?: string } = {
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
const SCALE_HANDLES: ScaleHandle[] = [
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
const SCALE_COMPONENTS: {
    [H in ScaleHandle]: { x: (-1 | 0 | 1); y: (-1 | 0 | 1) };
 } = {
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
const HANDLES = [
    ...SCALE_HANDLES,
    'rotator',
    'skewHorizontal',
    'skewVertical',
];

/**
 * The default tolerance for scaling by dragging the bounding-box edges.
 *
 * @ignore
 */
const DEFAULT_BOX_SCALING_TOLERANCE = 4;

/**
 * The default tolerance for box-rotation handles.
 *
 * @ignore
 */
const DEFUALT_BOX_ROTATION_TOLERANCE = 16;

/**
 * The default snap angles for rotation, in radians.
 *
 * @ignore
 */
const DEFAULT_ROTATION_SNAPS = [
    Math.PI / 4,
    Math.PI / 2,
    Math.PI * 3 / 4,
    Math.PI,
    0,
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
const DEFAULT_ROTATION_SNAP_TOLERANCE = Math.PI / 90;

/**
 * The default snap angles for skewing, in radians.
 *
 * @ignore
 */
const DEFAULT_SKEW_SNAPS = [
    Math.PI / 4,
    -Math.PI / 4,
];

/**
 * The default snap tolerance for skewing.
 *
 * @ignore
 */
const DEFAULT_SKEW_SNAP_TOLERANCE = Math.PI / 90;

/**
 * @ignore
 */
export interface ITransformerStyle
{
    color: number;
    thickness: number;
}

/**
 * The default wireframe style for {@link Transformer}.
 *
 * @ignore
 */
const DEFAULT_WIREFRAME_STYLE: ITransformerStyle = {
    color: 0x000000,
    thickness: 2,
};

/**
 * @ignore
 */
export interface ITransformerOptions
{
    boxRotationEnabled?: boolean;
    boxRotationTolerance?: number;
    boxScalingEnabled?: boolean;
    boxScalingTolerance: number;
    centeredScaling: boolean;
    enabledHandles?: Array<Handle>;
    group: DisplayObject[];
    handleConstructor: typeof TransformerHandle;
    handleStyle: Partial<ITransformerHandleStyle>;
    rotateEnabled?: boolean;
    rotationSnaps?: number[];
    rotationSnapTolerance?: number;
    scaleEnabled?: boolean;
    skewEnabled?: boolean;
    skewRadius?: number;
    skewSnaps?: number[];
    skewSnapTolerance?: number;
    translateEnabled?: boolean;
    transientGroupTilt?: boolean;
    wireframeStyle: Partial<ITransformerStyle>;
}

/**
 * {@code Transformer} provides an interactive interface for editing the transforms in a group. It supports translating,
 * scaling, rotating, and skewing display-objects both through interaction and code.
 *
 * A transformer operates in world-space, and it is best to not position, scale, rotate, or skew one. If you do so, the
 * wireframe itself will not distort (i.e. will adapt _against_ your transforms). However, the wireframe may become
 * thinner/thicker and the handles will scale & rotate. For example, setting `transformer.scale.set(2)` will make the handles
 * twice as big, but will not scale the wireframe (assuming the display-object group itself has not been
 * scaled up).
 *
 * To enable scaling via dragging the edges of the wireframe, set `boxScalingEnabled` to `true`.
 *
 * NOTE: The transformer needs to capture all interaction events that would otherwise go to the display-objects in the
 * group. Hence, it must be placed after them in the scene graph.
 */
export class Transformer extends Container
{
    public group: DisplayObject[];

    public boxRotationEnabled: boolean;
    public boxRotationTolerance: number;
    public boxScalingEnabled: boolean;
    public boxScalingTolerance: number;
    public centeredScaling: boolean;
    public projectionTransform: Matrix;
    public rotationSnaps: number[];
    public rotationSnapTolerance: number;
    public skewRadius: number;
    public skewSnaps: number[];
    public skewSnapTolerance: number;
    public translateEnabled: boolean;
    public transientGroupTilt: boolean;

    protected groupBounds: OrientedBounds;

    /**
     * Object mapping handle-names to the handle display-objects.
     */
    protected handles: { [H in Handle]?: TransformerHandle };

    /**
     * Positions of the various handles
     *
     * @internal
     * @ignore
     */
    public handleAnchors: { [H in Handle]: Point };
    protected wireframe: TransformerWireframe;

    protected _enabledHandles: Handle[];
    protected _rotateEnabled: boolean;
    protected _scaleEnabled: boolean;
    protected _skewEnabled: boolean;
    protected _skewX: number;
    protected _skewY: number;
    protected _transformHandle: Handle;
    protected _transformType: 'translate' | 'scale' | 'rotate' | 'skew' | 'none';
    protected _handleStyle: Partial<ITransformerHandleStyle>;
    protected _wireframeStyle: Partial<ITransformerStyle>;

    private _pointerDown: boolean;
    private _pointerDragging: boolean;
    private _pointerPosition: Point;

    /* eslint-disable max-len */
    /**
     * | Handle                | Type                     | Notes |
     * | --------------------- | ------------------------ | ----- |
     * | rotator               | Rotate                   | |
     * | boxRotateTopLeft      | Rotate                   | Invisible |
     * | boxRotateTopRight     | Rotate                   | Invisible |
     * | boxRotateBottomLeft   | Rotate                   | Invisible |
     * | boxRotateBottomRight  | Rotate                   | Invisible |
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
     * @param {TransformerHandleClass}[options.handleConstructor] - a custom transformer-handle class
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
    constructor(options: Partial<ITransformerOptions> = {})
    {
    /* eslint-enable max-len */
        super();

        this.interactive = true;
        this.cursor = 'move';

        /**
         * The group of display-objects under transformation.
         */
        this.group = options.group || [];

        /**
         * The thickness of the box rotation area
         */
        this.boxRotationTolerance = options.boxRotationTolerance || DEFUALT_BOX_ROTATION_TOLERANCE;

        /**
         * The padding around the bounding-box to capture dragging on the edges.
         */
        this.boxScalingTolerance = options.boxScalingTolerance || DEFAULT_BOX_SCALING_TOLERANCE;

        /**
         * This will prevent the wireframe's center from shifting on scaling.
         */
        this.centeredScaling = !!options.centeredScaling;

        /**
         * This is used when the display-object group are rendered through a projection transformation (i.e. are disconnected
         * from the transformer in the scene graph). The transformer project itself into their frame-of-reference using this
         * transform.
         *
         * Specifically, the projection-transform converts points from the group's world space to the transformer's world
         * space. If you are not applying a projection on the transformer itself, this means it is the group's
         * world-to-screen transformation.
         */
        this.projectionTransform = new Matrix();

        /**
         * The angles at which rotation should snap.
         */
        this.rotationSnaps = options.rotationSnaps || DEFAULT_ROTATION_SNAPS;

        /**
         * The maximum angular difference for snapping rotation.
         */
        this.rotationSnapTolerance = options.rotationSnapTolerance !== undefined
            ? options.rotationSnapTolerance
            : DEFAULT_ROTATION_SNAP_TOLERANCE;

        /**
         * The distance of skewing handles from the group's center.
         */
        this.skewRadius = options.skewRadius || 64;

        /**
         * The angles at which both the horizontal & vertical skew handles should snap.
         */
        this.skewSnaps = options.skewSnaps || DEFAULT_SKEW_SNAPS;

        /**
         * The maximum angular difference for snapping skew handles.
         */
        this.skewSnapTolerance = options.skewSnapTolerance !== undefined
            ? options.skewSnapTolerance
            : DEFAULT_SKEW_SNAP_TOLERANCE;

        this.boxRotationEnabled = options.boxRotationEnabled === true;
        this.boxScalingEnabled = options.boxScalingEnabled === true;
        this._rotateEnabled = options.rotateEnabled !== false;
        this._scaleEnabled = options.scaleEnabled !== false;
        this._skewEnabled = options.skewEnabled === true;

        /**
         * This will enable translation on dragging the transformer. By default, it is turned on.
         *
         * @default true
         */
        this.translateEnabled = options.translateEnabled !== false;

        /**
         * This will reset the rotation angle after the user finishes rotating a group with more than one display-object.
         *
         * @default true
         */
        this.transientGroupTilt = options.transientGroupTilt !== undefined ? options.transientGroupTilt : true;

        /**
         * Draws the bounding boxes
         */
        this.wireframe = this.addChild(new TransformerWireframe(this));
        this.wireframe.cursor = 'none';

        /**
         * The horizontal skew value. Rotating the group by 𝜽 will also change this value by 𝜽.
         */
        this._skewX = 0;

        /**
         * The vertical skew value. Rotating the group by 𝜽 will also change this value by 𝜽.
         */
        this._skewY = 0;

        /**
         * The current type of transform being applied by the user.
         */
        this._transformType = 'none';

        /**
         * The wireframe style applied on the transformer
         */
        this._wireframeStyle = Object.assign({}, DEFAULT_WIREFRAME_STYLE, options.wireframeStyle || {});

        const HandleConstructor = options.handleConstructor || TransformerHandle;
        const handleStyle = options.handleStyle || {};

        this._handleStyle = handleStyle;

        // Initialize transformer handles
        const rotatorHandles = {
            rotator: this.addChild(
                new HandleConstructor(
                    'rotator',
                    handleStyle,
                    (pointerPosition) =>
                    {
                        // The origin is the rotator handle's position, yes.
                        this.rotateGroup('rotator', pointerPosition);
                    },
                    this.commitGroup,
                ),
            ),
        };
        const scaleHandles = SCALE_HANDLES.reduce((scaleHandles, handleKey: ScaleHandle) =>
        {
            const handle = new HandleConstructor(
                handleKey,
                handleStyle,
                null,
                this.commitGroup,
                HANDLE_TO_CURSOR[handleKey]);

            handle.onHandleDelta = (pointerPosition: Point): void =>
            {
                // Scale handles can be swapped with each other, i.e. handle.handle can change!
                this.scaleGroup(handle.handle as ScaleHandle, pointerPosition);
            };

            handle.visible = this._scaleEnabled;

            scaleHandles[handleKey] = handle;
            this.addChild(scaleHandles[handleKey]);

            return scaleHandles;
        }, {});
        const skewHandles = {
            skewHorizontal: this.addChild(
                new HandleConstructor(
                    'skewHorizontal',
                    handleStyle,
                    (pointerPosition: Point) => { this.skewGroup('skewHorizontal', pointerPosition); },
                    this.commitGroup,
                    'pointer',
                )),
            skewVertical: this.addChild(
                new HandleConstructor(
                    'skewVertical',
                    handleStyle,
                    (pointerPosition: Point) => { this.skewGroup('skewVertical', pointerPosition); },
                    this.commitGroup,
                    'pointer',
                )),
        };

        // Scale handles have higher priority
        this.handles = Object.assign({}, scaleHandles, rotatorHandles, skewHandles) as { [H in Handle]?: TransformerHandle };
        this.handles.middleCenter.visible = false;
        this.handles.skewHorizontal.visible = this._skewEnabled;
        this.handles.skewVertical.visible = this._skewEnabled;

        this.handleAnchors = {
            rotator: new Point(),
            boxRotateTopLeft: new Point(),
            boxRotateTopRight: new Point(),
            boxRotateBottomLeft: new Point(),
            boxRotateBottomRight: new Point(),
            topLeft: new Point(),
            topCenter: new Point(),
            topRight: new Point(),
            middleLeft: new Point(),
            middleCenter: new Point(),
            middleRight: new Point(),
            bottomLeft: new Point(),
            bottomCenter: new Point(),
            bottomRight: new Point(),
            skewHorizontal: new Point(),
            skewVertical: new Point(),
        };

        // Update groupBounds immediately. This is because mouse events can propagate before the next animation frame.
        this.groupBounds = new OrientedBounds();
        this.updateGroupBounds();

        // Pointer events
        this._pointerDown = false;
        this._pointerDragging = false;
        this._pointerPosition = new Point();
        this.on('pointerdown', this.onPointerDown, this);
        this.on('pointermove', this.onPointerMove, this);
        this.on('pointerup', this.onPointerUp, this);
        this.on('pointerupoutside', this.onPointerUp, this);
    }

    /**
     * The list of enabled handles, if applied manually.
     */
    get enabledHandles(): Array<Handle>
    {
        return this._enabledHandles;
    }
    set enabledHandles(value: Array<Handle>)
    {
        if (!this._enabledHandles && !value)
        {
            return;
        }

        this._enabledHandles = value;

        HANDLES.forEach((handleKey) => { this.handles[handleKey].visible = false; });

        if (value)
        {
            value.forEach((handleKey) => { this.handles[handleKey].visible = true; });
        }
        else
        {
            this.handles.rotator.visible = this._rotateEnabled;
            this.handles.skewHorizontal.visible = this._skewEnabled;
            this.handles.skewVertical.visible = this._skewEnabled;

            SCALE_HANDLES.forEach((handleKey) =>
            {
                if (handleKey === 'middleCenter') return;

                this.handles[handleKey].visible = this._scaleEnabled;
            });
        }
    }

    /**
     * The currently applied handle style. If you have edited the transformer handles directly, this may be inaccurate.
     */
    get handleStyle(): Partial<ITransformerHandleStyle>
    {
        return this._handleStyle;
    }
    set handleStyle(value: Partial<ITransformerHandleStyle>)
    {
        const handles = this.handles;

        for (const handleKey in handles)
        {
            (handles[handleKey] as TransformerHandle).style = value;
        }

        this._handleStyle = value;
    }

    /**
     * This will enable the rotate handles.
     */
    get rotateEnabled(): boolean
    {
        return this._rotateEnabled;
    }
    set rotateEnabled(value: boolean)
    {
        if (this._rotateEnabled !== value)
        {
            this._rotateEnabled = value;

            if (this._enabledHandles)
            {
                return;
            }

            this.handles.rotator.visible = value;
        }
    }

    /**
     * This will enable the scale handles.
     */
    get scaleEnabled(): boolean
    {
        return this._scaleEnabled;
    }
    set scaleEnabled(value: boolean)
    {
        if (this._scaleEnabled !== value)
        {
            this._scaleEnabled = value;

            if (this._enabledHandles)
            {
                return;
            }

            SCALE_HANDLES.forEach((handleKey) =>
            {
                if (handleKey === 'middleCenter')
                {
                    return;
                }

                this.handles[handleKey].visible = value;
            });
        }
    }

    /**
     * This will enable the skew handles.
     */
    get skewEnabled(): boolean
    {
        return this._skewEnabled;
    }
    set skewEnabled(value: boolean)
    {
        if (this._skewEnabled !== value)
        {
            this._skewEnabled = value;

            if (this._enabledHandles)
            {
                return;
            }

            this.handles.skewHorizontal.visible = value;
            this.handles.skewVertical.visible = value;
        }
    }

    /**
     * This is the type of transformation being applied by the user on the group. It can be inaccurate if you call one of
     * `translateGroup`, `scaleGroup`, `rotateGroup`, `skewGroup` without calling `commitGroup` afterwards.
     *
     * @readonly
     */
    get transformType(): 'translate' | 'scale' | 'rotate' | 'skew' | 'none'
    {
        return this._transformType;
    }

    /**
     * The currently applied wireframe style.
     */
    get wireframeStyle(): Partial<ITransformerStyle>
    {
        return this._wireframeStyle;
    }
    set wireframeStyle(value: Partial<ITransformerStyle>)
    {
        this._wireframeStyle = Object.assign({}, DEFAULT_WIREFRAME_STYLE, value);
    }

    /**
     * @param forceUpdate - forces a recalculation of the group bounds
     * @returns the oriented bounding box of the wireframe
     */
    getGroupBounds(forceUpdate = false): OrientedBounds
    {
        if (forceUpdate)
        {
            this.updateGroupBounds();
        }

        return this.groupBounds;
    }

    /**
     * This will translate the group by {@code delta} in their world-space.
     *
     * NOTE: There is no handle that provides translation. The user drags the transformer directly.
     *
     * @param delta
     */
    translateGroup = (delta: Point): void =>
    {
        this._transformHandle = null;
        this._transformType = 'translate';

        // Translation matrix
        const matrix = tempMatrix
            .identity()
            .translate(delta.x, delta.y);

        this.prependTransform(matrix);
    };

    /**
     * This will rotate the group such that the handle will come to {@code pointerPosition}.
     *
     * @param handle - the rotator handle was dragged
     * @param pointerPosition - the new pointer position, in screen space
     */
    rotateGroup = (handle: RotateHandle, pointerPosition: Point): void =>
    {
        this._transformHandle = handle;
        this._transformType = 'rotate';

        const bounds = this.groupBounds;
        const handlePosition = this.worldTransform.apply(this.handleAnchors[handle], tempPoint);

        this.projectionTransform.applyInverse(handlePosition, handlePosition);
        pointerPosition = this.projectionTransform.applyInverse(pointerPosition, tempPointer);

        // Center of rotation - does not change in transformation
        const rOrigin = bounds.center;

        // Original tilt
        const orgAngle = Math.atan2(handlePosition.y - rOrigin.y, handlePosition.x - rOrigin.x);
        // Final tilt
        const dstAngle = Math.atan2(pointerPosition.y - rOrigin.y, pointerPosition.x - rOrigin.x);
        // The angle by which bounds should be rotated
        let deltaAngle = dstAngle - orgAngle;

        // Snap
        let newRotation = this.groupBounds.rotation + deltaAngle;

        newRotation = this.snapAngle(newRotation, this.rotationSnapTolerance, this.rotationSnaps);
        deltaAngle = newRotation - this.groupBounds.rotation;

        // Rotation matrix
        const matrix = tempMatrix
            .identity()
            .translate(-rOrigin.x, -rOrigin.y)
            .rotate(deltaAngle)
            .translate(rOrigin.x, rOrigin.y);

        this.prependTransform(matrix, true);
        this.updateGroupBounds(newRotation);

        // Rotation moves both skew.x & skew.y
        this._skewX += deltaAngle;
        this._skewY += deltaAngle;
    };

    /**
     * This will scale the group such that the scale handle will come under {@code pointerPosition}.
     *
     * @param handle - the scaling handle that was dragged
     * @param pointerPosition - the new pointer position, in screen space
     */
    scaleGroup = (handle: ScaleHandle, pointerPosition: Point): void =>
    {
        this._transformHandle = handle;
        this._transformType = 'scale';

        // Directions along x,y axes that will produce positive scaling
        const xDir = SCALE_COMPONENTS[handle].x;
        const yDir = SCALE_COMPONENTS[handle].y;

        const handles = this.handles;
        const bounds = this.groupBounds;
        const angle = bounds.rotation;
        const innerBounds = bounds.innerBounds;

        // Position of handle in the group's world-space
        const handlePosition = this.worldTransform.apply(this.handleAnchors[handle], tempPoint);

        this.projectionTransform.applyInverse(handlePosition, handlePosition);
        pointerPosition = this.projectionTransform.applyInverse(pointerPosition, tempPointer);

        // Delta vector in world frame
        const dx = pointerPosition.x - handlePosition.x;
        const dy = pointerPosition.y - handlePosition.y;

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

        const matrix = tempMatrix.identity();

        // NOTE: Do not apply scaling when sx,sy = 0 to prevent matrices from being degenerate.

        if (xDir !== 0 && sx !== 0)
        {
            // Origin of horizontal scaling - a point which does not move after applying the transform
            // eslint-disable-next-line no-nested-ternary
            const hsOrigin = !this.centeredScaling ? (xDir === 1 ? bounds.topLeft : bounds.topRight) : bounds.center;

            matrix.translate(-hsOrigin.x, -hsOrigin.y)
                .rotate(-angle)
                .scale(sx, 1)
                .rotate(angle)
                .translate(hsOrigin.x, hsOrigin.y);
        }

        if (yDir !== 0 && sy !== 0)
        {
            // Origin of vertical scaling - a point which does not move after applying the transform
            // eslint-disable-next-line no-nested-ternary
            const vsOrigin = !this.centeredScaling ? (yDir === 1 ? bounds.topLeft : bounds.bottomLeft) : bounds.center;

            matrix.translate(-vsOrigin.x, -vsOrigin.y)
                .rotate(-angle)
                .scale(1, sy)
                .rotate(angle)
                .translate(vsOrigin.x, vsOrigin.y);
        }

        // Handles flips along x & y axis. Handles are always flipped along the y-axis, however. This is
        // because a negative x-scale adds 180° to the rotation - as a result, the handles are automatically
        // flipped along the x-axis but also the y-axis - and this needs to be reversed (by flipping again).
        //
        // NOTE: When both x & y axes are flipped, then there is no need for swapping b/c they cancel out.
        if ((sy < 0 || sx < 0) && !(sy < 0 && sx < 0))
        {
            switch (handle)
            {
                case 'topLeft':
                case 'bottomLeft':
                    this.swapHandles(handles.topLeft, handles.bottomLeft);
                    break;
                case 'topCenter':
                case 'bottomCenter':
                    this.swapHandles(handles.topCenter, handles.bottomCenter);
                    break;
                case 'topRight':
                case 'bottomRight':
                    this.swapHandles(handles.topRight, handles.bottomRight);
                    break;
            }
        }

        this.prependTransform(matrix);
    };

    /**
     * This will skew the group such that the skew handle would move to the {@code pointerPosition}.
     *
     * @param handle
     * @param pointerPosition - pointer position, in screen space
     */
    skewGroup = (handle: SkewHandle, pointerPosition: Point): void =>
    {
        this._transformHandle = handle;
        this._transformType = 'skew';

        const bounds = this.groupBounds;

        // Destination point
        const dst = tempPoint.copyFrom(pointerPosition);

        this.projectionTransform.applyInverse(dst, dst);

        // Center of skew (same as center of rotation!)
        const sOrigin = bounds.center;

        // Skew matrix
        const matrix = tempMatrix.identity()
            .translate(-sOrigin.x, -sOrigin.y);
        let rotation = this.groupBounds.rotation;

        if (handle === 'skewHorizontal')
        {
            const oldSkew = this._skewX;

            // Calculate new skew
            this._skewX = Math.atan2(dst.y - sOrigin.y, dst.x - sOrigin.x);
            this._skewX = this.snapAngle(this._skewX, this.skewSnapTolerance, this.skewSnaps);

            // Skew by new skew.x
            matrix.prepend(createVerticalSkew(-oldSkew));
            matrix.prepend(createVerticalSkew(this._skewX));
        }
        else // skewVertical
        {
            const oldSkew = this._skewY;

            // Calculate new skew
            const newSkew = Math.atan2(dst.y - sOrigin.y, dst.x - sOrigin.x) - (Math.PI / 2);

            this._skewY = newSkew;
            this._skewY = this.snapAngle(this._skewY, this.skewSnapTolerance, this.skewSnaps);

            // HINT: skewY is applied negatively b/c y-axis is flipped
            matrix.prepend(createHorizontalSkew(oldSkew));
            matrix.prepend(createHorizontalSkew(-this._skewY));

            rotation -= this._skewY - oldSkew;
        }

        matrix.translate(sOrigin.x, sOrigin.y);

        this.prependTransform(matrix, true);
        this.updateGroupBounds(rotation);
    };

    /**
     * This is called after the user finishes dragging a handle. If {@link this.transientGroupTilt} is enabled, it will
     * reset the rotation of this group (if more than one display-object is grouped).
     */
    commitGroup = (): void =>
    {
        this._transformHandle = null;
        this._transformType = 'none';

        if (this.transientGroupTilt !== false && this.group.length > 1)
        {
            this.updateGroupBounds(0);
        }

        this.emit('transformcommit');
    };

    /**
     * This will update the transformer's geometry and render it to the canvas.
     *
     * @override
     * @param renderer
     */
    render(renderer: Renderer): void
    {
        if (this.renderable && this.visible)
        {
            this.draw();
        }

        super.render(renderer);
    }

    /**
     * Recalculates the transformer's geometry. This is called on each render.
     */
    protected draw(): void
    {
        const targets = this.group;
        const { color, thickness } = this._wireframeStyle;

        // Updates occur right here!
        this.wireframe.clear()
            .lineStyle(thickness, color);

        if (this.translateEnabled)
        {
            this.wireframe.beginFill(0xffffff, 1e-4);
        }

        for (let i = 0, j = targets.length; i < j; i++)
        {
            this.wireframe.drawBounds(Transformer.calculateOrientedBounds(targets[i], tempBounds));
        }

        // groupBounds may change on each render-loop b/c of any ongoing animation
        const groupBounds = targets.length !== 1
            ? Transformer.calculateGroupOrientedBounds(targets, this.groupBounds.rotation, tempBounds, true)
            : Transformer.calculateOrientedBounds(targets[0], tempBounds);// Auto-detect rotation

        // Redraw skeleton and position handles
        this.wireframe.drawBounds(groupBounds);

        this.drawHandles(groupBounds);

        // Update cached groupBounds
        this.groupBounds.copyFrom(groupBounds);

        if (this.boxRotationEnabled)
        {
            this.wireframe.closePath()
                .beginFill(0xffffff, 1e-4)
                .lineStyle();
            this.wireframe.drawBoxRotationTolerance();
        }

        if (this.boxScalingEnabled)
        {
            this.wireframe
                .closePath()
                .beginFill(0xfff0ff, .1)
                .lineStyle();
            this.wireframe.drawBoxScalingTolerance(groupBounds);
        }
    }

    /**
     * Draw the handles and any remaining parts of the wireframe.
     *
     * @param groupBounds
     */
    protected drawHandles(groupBounds: OrientedBounds): void
    {
        const handles = this.handles;
        const handleAnchors = this.handleAnchors;
        const {
            topLeft: worldTopLeft,
            topRight: worldTopRight,
            bottomLeft: worldBottomLeft,
            bottomRight: worldBottomRight,
            center: worldCenter,
        } = groupBounds;

        const [topLeft, topRight, bottomLeft, bottomRight] = tempHull;
        const center = tempPoint;

        this.projectToLocal(worldTopLeft, topLeft);
        this.projectToLocal(worldTopRight, topRight);
        this.projectToLocal(worldBottomLeft, bottomLeft);
        this.projectToLocal(worldBottomRight, bottomRight);
        this.projectToLocal(worldCenter, center);

        handleAnchors.topLeft.copyFrom(topLeft);
        handleAnchors.topCenter.set((topLeft.x + topRight.x) / 2, (topLeft.y + topRight.y) / 2);
        handleAnchors.topRight.copyFrom(topRight);
        handleAnchors.middleLeft.set((topLeft.x + bottomLeft.x) / 2, (topLeft.y + bottomLeft.y) / 2);
        handleAnchors.middleCenter.set((topLeft.x + bottomRight.x) / 2, (topLeft.y + bottomRight.y) / 2);
        handleAnchors.middleRight.set((topRight.x + bottomRight.x) / 2, (topRight.y + bottomRight.y) / 2);
        handleAnchors.bottomLeft.copyFrom(bottomLeft);
        handleAnchors.bottomCenter.set((bottomLeft.x + bottomRight.x) / 2, (bottomLeft.y + bottomRight.y) / 2);
        handleAnchors.bottomRight.copyFrom(bottomRight);

        if (this.boxRotationEnabled)
        {
            handleAnchors.boxRotateTopLeft.copyFrom(handleAnchors.topLeft);
            handleAnchors.boxRotateTopRight.copyFrom(handleAnchors.topRight);
            handleAnchors.boxRotateBottomLeft.copyFrom(handleAnchors.bottomLeft);
            handleAnchors.boxRotateBottomRight.copyFrom(handleAnchors.bottomRight);
        }

        if (this._rotateEnabled)
        {
            // Midpoint from topLeft to topRight
            const bx = (topLeft.x + topRight.x) / 2;
            const by = (topLeft.y + topRight.y) / 2;

            // Vector perpendicular to <bx,by>.
            let px = -(topLeft.y - topRight.y);
            let py = (topLeft.x - topRight.x);

            // Normalize <px,py> to 32 units.
            const pl = Math.sqrt((px * px) + (py * py));

            px *= 32 / pl;
            py *= 32 / pl;

            handles.rotator.position.x = bx + px;
            handles.rotator.position.y = by + py;

            this.wireframe.moveTo(bx, by)
                .lineTo(handles.rotator.position.x, handles.rotator.position.y);

            this.handleAnchors.rotator.copyFrom(handles.rotator.position);
        }

        if (this._skewEnabled)
        {
            const cx = center.x;
            const cy = center.y;

            // Transform center into screen space
            this.worldTransform.apply(center, center);

            // Calculate skew handle positions in screen space, and then transform back into local-space. This ensures that
            // the handles appear at skewRadius distance, regardless of the projection.
            handles.skewHorizontal.position.set(
                center.x + (Math.cos(this._skewX) * this.skewRadius),
                center.y + (Math.sin(this._skewX) * this.skewRadius));
            handles.skewVertical.position.set( // HINT: Slope = skew.y + Math.PI / 2
                center.x + (-Math.sin(this._skewY) * this.skewRadius),
                center.y + (Math.cos(this._skewY) * this.skewRadius));
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
        for (const handleName in handles)
        {
            let rotation = this.groupBounds.rotation;

            if (handleName === 'skewHorizontal')
            {
                rotation = this._skewX;
            }
            else if (handleName === 'skewVertical')
            {
                rotation = this._skewY;
            }

            const handle: TransformerHandle = handles[handleName];

            handle.rotation = rotation;
            handle.getBounds(false, tempRect);
        }
    }

    /**
     * Called on the `pointerdown` event. You must call the super implementation.
     *
     * @param e
     */
    protected onPointerDown(e: InteractionEvent): void
    {
        this._pointerDown = true;
        this._pointerDragging = false;

        e.stopPropagation();
    }

    /**
     * Called on the `pointermove` event. You must call the super implementation.
     *
     * @param e
     */
    protected onPointerMove(e: InteractionEvent): void
    {
        if (!this._pointerDown)
        {
            return;
        }

        const lastPointerPosition = this._pointerPosition;
        const currentPointerPosition = pointPool.allocate().copyFrom(e.data.global);

        const cx = currentPointerPosition.x;
        const cy = currentPointerPosition.y;

        // Translate group by difference
        if (this._pointerDragging)
        {
            switch (this._transformHandle)
            {
                case 'boxRotateTopLeft':
                case 'boxRotateTopRight':
                case 'boxRotateBottomLeft':
                case 'boxRotateBottomRight':
                    this.rotateGroup(this._transformHandle, currentPointerPosition);
                    break;
                case 'topCenter':
                case 'middleLeft':
                case 'middleRight':
                case 'bottomCenter':
                    this.scaleGroup(this._transformHandle, currentPointerPosition);
                    break;
                default: {
                    if (this.translateEnabled)
                    {
                        const [worldOrigin, worldDestination, worldDelta] = tempHull;

                        // HINT: The pointer has moved from lastPointerPosition to currentPointerPosition in the
                        // transformer's world space. However, we want to translate the display-object's in their
                        // world space; to do this, we project (0,0) and the delta into their world-space, and take
                        // the difference.
                        worldOrigin.set(0, 0);
                        worldDestination.set(
                            currentPointerPosition.x - lastPointerPosition.x,
                            currentPointerPosition.y - lastPointerPosition.y);
                        this.projectionTransform.applyInverse(worldOrigin, worldOrigin);
                        this.projectionTransform.applyInverse(worldDestination, worldDestination);

                        worldDelta.set(worldDestination.x - worldOrigin.x, worldDestination.y - worldOrigin.y);

                        this.translateGroup(worldDelta);
                    }
                }
            }
        }
        else
        {
            this._transformHandle = this.wireframe.hitHandleType(
                this.groupBounds,
                this.projectionTransform,
                currentPointerPosition);
        }

        this._pointerPosition.x = cx;
        this._pointerPosition.y = cy;
        this._pointerDragging = true;

        pointPool.release(currentPointerPosition);
        e.stopPropagation();
    }

    /**
     * Called on the `pointerup` and `pointerupoutside` events. You must call the super implementation.
     *
     * @param e
     */
    protected onPointerUp(e: InteractionEvent): void
    {
        this._pointerDragging = false;
        this._pointerDown = false;

        this.commitGroup();
        e.stopPropagation();
    }

    /**
     * Applies the given transformation matrix {@code delta} to all the display-objects in the group.
     *
     * @param delta - transformation matrix
     * @param skipUpdate - whether to skip updating the group-bounds after applying the transform
     */
    private prependTransform(delta: Matrix, skipUpdate = false): void
    {
        const group = this.group;

        for (let i = 0, j = group.length; i < j; i++)
        {
            multiplyTransform(group[i], delta, false);
        }

        emitMatrix.copyFrom(delta);

        if (!skipUpdate)
        {
            this.updateGroupBounds();
        }

        this.emit('transformchange', emitMatrix);
    }

    /**
     * Recalculates {@code this.groupBounds} at the same angle.
     *
     * @param rotation - override the group's rotation
     */
    private updateGroupBounds(rotation: number = this.groupBounds.rotation): void
    {
        Transformer.calculateGroupOrientedBounds(this.group, rotation, this.groupBounds);
        this.drawHandles(this.groupBounds);
    }

    /**
     * Snaps the given {@code angle} to one of the snapping angles, if possible.
     *
     * @param angle - the input angle
     * @param snapTolerance - the maximum difference b/w the given angle & a snapping angle
     * @param snaps - the snapping angles
     * @returns the snapped angle
     */
    private snapAngle(angle: number, snapTolerance: number, snaps?: number[]): number
    {
        angle = angle % (Math.PI * 2);

        if (!snaps || snaps.length === 1 || !snapTolerance)
        {
            return angle;
        }

        for (let i = 0, j = snaps.length; i < j; i++)
        {
            if (Math.abs(angle - snaps[i]) <= snapTolerance)
            {
                return snaps[i];
            }
        }

        return angle;
    }

    /**
     * Swap the handles represented by the two {@code TransformerHandle} instances.
     *
     * @param handle0
     * @param handle1
     */
    private swapHandles(handle0: TransformerHandle, handle1: TransformerHandle): void
    {
        const key0 = handle0.handle;
        const key1 = handle1.handle;
        const cursor0 = handle0.cursor;
        const cursor1 = handle1.cursor;
        const x0 = handle0.x;
        const x1 = handle1.x;
        const y0 = handle0.y;
        const y1 = handle1.y;

        handle0.handle = key1;
        handle1.handle = key0;
        handle0.position.set(x1, y1);
        handle1.position.set(x0, y0);
        handle0.cursor = cursor1;
        handle1.cursor = cursor0;

        this.handles[key0] = handle1;
        this.handles[key1] = handle0;

        if (this._transformHandle === key0)
        {
            this._transformHandle = key1;
        }
        else if (this._transformHandle === key1)
        {
            this._transformHandle = key0;
        }
    }

    /**
     * Projects {@code input} from the group's world space into the transformer's local space, and puts the result
     * into {@code output}.
     *
     * @param input
     * @param output
     * @returns the output
     */
    projectToLocal(input: Point, output?: Point): Point
    {
        if (!output)
        {
            output = new Point();
        }

        this.projectionTransform.apply(input, output);
        this.worldTransform.applyInverse(output, output);

        return output;
    }

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
    static calculateTransformedCorners(
        displayObject: DisplayObject,
        transform: Matrix = displayObject.worldTransform,
        corners?: Point[],
        index = 0,
    ): Point[]
    {
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
    static calculateOrientedBounds(displayObject: DisplayObject, bounds?: OrientedBounds): OrientedBounds
    {
        const parent = !displayObject.parent ? displayObject.enableTempParent() : displayObject.parent;

        displayObject.updateTransform();
        displayObject.disableTempParent(parent);

        // Decompose displayObject.worldTransform to get its (world) rotation
        decomposeTransform(tempTransform, displayObject.worldTransform);

        tempTransform.updateLocalTransform();

        const angle = tempTransform.rotation;
        const corners = Transformer.calculateTransformedCorners(displayObject, displayObject.worldTransform, tempCorners);

        // Calculate centroid, which is our center of rotation
        const cx = (corners[0].x + corners[1].x + corners[2].x + corners[3].x) / 4;
        const cy = (corners[0].y + corners[1].y + corners[2].y + corners[3].y) / 4;

        // Unrotation matrix
        const matrix = tempMatrix
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
    static calculateGroupOrientedBounds(
        group: DisplayObject[],
        rotation: number,
        bounds?: OrientedBounds,
        skipUpdate = false,
    ): OrientedBounds
    {
        const groupLength = group.length;
        const frames = pointPool.allocateArray(groupLength * 4);// Zero allocations!

        // Calculate display-object frame vertices
        for (let i = 0; i < groupLength; i++)
        {
            const displayObject = group[i];

            // Update worldTransform
            if (!skipUpdate)
            {
                const parent = !displayObject.parent ? displayObject.enableTempParent() : displayObject.parent;

                displayObject.updateTransform();
                displayObject.disableTempParent(parent);
            }

            Transformer.calculateTransformedCorners(displayObject, displayObject.worldTransform, frames, i * 4);
        }

        // Unrotation matrix
        const matrix = tempMatrix
            .identity()
            .rotate(-rotation);
        let minX = Number.MAX_VALUE;
        let minY = Number.MAX_VALUE;
        let maxX = -Number.MAX_VALUE;
        let maxY = -Number.MAX_VALUE;

        // Unrotate all frame vertices, calculate minX, minY, maxX, maxY for innerBounds
        for (let i = 0, j = frames.length; i < j; i++)
        {
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

        matrix.applyInverse(bounds.center, tempPoint);
        bounds.center.copyFrom(tempPoint);

        return bounds;
    }
}

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
