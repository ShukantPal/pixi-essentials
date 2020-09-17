/// <reference path="./types.d.ts" />

import { Graphics } from '@pixi/graphics';
import { HANDLE_TO_CURSOR } from './Transformer';
import { ObjectPoolFactory } from '@pixi-essentials/object-pool';
import { Matrix, Point } from '@pixi/math';
import { distanceToLine } from './utils/distanceToLine';

import type { AxisAlignedBounds, OrientedBounds } from '@pixi-essentials/bounds';
import type { Handle, Transformer } from './Transformer';

const pointPool = ObjectPoolFactory.build(Point);
const tempHull = [new Point(), new Point(), new Point(), new Point()];

/**
 * The transformer's wireframe is drawn using this class.
 *
 * @ignore
 * @internal
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

        bounds.innerBounds.pad(2 * boxScalingTolerance);

        // Outer four corners
        const outerHull = pointPool.allocateArray(4);

        outerHull.forEach((outerCorner, i) =>
        {
            this.projectToLocal(bounds.hull[i], outerCorner);
        });

        // Left at original
        bounds.innerBounds.pad(-this.transformer.boxScalingTolerance);

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
     * of the four corners of the group bounding box.
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

        // Top Left
        this.drawPolygon([
            tl.x - t, tl.y - t,
            tl.x + t, tl.y - t,
            tl.x + t, tl.y + t,
            tl.x - t, tl.y + t,
        ]);

        // Top Right
        this.drawPolygon([
            tr.x - t, tr.y - t,
            tr.x + t, tr.y - t,
            tr.x + t, tr.y + t,
            tr.x - t, tr.y + t,
        ]);

        // Bottom Left
        this.drawPolygon([
            bl.x - t, bl.y - t,
            bl.x + t, bl.y - t,
            bl.x + t, bl.y + t,
            bl.x - t, bl.y + t,
        ]);

        // Bottom Right
        this.drawPolygon([
            br.x - t, br.y - t,
            br.x + t, br.y - t,
            br.x + t, br.y + t,
            br.x - t, br.y + t,
        ]);
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
