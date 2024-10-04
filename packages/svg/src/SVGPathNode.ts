import { SVGGraphicsNode } from './SVGGraphicsNode';
import dPathParser from 'd-path-parser';
import { GraphicsPath, Point } from 'pixi.js';

const tempPoint = new Point();

/**
 * Draws SVG &lt;path /&gt; elements.
 *
 * @public
 */
export class SVGPathNode extends SVGGraphicsNode
{
    // Redirect moveTo, lineTo, ... onto paths!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! :P
    //startPoly = this.startPath;
    //finishPoly = this.finishPath;

    /**
     * Embeds the `SVGPathElement` into this node.
     *
     * @param element - the path to draw
     */
    embedPath(element: SVGPathElement): this
    {
        const d = element.getAttribute('d');

        // Parse path commands using d-path-parser. This is an inefficient solution that causes excess memory allocation
        // and should be optimized in the future.
        const commands = dPathParser(d.trim());

        // Current point
        let x = 0;
        let y = 0;

        for (let i = 0, j = commands.length; i < j; i++)
        {
            const lastCommand = commands[i - 1];
            const command = commands[i];

            if (isNaN(x) || isNaN(y))
            {
                throw new Error('Data corruption');
            }

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
                case 'z':
                case 'Z': {
                    // eslint-disable-next-line dot-notation
                    const activePath = this.context['_activePath'] as GraphicsPath;

                    activePath.getLastPoint(tempPoint);
                    x = tempPoint.x;
                    y = tempPoint.y;
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
                case 'S': {
                    const cp1 = { x, y };
                    const lastCode = commands[i - 1] ? commands[i - 1].code : null;

                    if (i > 0 && (lastCode === 's' || lastCode === 'S' || lastCode === 'c' || lastCode === 'C'))
                    {
                        const lastCommand = commands[i - 1];
                        const lastCp2 = { ...(lastCommand.cp2 || lastCommand.cp) };

                        if (commands[i - 1].relative)
                        {
                            lastCp2.x += (x - lastCommand.end.x);
                            lastCp2.y += (y - lastCommand.end.y);
                        }

                        cp1.x = (2 * x) - lastCp2.x;
                        cp1.y = (2 * y) - lastCp2.y;
                    }

                    const cp2 = { x: command.cp.x, y: command.cp.y };

                    if (command.relative)
                    {
                        cp2.x += x;
                        cp2.y += y;

                        x += command.end.x;
                        y += command.end.y;
                    }
                    else
                    {
                        x = command.end.x;
                        y = command.end.y;
                    }

                    this.bezierCurveTo(
                        cp1.x,
                        cp1.y,
                        cp2.x,
                        cp2.y,
                        x,
                        y,
                    );

                    break;
                }
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
                case 't':
                case 'T': {
                    let cx: number;
                    let cy: number;

                    if (lastCommand && lastCommand.cp)
                    {
                        let lcx = lastCommand.cp.x;
                        let lcy = lastCommand.cp.y;

                        if (lastCommand.relative)
                        {
                            const lx = x - lastCommand.end.x;
                            const ly = y - lastCommand.end.y;

                            lcx += lx;
                            lcy += ly;
                        }

                        cx = (2 * x) - lcx;
                        cy = (2 * y) - lcy;
                    }
                    else
                    {
                        cx = x;
                        cy = y;
                    }

                    if (command.code === 't')
                    {
                        this.quadraticCurveTo(
                            cx,
                            cy,
                            x += command.end.x,
                            y += command.end.y,
                        );
                    }
                    else
                    {
                        this.quadraticCurveTo(
                            cx,
                            cy,
                            x = command.end.x,
                            y = command.end.y,
                        );
                    }

                    break;
                }
                default: {
                    console.warn('[PIXI.SVG] Draw command not supported:', command.code, command);
                    break;
                }
            }
        }

        return this;
    }
}
