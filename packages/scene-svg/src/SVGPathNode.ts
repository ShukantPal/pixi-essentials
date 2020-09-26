import { GRAPHICS_CURVES } from '@pixi/graphics';
import { EllipticArcUtils } from './utils/EllipticArcUtils';
import { Matrix } from '@pixi/math';
import { SVGGraphicsNode } from './SVGGraphicsNode';
import dPathParser from 'd-path-parser';

const tempMatrix = new Matrix();

const _segmentsCount: (length: number, defaultSegments?: number) => number 
    = (GRAPHICS_CURVES as any)._segmentsCount.bind(GRAPHICS_CURVES);

/**
 * Draws SVG &lt;path /&gt; elements.
 */
export class SVGPathNode extends SVGGraphicsNode
{
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
            ? _segmentsCount(EllipticArcUtils.calculateArcLength(rx, ry, startAngle, endAngle - startAngle))
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

    drawSVGPathElement(element: SVGPathElement): this
    {
        const d = element.getAttribute('d');

        // Parse path commands using d-path-parser. This is an inefficient solution that causes excess memory allocation
        // and should be optimized in the future.
        const commands = dPathParser(d.trim());

        let x = 0;
        let y = 0;

        for (let i = 0, j = commands.length; i < j; i++)
        {
            const command = commands[i];

            // Taken from: https://github.com/bigtimebuddy/pixi-svg/blob/main/src/SVG.js
            // Copyright Matt Karl
            switch (command.code)
            {
                case 'm': {
                    this.moveTo(
                        x += command.end.x,
                        y += command.end.y,
                    );
                    break;
                }
                case 'M': {
                    this.moveTo(
                        x = command.end.x,
                        y = command.end.y,
                    );
                    break;
                }
                case 'H': {
                    this.lineTo(x = command.value, y);
                    break;
                }
                case 'h': {
                    this.lineTo(x += command.value, y);
                    break;
                }
                case 'V': {
                    this.lineTo(x, y = command.value);
                    break;
                }
                case 'v': {
                    this.lineTo(x, y += command.value);
                    break;
                }
                case 'Z': {
                    this.closePath();
                    break;
                }
                case 'L': {
                    this.lineTo(
                        x = command.end.x,
                        y = command.end.y,
                    );
                    break;
                }
                case 'l': {
                    this.lineTo(
                        x += command.end.x,
                        y += command.end.y,
                    );
                    break;
                }
                case 'C': {
                    this.bezierCurveTo(
                        command.cp1.x,
                        command.cp1.y,
                        command.cp2.x,
                        command.cp2.y,
                        x = command.end.x,
                        y = command.end.y,
                    );
                    break;
                }
                case 'c': {
                    const currX = x;
                    const currY = y;

                    this.bezierCurveTo(
                        currX + command.cp1.x,
                        currY + command.cp1.y,
                        currX + command.cp2.x,
                        currY + command.cp2.y,
                        x += command.end.x,
                        y += command.end.y,
                    );
                    break;
                }
                case 's':
                case 'q': {
                    const currX = x;
                    const currY = y;

                    this.quadraticCurveTo(
                        currX + command.cp.x,
                        currY + command.cp.y,
                        x += command.end.x,
                        y += command.end.y,
                    );
                    break;
                }
                case 'S':
                case 'Q': {
                    this.quadraticCurveTo(
                        command.cp.x,
                        command.cp.y,
                        x = command.end.x,
                        y = command.end.y,
                    );
                    break;
                }
                case 'A':
                    this.ellipticArcTo(
                        x = command.end.x,
                        y = command.end.y,
                        command.radii.x,
                        command.radii.y,
                        (command.rotation || 0) * Math.PI / 180,
                        !command.clockwise,
                        command.large,
                    );
                    break;
                case 'a':
                    this.ellipticArcTo(
                        x += command.end.x,
                        y += command.end.y,
                        command.radii.x,
                        command.radii.y,
                        (command.rotation || 0) * Math.PI / 180,
                        !command.clockwise,
                        command.large,
                    );

                    break;
                default: {
                    // eslint-disable-next-line no-console
                    console.info('[PIXI.SVG] Draw command not supported:', command.code, command);
                    break;
                }
            }
        }

        return this;
    }
}
