import { Texture } from '@pixi/core';
import { LINE_CAP, LINE_JOIN } from '@pixi/graphics';
import { SVGRenderNode } from './SVGRenderNode';

import type { Matrix } from '@pixi/math';
import { DashedLineStyle } from './styles/DashedLineStyle';
import { SVGGraphicsGeometry } from './SVGGraphicsGeometry';

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

export class SVGGraphicsNode extends SVGRenderNode
{
    constructor()
    {
        super();

        (this as any)._geometry = new SVGGraphicsGeometry();
        (this as any)._geometry.refCount++;

        this._lineStyle = new DashedLineStyle();
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

    embedPolyline(element: SVGPolylineElement): void
    {
        const points = element.getAttribute('points')
            .split(/[ ,]/g)
            .map((p) => parseInt(p, 10));

        this.drawPolygon(points);
    }
}