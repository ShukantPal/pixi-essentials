import { Bounds } from '@pixi/display';
import { GraphicsGeometry } from '@pixi/graphics';
import { Matrix } from '@pixi/math';
import { PATH } from './utils/Path';
import { buildDashedLine } from './utils/buildDashedLine';

import type { GraphicsData } from '@pixi/graphics';
import type { DashedLineStyle } from './style/DashedLineStyle';
import type { Path } from './utils/Path';
import type { Circle, Ellipse, Polygon, Rectangle, RoundedRectangle } from '@pixi/math';

const tmpBounds = new Bounds();

// @pixi/graphics should export this, ugh!
enum SHAPES {
    POLY = 0,
    RECT = 1,
    CIRC = 2,
    ELIP = 3,
    RREC = 4,
}

/** @public */
export class SVGGraphicsGeometry extends GraphicsGeometry
{
    processLine(data: GraphicsData): void
    {
        // @ts-expect-error Because we are extending the Shape enum.
        if (data.shape.type === PATH)
        {
            this.processPathLine(data);

            return;
        }

        const lineStyle = data.lineStyle as DashedLineStyle;

        if (!lineStyle.dashArray)
        {
            super.processLine(data);
        }
        else
        {
            buildDashedLine(data, this);
        }
    }

    processPathLine(data: GraphicsData): void
    {
        const path = data.shape as unknown as Path;
        const lineStyle = data.lineStyle as DashedLineStyle;

        path.contours.forEach((contour) =>
        {
            if (contour.find((e) => isNaN(e)) !== undefined)
            {
                console.error('Contour has NaN, oops!');

                return;
            }

            if (lineStyle.dashArray)
            {
                buildDashedLine(
                    {
                        points: contour,
                        holes: [],

                        // @ts-expect-error
                        shape: { points: contour, type: SHAPES.POLY },
                        lineStyle,
                    },
                    this,
                );
            }
            else
            {
                super.processLine({
                    closeStroke: true,
                    points: contour.slice(),
                    holes: [],

                    // @ts-expect-error
                    shape: { points: contour, type: SHAPES.POLY },
                    lineStyle,
                });
            }
        });
    }

    protected calculateBounds(): void
    {
        const bounds = this._bounds;
        const sequenceBounds = tmpBounds;
        let curMatrix = Matrix.IDENTITY;

        this._bounds.clear();
        sequenceBounds.clear();

        for (let i = 0; i < this.graphicsData.length; i++)
        {
            const data = this.graphicsData[i];
            const shape = data.shape;
            const type = data.type;
            const lineStyle = data.lineStyle;
            const nextMatrix = data.matrix || Matrix.IDENTITY;
            let lineWidth = 0.0;

            if (lineStyle && lineStyle.visible)
            {
                const alignment = lineStyle.alignment;

                lineWidth = lineStyle.width;

                if (type === SHAPES.POLY)
                {
                    lineWidth = lineWidth * (0.5 + Math.abs(0.5 - alignment));
                }
                else
                {
                    lineWidth = lineWidth * Math.max(0, alignment);
                }
            }

            if (curMatrix !== nextMatrix)
            {
                if (!sequenceBounds.isEmpty())
                {
                    bounds.addBoundsMatrix(sequenceBounds, curMatrix);
                    sequenceBounds.clear();
                }
                curMatrix = nextMatrix;
            }

            if (type === SHAPES.RECT || type === SHAPES.RREC)
            {
                const rect = shape as Rectangle | RoundedRectangle;

                sequenceBounds.addFramePad(rect.x, rect.y, rect.x + rect.width, rect.y + rect.height,
                    lineWidth, lineWidth);
            }
            else if (type === SHAPES.CIRC)
            {
                const circle = shape as Circle;

                sequenceBounds.addFramePad(circle.x, circle.y, circle.x, circle.y,
                    circle.radius + lineWidth, circle.radius + lineWidth);
            }
            else if (type === SHAPES.ELIP)
            {
                const ellipse = shape as Ellipse;

                sequenceBounds.addFramePad(ellipse.x, ellipse.y, ellipse.x, ellipse.y,
                    ellipse.width + lineWidth, ellipse.height + lineWidth);
            }
            // @ts-expect-error Because we are extending the Shape enum.
            else if (type === PATH)
            {
                const path = shape as any as Path;

                path.contours.forEach((contour) =>
                {
                    bounds.addVerticesMatrix(Matrix.IDENTITY, new Float32Array(contour), 0, contour.length);
                });
            }
            else
            {
                const poly = shape as Polygon;
                // adding directly to the bounds

                bounds.addVerticesMatrix(curMatrix, (poly.points as any), 0, poly.points.length, lineWidth, lineWidth);
            }
        }

        if (!sequenceBounds.isEmpty())
        {
            bounds.addBoundsMatrix(sequenceBounds, curMatrix);
        }

        bounds.pad(this.boundsPadding, this.boundsPadding);
    }
}
