import { Graphics } from '@pixi/graphics';

export class SVGGraphicsNode extends Graphics
{
    drawSVGCircleElement(element: SVGCircleElement): void
    {
        element.cx.baseVal.convertToSpecifiedUnits(SVGLength.SVG_LENGTHTYPE_PX);
        element.cy.baseVal.convertToSpecifiedUnits(SVGLength.SVG_LENGTHTYPE_PX);
        element.r.baseVal.convertToSpecifiedUnits(SVGLength.SVG_LENGTHTYPE_PX);

        const cx = element.cx.baseVal.value;
        const cy = element.cy.baseVal.value;
        const r = element.r.baseVal.value;

        this.drawCircle(cx, cy, r);
    }

    drawSVGRectElement(element: SVGRectElement): void
    {
        element.x.baseVal.convertToSpecifiedUnits(SVGLength.SVG_LENGTHTYPE_PX);
        element.y.baseVal.convertToSpecifiedUnits(SVGLength.SVG_LENGTHTYPE_PX);
        element.width.baseVal.convertToSpecifiedUnits(SVGLength.SVG_LENGTHTYPE_PX);
        element.height.baseVal.convertToSpecifiedUnits(SVGLength.SVG_LENGTHTYPE_PX);

        const x = element.x.baseVal.value;
        const y = element.y.baseVal.value;
        const width = element.width.baseVal.value;
        const height = element.height.baseVal.value;

        this.drawRect(x, y, width, height);
    }

    drawSVGPolygonElement(element: SVGPolygonElement): void
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

    drawSVGPolylineElement(element: SVGPolylineElement): void
    {
        const points = element.getAttribute('points')
            .split(/[ ,]/g)
            .map((p) => parseInt(p, 10));

        this.drawPolygon(points);
    }
}