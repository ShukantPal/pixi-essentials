import { GraphicsGeometry } from '@pixi/graphics';
import { buildDashedLine } from './utils/buildDashedLine';

import type { GraphicsData } from '@pixi/graphics';
import type { DashedLineStyle } from './style/DashedLineStyle';

export class SVGGraphicsGeometry extends GraphicsGeometry
{
    processLine(data: GraphicsData): void
    {
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
}
