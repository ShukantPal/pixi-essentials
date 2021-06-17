import { DashedLineStyle } from './style/DashedLineStyle';
import { EllipticArcUtils } from './utils/EllipticArcUtils';
import { Matrix } from '@pixi/math';
import { LINE_CAP, LINE_JOIN } from '@pixi/graphics';
import { GRAPHICS_CURVES, Graphics } from '@pixi/graphics';
import { SVGGraphicsGeometry } from './SVGGraphicsGeometry';
import { Texture } from '@pixi/core';

import type { PaintServer } from './paint/PaintServer';
import type { Renderer } from '@pixi/core';
import type { SVGSceneContext } from './SVGSceneContext';

/**
 * @public
 * @ignore
 */
export interface ILineStyleOptions {
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

const tempMatrix = new Matrix();

const _segmentsCount: (length: number, defaultSegments?: number) => number 
    = (GRAPHICS_CURVES as any)._segmentsCount.bind(GRAPHICS_CURVES);

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
 * 
 * @public
 */
export class SVGGraphicsNode extends Graphics
{
    paintServers: PaintServer[];

    protected context: SVGSceneContext;

    constructor(context: SVGSceneContext)
    {
        super();

        this.context = context;

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
     * Draws an elliptical arc.
     *
     * @param cx - The x-coordinate of the center of the ellipse.
     * @param cy - The y-coordinate of the center of the ellipse.
     * @param rx - The radius along the x-axis.
     * @param ry - The radius along the y-axis.
     * @param startAngle - The starting eccentric angle, in radians (0 is at the 3 o'clock position of the arc's circle).
     * @param endAngle - The ending eccentric angle, in radians.
     * @param xAxisRotation - The angle of the whole ellipse w.r.t. x-axis.
     * @param anticlockwise - Specifies whether the drawing should be counterclockwise or clockwise.
     * @return This Graphics object. Good for chaining method calls.
     */
    ellipticArc(
        cx: number,
        cy: number,
        rx: number,
        ry: number,
        startAngle: number,
        endAngle: number,
        xAxisRotation = 0,
        anticlockwise = false): this
    {
        const sweepAngle = endAngle - startAngle;
        const n = GRAPHICS_CURVES.adaptive
            ? _segmentsCount(EllipticArcUtils.calculateArcLength(rx, ry, startAngle, endAngle - startAngle)) * 4
            : 20;
        const delta = (anticlockwise ? -1 : 1) * Math.abs(sweepAngle) / (n - 1);

        tempMatrix.identity()
            .translate(-cx, -cy)
            .rotate(xAxisRotation)
            .translate(cx, cy);

        for (let i = 0; i < n; i++)
        {
            const eccentricAngle = startAngle + (i * delta);
            const xr = cx + (rx * Math.cos(eccentricAngle));
            const yr = cy + (ry * Math.sin(eccentricAngle));

            const { x, y } = xAxisRotation !== 0 ? tempMatrix.apply({ x: xr, y: yr }) : { x: xr, y: yr };

            if (i === 0)
            {
                this._initCurve(x, y);
                continue;
            }

            this.currentPath.points.push(x, y);
        }

        return this;
    }

    /**
     * Draws an elliptical arc to the specified point.
     *
     * If rx = 0 or ry = 0, then a line is drawn. If the radii provided are too small to draw the arc, then
     * they are scaled up appropriately.
     *
     * @param endX - the x-coordinate of the ending point.
     * @param endY - the y-coordinate of the ending point.
     * @param rx - The radius along the x-axis.
     * @param ry - The radius along the y-axis.
     * @param xAxisRotation - The angle of the ellipse as a whole w.r.t/ x-axis.
     * @param anticlockwise - Specifies whether the arc should be drawn counterclockwise or clockwise.
     * @param largeArc - Specifies whether the larger arc of two possible should be choosen.
     * @return This Graphics object. Good for chaining method calls.
     * @see https://svgwg.org/svg2-draft/paths.html#PathDataEllipticalArcCommands
     * @see https://www.w3.org/TR/SVG2/implnote.html#ArcImplementationNotes
     */
    ellipticArcTo(
        endX: number,
        endY: number,
        rx: number,
        ry: number,
        xAxisRotation = 0,
        anticlockwise = false,
        largeArc = false,
    ): this
    {
        if (rx === 0 || ry === 0)
        {
            return this.lineTo(endX, endY) as this;
        }

        // See https://www.w3.org/TR/SVG2/implnote.html#ArcImplementationNotes
        const points = this.currentPath.points;
        const startX = points[points.length - 2];
        const startY = points[points.length - 1];
        const midX = (startX + endX) / 2;
        const midY = (startY + endY) / 2;

        // Transform into a rotated frame with the origin at the midpoint.
        const matrix = tempMatrix
            .identity()
            .translate(-midX, -midY)
            .rotate(-xAxisRotation);
        const { x: xRotated, y: yRotated } = matrix.apply({ x: startX, y: startY });

        const a = Math.pow(xRotated / rx, 2) + Math.pow(yRotated / ry, 2);

        if (a > 1)
        {
            // Ensure radii are large enough to connect start to end point.
            rx = Math.sqrt(a) * rx;
            ry = Math.sqrt(a) * ry;
        }

        const rx2 = rx * rx;
        const ry2 = ry * ry;

        // Calculate the center of the ellipse in this rotated space.
        // See implementation notes for the equations: https://svgwg.org/svg2-draft/implnote.html#ArcImplementationNotes
        const sgn = (anticlockwise === largeArc) ? 1 : -1;
        const coef = sgn * Math.sqrt(
            // use Math.abs to prevent numerical imprecision from creating very small -ve
            // values (which should be zero instead). Otherwise, NaNs are possible
            Math.abs((rx2 * ry2) - (rx2 * yRotated * yRotated) - (ry2 * xRotated * xRotated))
            / ((rx2 * yRotated * yRotated) + (ry2 * xRotated * xRotated)),
        );
        const cxRotated = coef * (rx * yRotated / ry);
        const cyRotated = -coef * (ry * xRotated / rx);

        // Calculate the center of the ellipse back in local space.
        const { x: cx, y: cy } = matrix.applyInverse({ x: cxRotated, y: cyRotated });

        // Calculate startAngle
        const x1Norm = (xRotated - cxRotated) / rx;
        const y1Norm = (yRotated - cyRotated) / ry;
        const dist1Norm = Math.sqrt((x1Norm ** 2) + (y1Norm ** 2));
        const startAngle = (y1Norm >= 0 ? 1 : -1) * Math.acos(x1Norm / dist1Norm);

        // Calculate endAngle
        const x2Norm = (-xRotated - cxRotated) / rx;
        const y2Norm = (-yRotated - cyRotated) / ry;
        const dist2Norm = Math.sqrt((x2Norm ** 2) + (y2Norm ** 2));
        let endAngle = (y2Norm >= 0 ? 1 : -1) * Math.acos(x2Norm / dist2Norm);

        // Ensure endAngle is on the correct side of startAngle
        if (endAngle > startAngle && anticlockwise)
        {
            endAngle -= Math.PI * 2;
        }
        else if (startAngle > endAngle && !anticlockwise)
        {
            endAngle += Math.PI * 2;
        }

        // Draw the ellipse!
        this.ellipticArc(
            cx, cy,
            rx, ry,
            startAngle,
            endAngle,
            xAxisRotation,
            anticlockwise,
        );

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
     * Embeds the `SVGEllipseElement` into this node.
     *
     * @param element - The ellipse element to draw.
     */
    embedEllipse(element: SVGEllipseElement): void
    {
        element.cx.baseVal.convertToSpecifiedUnits(SVGLength.SVG_LENGTHTYPE_PX);
        element.cy.baseVal.convertToSpecifiedUnits(SVGLength.SVG_LENGTHTYPE_PX);
        element.rx.baseVal.convertToSpecifiedUnits(SVGLength.SVG_LENGTHTYPE_PX);
        element.ry.baseVal.convertToSpecifiedUnits(SVGLength.SVG_LENGTHTYPE_PX);

        const cx = element.cx.baseVal.valueInSpecifiedUnits;
        const cy = element.cy.baseVal.valueInSpecifiedUnits;
        const rx = element.rx.baseVal.valueInSpecifiedUnits;
        const ry = element.ry.baseVal.valueInSpecifiedUnits;

        this.ellipticArc(
            cx,
            cy,
            rx,
            ry,
            0,
            2 * Math.PI,
        );
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
        element.rx.baseVal.convertToSpecifiedUnits(SVGLength.SVG_LENGTHTYPE_PX);
        element.ry.baseVal.convertToSpecifiedUnits(SVGLength.SVG_LENGTHTYPE_PX);

        const x = element.x.baseVal.valueInSpecifiedUnits;
        const y = element.y.baseVal.valueInSpecifiedUnits;
        const width = element.width.baseVal.valueInSpecifiedUnits;
        const height = element.height.baseVal.valueInSpecifiedUnits;
        const rx = element.rx.baseVal.valueInSpecifiedUnits;
        const ry = element.ry.baseVal.valueInSpecifiedUnits || rx;

        if (rx === 0 || ry === 0)
        {
            this.drawRect(x, y, width, height);
        }
        else
        {
            this.moveTo(x, y + ry);
            this.ellipticArcTo(x + rx, y, rx, ry, 0, false, false);
            this.lineTo(x + width - rx, y);
            this.ellipticArcTo(x + width, y + ry, rx, ry, 0, false, false);
            this.lineTo(x + width, y + height - ry);
            this.ellipticArcTo(x + width - rx, y + height, rx, ry, 0, false, false);
            this.lineTo(x + rx, y + height);
            this.ellipticArcTo(x, y + height - ry, rx, ry, 0, false, false);
            this.closePath();
        }
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

        this.moveTo(points[0], points[1]);

        for (let i = 2; i < points.length; i += 2)
        {
            this.lineTo(points[i], points[i + 1]);
        }
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
