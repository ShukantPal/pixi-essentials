import { Point } from '@pixi/math';

/**
 * Calculates the distance of (x,y) from the line through l0 and l1.
 *
 * @ignore
 * @param h
 * @param k
 * @param l0
 * @param l1
 */
export function distanceToLine(h: number, k: number, l0: Point, l1: Point): number
{
    const { x: x0, y: y0 } = l0;
    const { x: x1, y: y1 } = l1;

    if (Math.abs(x1 - x0) < 0.01)
    {
        return Math.abs(h - x0);
    }
    if (Math.abs(y1 - y0) < 0.01)
    {
        return Math.abs(k - y0);
    }

    const m = (y1 - y0) / (x1 - x0);

    // Equation of line: mx - y - (y₁ - mx₁) = 0
    // Distance to line from (h,k): |(mh - k + (y₁ - mx₁)) / √(m²+1)|

    return Math.abs(((m * h) - k + (y1 - (m * x1))) / Math.sqrt((m * m) + 1));
}
