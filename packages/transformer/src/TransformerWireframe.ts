import { Graphics } from '@pixi/graphics';
import { HANDLE_TO_CURSOR } from './Transformer';
import { ObjectPoolFactory } from '@pixi-essentials/object-pool';
import { Matrix, Point } from '@pixi/math';
import { distanceToLine } from './utils/distanceToLine';

import type { AxisAlignedBounds, OrientedBounds } from '@pixi-essentials/bounds';
import type { Handle, Transformer } from './Transformer';

const pointPool = ObjectPoolFactory.build(Point);
const tempHull = [new Point(), new Point(), new Point(), new Point()];
const tempMatrix = new Matrix();
const tempPoint = new Point();

/**
 * Box rotation region for the top-left corner, normalized to 1-unit tolerance
 * and positioned at the origin.
 *
 * @ignore
 * @internal
 */
const boxRotationRegionTopLeft = [
    0, 0,
    0, 1,
    -1, 1,
    -1, -1,
    1, -1,
    1, 0,
];

/**
 * Box rotation region for the top-right corner, normalized to 1-unit tolerance
 * and positioned at the origin.
 *
 * @ignore
 * @internal
 */
const boxRotationRegionTopRight = [
    0, 0,
    -1, 0,
    -1, -1,
    1, -1,
    1, 1,
    0, 1,
];

/**
 * Box rotation region for the bottom-left corner, normalized to 1-unit tolerance
 * and positioned at the origin.
 *
 * @ignore
 * @internal
 */
const boxRotationRegionBottomLeft = [
    0, 0,
    1, 0,
    1, 1,
    -1, 1,
    -1, -1,
    0, -1,
];

/**
 * Box rotation region for the bottom-right corner, normalized to 1-unit tolerance
 * and positioned at the origin.
 *
 * @ignore
 * @internal
 */
const boxRotationRegionBottomRight = [
    0, 0,
    0, -1,
    1, -1,
    1, 1,
    -1, 1,
    -1, 0,
];

/**
 * Array used to store transformed box rotation region geometries.
 *
 * @ignore
 * @internal
 */
const boxRotationTemp = new Array(12);

/**
 * Box rotation region geometries in one array.
 *
 * @ignore
 * @internal
 */
const boxRotationRegions = [
    boxRotationRegionTopLeft,
    boxRotationRegionTopRight,
    boxRotationRegionBottomLeft,
    boxRotationRegionBottomRight,
];

/**
 * The transformer's wireframe is drawn using this class.
 *
 * @ignore
 * @public
 */
export class TransformerWireframe extends Graphics
{
    protected transformer: Transformer;

    /**
     * The four scaling "edges" (or wide handles) for box-scaling. {@link TransformerWireframe#drawBoxScalingTolerance}
     * should draw into these.
     */
    protected boxScalingHandles: [Graphics, Graphics, Graphics, Graphics];

    constructor(transformer: Transformer)
    {
        super();

        this.transformer = transformer;

        this.boxScalingHandles = [
            this.addChild(new Graphics()),
            this.addChild(new Graphics()),
            this.addChild(new Graphics()),
            this.addChild(new Graphics()),
        ];
        this.boxScalingHandles.forEach((scalingHandle) => { scalingHandle.interactive = true; });
        this.boxScalingHandles[0].cursor = HANDLE_TO_CURSOR.topCenter;
        this.boxScalingHandles[1].cursor = HANDLE_TO_CURSOR.middleRight;
        this.boxScalingHandles[2].cursor = HANDLE_TO_CURSOR.bottomCenter;
        this.boxScalingHandles[3].cursor = HANDLE_TO_CURSOR.middleLeft;
    }

    /**
     * Detects which type of box-handle, if any, the pointer clicked on in the wireframe.
     *
     * @param groupBounds
     * @param projectionTransform
     * @param pointerPosition
     */
    public hitHandleType(groupBounds: OrientedBounds, projectionTransform: Matrix, pointerPosition: Point): Handle
    {
        const {
            boxRotationEnabled,
            boxRotationTolerance,
            boxScalingEnabled,
            boxScalingTolerance,
        } = this.transformer;
        const [
            topLeft,
            topRight,
            bottomRight,
            bottomLeft,
        ] = groupBounds.hull;

        projectionTransform.applyInverse(pointerPosition, pointerPosition);

        const x = pointerPosition.x;
        const y = pointerPosition.y;

        if (boxScalingEnabled)
        {
            const topProximity = distanceToLine(x, y, topLeft, topRight);
            const leftProximity = distanceToLine(x, y, topLeft, bottomLeft);
            const rightProximity = distanceToLine(x, y, topRight, bottomRight);
            const bottomProximity = distanceToLine(x, y, bottomLeft, bottomRight);
            const minProximity = Math.min(topProximity, leftProximity, rightProximity, bottomProximity);

            if (minProximity < boxScalingTolerance)
            {
                switch (minProximity)
                {
                    case topProximity: return 'topCenter';
                    case leftProximity: return 'middleLeft';
                    case rightProximity: return 'middleRight';
                    case bottomProximity: return 'bottomCenter';
                }
            }
        }

        if (boxRotationEnabled && !groupBounds.contains(x, y))
        {
            const tlProximity = Math.sqrt(((topLeft.x - x) ** 2) + ((topLeft.y - y) ** 2));
            const trProximity = Math.sqrt(((topRight.x - x) ** 2) + ((topRight.y - y) ** 2));
            const blProximity = Math.sqrt(((bottomLeft.x - x) ** 2) + ((bottomLeft.y - y) ** 2));
            const brProximity = Math.sqrt(((bottomRight.x - x) ** 2) + ((bottomRight.y - y) ** 2));
            const minProximity = Math.min(tlProximity, trProximity, blProximity, brProximity);

            // The box-rotation handles are squares, that mean they extend boxRotationTolerance√2
            if (minProximity < boxRotationTolerance * 1.45)
            {
                switch (minProximity)
                {
                    case tlProximity: return 'boxRotateTopLeft';
                    case trProximity: return 'boxRotateTopRight';
                    case blProximity: return 'boxRotateBottomLeft';
                    case brProximity: return 'boxRotateBottomRight';
                }
            }
        }

        return null;
    }

    /**
     * Draws the bounding box into the wireframe.
     *
     * @param bounds
     */
    public drawBounds(bounds: OrientedBounds | AxisAlignedBounds): void
    {
        const hull = tempHull;

        // Bring hull into local-space
        for (let i = 0; i < 4; i++)
        {
            this.transformer.projectToLocal(bounds.hull[i], hull[i]);
        }

        // Fill polygon with ultra-low alpha to capture pointer events.
        this.drawPolygon(hull);
    }

    /**
     * Draws around edges of the bounding box to capture pointer events within
     * {@link Transformer#boxScalingTolerance}.
     *
     * @param bounds
     * @param boxScalingTolerance
     */
    public drawBoxScalingTolerance(
        bounds: OrientedBounds,
        boxScalingTolerance = this.transformer.boxScalingTolerance,
    ): void
    {
        bounds.innerBounds.pad(-boxScalingTolerance);

        // Inner four corners
        const innerHull = pointPool.allocateArray(4);

        innerHull.forEach((innerCorner, i) =>
        {
            this.projectToLocal(bounds.hull[i], innerCorner);
        });

        // A little extra tolerance outside because of arrow cursors being longer
        bounds.innerBounds.pad(2.5 * boxScalingTolerance);

        // Outer four corners
        const outerHull = pointPool.allocateArray(4);

        outerHull.forEach((outerCorner, i) =>
        {
            this.projectToLocal(bounds.hull[i], outerCorner);
        });

        // Leave at original
        bounds.innerBounds.pad(-1.5 * this.transformer.boxScalingTolerance);

        for (let i = 0; i < 4; i++)
        {
            const innerStart = innerHull[i];
            const innerEnd = innerHull[(i + 1) % 4];
            const outerStart = outerHull[i];
            const outerEnd = outerHull[(i + 1) % 4];

            const boxScalingHandle = this.boxScalingHandles[i];

            boxScalingHandle.clear()
                .beginFill(0xffffff, 1e-4)
                .drawPolygon(innerStart, outerStart, outerEnd, innerEnd)
                .endFill();
        }
    }

    /**
     * Draws square-shaped tolerance regions for capturing pointer events within {@link Transformer#boxRotationTolernace}
     * of the four corners of the group bounding box. The square are cut in the interior region of the group bounds.
     */
    public drawBoxRotationTolerance(): void
    {
        const {
            boxRotateTopLeft: tl,
            boxRotateTopRight: tr,
            boxRotateBottomLeft: bl,
            boxRotateBottomRight: br,
        } = this.transformer.handleAnchors;

        // 2x because half of the square's width & height is inside
        const t = this.transformer.boxRotationTolerance * 2;

        // Expand box rotation regions to the given tolerance, and then rotate to align with
        // the group bounds. The position is added manually.
        const matrix = tempMatrix
            .identity()
            .scale(t, t)
            .rotate(this.transformer.getGroupBounds().rotation);

        for (let i = 0; i < 4; i++)
        {
            const region = boxRotationRegions[i];
            let position: Point;

            switch (i)
            {
                case 0: position = tl; break;
                case 1: position = tr; break;
                case 2: position = bl; break;
                case 3: position = br; break;
            }

            for (let j = 0; j < region.length; j += 2)
            {
                const x = region[j];
                const y = region[j + 1];

                tempPoint.set(x, y);
                matrix.apply(tempPoint, tempPoint);

                boxRotationTemp[j] = tempPoint.x + position.x;
                boxRotationTemp[j + 1] = tempPoint.y + position.y;
            }

            this.drawPolygon(boxRotationTemp.slice());
        }
    }

    /**
     * Alias for {@link Transformer#projectToLocal}. The transform of the wireframe should equal that
     * of the transformer itself.
     *
     * @param input
     * @param output
     */
    protected projectToLocal(input: Point, output: Point): Point
    {
        return this.transformer.projectToLocal(input, output);
    }
}
