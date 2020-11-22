import { GraphicsGeometry } from '@pixi/graphics';
import { PATH } from './utils/Path';
import { buildDashedLine } from './utils/buildDashedLine';

import type { GraphicsData } from '@pixi/graphics';
import type { DashedLineStyle } from './style/DashedLineStyle';
import type { Path } from './utils/Path';

export class SVGGraphicsGeometry extends GraphicsGeometry
{
    processLine(data: GraphicsData): void
    {
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
                    // @ts-expect-error
                    {
                        points: contour,
                        holes: [],
                        shape: null,
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
                    shape: { points: contour, type: PATH },
                    lineStyle,
                });
            }
        });
    }
}
