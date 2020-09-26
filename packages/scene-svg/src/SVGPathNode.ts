import { GRAPHICS_CURVES } from '@pixi/graphics';
import { Matrix } from '@pixi/math';
import { SVGGraphicsNode } from './SVGGraphicsNode';
import dPathParser from 'd-path-parser';

const tempMatrix = new Matrix();

export class SVGPathNode extends SVGGraphicsNode
{
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
        const sweep = endAngle - startAngle;
        const n = 20;

        const delta = (anticlockwise ? -1 : 1) * Math.abs(sweep) / (n - 1);

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
        // See https://www.w3.org/TR/SVG2/implnote.html#ArcImplementationNotes
        const points = this.currentPath.points;
        const startX = points[points.length - 2];
        const startY = points[points.length - 1];
        const midX = (startX + endX) / 2;
        const midY = (startY + endY) / 2;

        const matrix = tempMatrix
            .identity()
            .translate(-midX, -midY)
            .rotate(-xAxisRotation);
        const { x: xr, y: yr } = matrix.apply({ x: startX, y: startY });

        const a = Math.pow(xr / rx, 2) + Math.pow(yr / ry, 2);

        if (a > 1)
        {
            // Ensure radii are large enough to connect start to end point.
            rx = Math.sqrt(a) * rx;
            ry = Math.sqrt(a) * ry;
        }

        const sgn = (anticlockwise === largeArc) ? 1 : -1;
        const rx2 = rx * rx;
        const ry2 = ry * ry;
        const coef = sgn * Math.sqrt(
            // use Math.abs to prevent numerical imprecision from creating very small -ve
            // values (which should be zero instead). Otherwise, NaNs are possible
            Math.abs((rx2 * ry2) - (rx2 * yr * yr) - (ry2 * xr * xr))
            / ((rx2 * yr * yr) + (ry2 * xr * xr)),
        );
        const cxr = coef * (rx * yr / ry);
        const cyr = -coef * (ry * xr / rx);
        const { x: cx, y: cy } = matrix.applyInverse({ x: cxr, y: cyr });

        // Calculate startAngle, endAngle
        const xn1 = (xr - cxr) / rx;
        const yn1 = (yr - cyr) / ry;
        const nl = Math.sqrt((xn1 * xn1) + (yn1 * yn1));

        const startAngle = (yn1 >= 0 ? 1 : -1) * Math.acos(xn1 / nl);

        const xn2 = (-xr - cxr) / rx;
        const yn2 = (-yr - cyr) / ry;
        const n2l = Math.sqrt((xn2 * xn2) + (yn2 * yn2));

        let endAngle = (yn2 >= 0 ? 1 : -1) * Math.acos(xn2 / n2l);

        if (endAngle > startAngle && anticlockwise)
        {
            endAngle -= Math.PI * 2;
        }
        else if (startAngle > endAngle && !anticlockwise)
        {
            endAngle += Math.PI * 2;
        }

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