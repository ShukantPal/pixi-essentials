import { SVGGraphicsNode } from './SVGGraphicsNode';
import dPathParser from 'd-path-parser';

/**
 * Draws SVG &lt;path /&gt; elements.
 */
export class SVGPathNode extends SVGGraphicsNode
{
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
                case 't':
                case 'T': {
                    let cx: number;
                    let cy: number;

                    if (lastCommand && lastCommand.cp)
                    {
                        cx = (2 * x) - lastCommand.cp.x;
                        cy = (2 * y) - lastCommand.cp.y;
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
                    // eslint-disable-next-line no-console
                    console.info('[PIXI.SVG] Draw command not supported:', command.code, command);
                    break;
                }
            }
        }

        return this;
    }
}
