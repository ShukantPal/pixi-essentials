import { DashedLineStyle } from './style/DashedLineStyle';
import { LINE_CAP, LINE_JOIN } from '@pixi/graphics';
import { Graphics } from '@pixi/graphics';
import { SVGGraphicsGeometry } from './SVGGraphicsGeometry';
import { Texture } from '@pixi/core';

import type { Matrix } from '@pixi/math';
import type { PaintServer } from './paint/PaintServer';
import type { Renderer } from '@pixi/core';

interface ILineStyleOptions {
    color?: number;
    alpha?: number;
    texture?: Texture;
    matrix?: Matrix;

    width?: number;
    alignment?: number;
    native?: boolean;
    cap?: LINE_CAP;
    join?: LINE_JOIN;
    miterLimit?: number;

    // additions
    dashArray?: number[];
    dashOffset?: number;
}

/**
 * This node can be used to directly embed the following elements:
 *
 * | Interface           | Element            |
 * | ------------------- | ------------------ |
 * | SVGGElement         | &lt;g /&gt;        |
 * | SVGCircleElement    | &lt;circle /&gt;   |
 * | SVGLineElement      | &lt;line /&gt;     |
 * | SVGPolylineElement  | &lt;polyline /&gt; |
 * | SVGPolygonElement   | &lt;polygon /&gt;  |
 * | SVGRectElement      | &lt;rect /&gt;     |
 *
 * It also provides an implementation for dashed stroking, by adding the `dashArray` and `dashOffset` properties
 * to `LineStyle`.
 */
export class SVGGraphicsNode extends Graphics
{
    paintServers: PaintServer[];

    constructor()
    {
        super();

        (this as any)._geometry = new SVGGraphicsGeometry();
        (this as any)._geometry.refCount++;

        this._lineStyle = new DashedLineStyle();

        this.paintServers = [];
    }

    public lineTextureStyle(options: ILineStyleOptions): this
    {
        // Apply defaults
        options = Object.assign({
            width: 0,
            texture: Texture.WHITE,
            color: (options && options.texture) ? 0xFFFFFF : 0x0,
            alpha: 1,
            matrix: null,
            alignment: 0.5,
            native: false,
            cap: LINE_CAP.BUTT,
            join: LINE_JOIN.MITER,
            miterLimit: 10,
            dashArray: null,
            dashOffset: 0,
        }, options);

        if (this.currentPath)
        {
            this.startPoly();
        }

        const visible = options.width > 0 && options.alpha > 0;

        if (!visible)
        {
            this._lineStyle.reset();
        }
        else
        {
            if (options.matrix)
            {
                options.matrix = options.matrix.clone();
                options.matrix.invert();
            }

            Object.assign(this._lineStyle, { visible }, options);
        }

        return this;
    }

    /**
     * Embeds the `SVGCircleElement` into this node.
     *
     * @param element - The circle element to draw.
     */
    embedCircle(element: SVGCircleElement): void
    {
        element.cx.baseVal.convertToSpecifiedUnits(SVGLength.SVG_LENGTHTYPE_PX);
        element.cy.baseVal.convertToSpecifiedUnits(SVGLength.SVG_LENGTHTYPE_PX);
        element.r.baseVal.convertToSpecifiedUnits(SVGLength.SVG_LENGTHTYPE_PX);

        const cx = element.cx.baseVal.valueInSpecifiedUnits;
        const cy = element.cy.baseVal.valueInSpecifiedUnits;
        const r = element.r.baseVal.valueInSpecifiedUnits;

        this.drawCircle(cx, cy, r);
    }

    /**
     * Embeds the `SVGLineElement` into this node.
     *
     * @param element - The line element to draw.
     */
    embedLine(element: SVGLineElement): void
    {
        element.x1.baseVal.convertToSpecifiedUnits(SVGLength.SVG_LENGTHTYPE_PX);
        element.y1.baseVal.convertToSpecifiedUnits(SVGLength.SVG_LENGTHTYPE_PX);
        element.x2.baseVal.convertToSpecifiedUnits(SVGLength.SVG_LENGTHTYPE_PX);
        element.y2.baseVal.convertToSpecifiedUnits(SVGLength.SVG_LENGTHTYPE_PX);

        const x1 = element.x1.baseVal.valueInSpecifiedUnits;
        const y1 = element.y1.baseVal.valueInSpecifiedUnits;
        const x2 = element.x2.baseVal.valueInSpecifiedUnits;
        const y2 = element.y2.baseVal.valueInSpecifiedUnits;

        this.moveTo(x1, y1);
        this.lineTo(x2, y2);
    }

    /**
     * Embeds the `SVGRectElement` into this node.
     *
     * @param element - The rectangle element to draw.
     */
    embedRect(element: SVGRectElement): void
    {
        element.x.baseVal.convertToSpecifiedUnits(SVGLength.SVG_LENGTHTYPE_PX);
        element.y.baseVal.convertToSpecifiedUnits(SVGLength.SVG_LENGTHTYPE_PX);
        element.width.baseVal.convertToSpecifiedUnits(SVGLength.SVG_LENGTHTYPE_PX);
        element.height.baseVal.convertToSpecifiedUnits(SVGLength.SVG_LENGTHTYPE_PX);

        const x = element.x.baseVal.valueInSpecifiedUnits;
        const y = element.y.baseVal.valueInSpecifiedUnits;
        const width = element.width.baseVal.valueInSpecifiedUnits;
        const height = element.height.baseVal.valueInSpecifiedUnits;

        this.drawRect(x, y, width, height);
    }

    /**
     * Embeds the `SVGPolygonElement` element into this node.
     *
     * @param element - The polygon element to draw.
     */
    embedPolygon(element: SVGPolygonElement): void
    {
        const points = element.getAttribute('points')
            .split(/[ ,]/g)
            .map((p) => parseInt(p, 10));

        this.moveTo(points[0], points[1]);

        for (let i = 2; i < points.length; i += 2)
        {
            this.lineTo(points[i], points[i + 1]);
        }

        this.closePath();
    }

    /**
     * Embeds the `SVGPolylineElement` element into this node.
     *
     * @param element - The polyline element to draw.
     */
    embedPolyline(element: SVGPolylineElement): void
    {
        const points = element.getAttribute('points')
            .split(/[ ,]/g)
            .map((p) => parseInt(p, 10));

        this.drawPolygon(points);
    }

    /**
     * @override
     */
    render(renderer: Renderer): void
    {
        const paintServers = this.paintServers;

        // Ensure paint servers are updated
        for (let i = 0, j = paintServers.length; i < j; i++)
        {
            paintServers[i].resolvePaint(renderer);
        }

        super.render(renderer);
    }
}
