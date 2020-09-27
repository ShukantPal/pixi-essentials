import { LINE_CAP, LINE_JOIN } from '@pixi/graphics';
import color from 'tinycolor2';

import type { Paint } from './Paint';

/**
 * Provides the `Paint` for an `SVGElement`. It will also respond to changes in the attributes of the element
 * (not implemented).
 */
export class PaintProvider implements Paint
{
    public element: SVGElement;

    public fill: number | 'none';
    public opacity: number;
    public stroke: number;
    public strokeDashArray: number[];
    public strokeDashOffset: number;
    public strokeLineCap: LINE_CAP;
    public strokeLineJoin: LINE_JOIN;
    public strokeMiterLimit: number;
    public strokeWidth: number;

    public dirtyId = 0;

    /**
     * @param element - The element whose paint is to be provided.
     */
    constructor(element: SVGElement)
    {
        this.element = element;

        const fill = element.getAttribute('fill');

        this.fill = fill === 'none' ? 'none' : this.parseColor(fill || '0');
        this.opacity = parseFloat(element.getAttribute('opacity') || '1');
        this.stroke = this.parseColor(element.getAttribute('stroke') || '0');
        this.strokeWidth = parseFloat(element.getAttribute('stroke-width') || (this.stroke ? '1' : '0'));
        this.strokeLineCap = parseFloat(element.getAttribute('stroke-linecap') || `${LINE_CAP.BUTT}`);
        this.strokeLineJoin = parseFloat(element.getAttribute('stroke-linejoin') || `${LINE_JOIN.MITER}`);
        this.strokeMiterLimit = parseFloat(element.getAttribute('stroke-miterlimit') || '0');
        this.strokeDashArray = element
            .getAttribute('stroke-dasharray')
            ?.split(',')
            .map((num) => parseFloat(num.trim()));
        this.strokeDashOffset = parseFloat(element.getAttribute('stroke-dashoffset') || '0');
    }

    /**
     * Parses the color attribute into an RGBA hexadecimal equivalent.
     *
     * @param colorString
     */
    parseColor(colorString: string): number
    {
        if (!colorString)
        {
            return 0;
        }

        if (colorString[0] === '#')
        {
            // Remove the hash
            colorString = colorString.substr(1);

            // Convert shortcolors fc9 to ffcc99
            if (colorString.length === 3)
            {
                colorString = colorString.replace(/([a-f0-9])/ig, '$1$1');
            }

            return parseInt(colorString, 16);
        }

        const { r, g, b } = color(colorString).toRgb();

        return (r << 16) + (g << 8) + b;
    }
}
