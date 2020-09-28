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

    public fill: number | string;
    public opacity: number;
    public stroke: number | string;
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
        const opacity = element.getAttribute('opacity');
        const stroke = element.getAttribute('stroke');
        const strokeDashArray = element.getAttribute('stroke-dasharray');
        const strokeDashOffset = element.getAttribute('stroke-dashoffset');
        const strokeLineCap = element.getAttribute('stroke-linecap');
        const strokeLineJoin = element.getAttribute('stroke-linejoin');
        const strokeMiterLimit = element.getAttribute('stroke-miterlimit');
        const strokeWidth = element.getAttribute('stroke-width');

        /* eslint-disable-next-line no-nested-ternary */
        this.fill = fill !== null ? (fill === 'none' ? 'none' : PaintProvider.parseColor(fill)) : null;
        this.opacity = opacity && parseFloat(opacity);
        this.stroke = stroke && PaintProvider.parseColor(element.getAttribute('stroke'));
        this.strokeDashArray = strokeDashArray
            && strokeDashArray
                ?.split(',')
                .map((num) => parseFloat(num.trim()));
        this.strokeDashOffset = strokeDashOffset && parseFloat(strokeDashOffset);
        this.strokeLineCap = strokeLineCap as unknown as LINE_CAP;
        this.strokeLineJoin = strokeLineJoin as unknown as LINE_JOIN;
        this.strokeMiterLimit = strokeMiterLimit && parseFloat(strokeMiterLimit);
        this.strokeWidth = strokeWidth && parseFloat(strokeWidth);
    }

    /**
     * Parses the color attribute into an RGBA hexadecimal equivalent, if encoded. If the `colorString` is `none` or
     * is a `url(#id)` reference, it is returned as is.
     *
     * @param colorString
     * @see https://github.com/bigtimebuddy/pixi-svg/blob/89e4ab834fa4ef05b64741596516c732eae34daa/src/SVG.js#L106
     */
    public static parseColor(colorString: string): number | string
    {
        /* Modifications have been made. */
        /* Copyright (C) Matt Karl. */

        if (!colorString)
        {
            return 0;
        }
        if (colorString === 'none' || colorString.startsWith('url'))
        {
            return colorString;
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
