import { Bounds } from '@pixi/display';

/** @internal */
export const PATH = 100;

/**
 * @ignore
 * @public
 */
export type Contour = Array<number>;

/**
 * The fill rules supported by {@link Path}.
 * 
 * @public
 */
export enum FILL_RULE {
    NONZERO = 'nonzero',
    EVENODD = 'evenodd',
}

/**
 * Shape extension for Graphics
 * 
 * @public
 */
export class Path
{
    /**
     * The list of contours of this path, where a contour is a list of points.
     *
     * @member {Array.Array.<number>>}
     */
    contours: Contour[];

    /** The fill rule of this path. */
    fillRule: FILL_RULE;

    /** The type of shape. This is always equal to 100 for now. */
    type: number;

    /** Whether the calculated bounds are dirty. */
    protected dirty: boolean;

    /** The calculated bounds of this path. */
    protected bounds: Bounds = new Bounds();

    /**
     * Initializes the path with zero contours and a non-zero fill rule.
     */
    constructor()
    {
        this.contours = [];
        this.fillRule = FILL_RULE.NONZERO;
        this.type = PATH;
        this.dirty = true;
    }

    /**
     * Gets the points of the last contour in this path. If there are no contours, one is created.
     */
    get points(): number[]
    {
        if (!this.contours.length)
        {
            this.contours.push([]);
        }

        return this.contours[this.contours.length - 1];
    }

    /**
     * Calculates whether the point (x, y) is inside this path or not.
     *
     * @param x - The x-coordinate of the point.
     * @param y - The y-coordinate of the point.
     * @return Whether (x, y) is inside this path.
     */
    contains(x: number, y: number): boolean
    {
        if (this.dirty)
        {
            this.calculateBounds();
            this.dirty = false;
        }

        const bounds = this.bounds;

        if (x < bounds.minX || y < bounds.minY ||
            x > bounds.maxX || y > bounds.maxY)
        {
            return false;
        }

        if (this.fillRule === FILL_RULE.EVENODD)
        {
            return this.hitEvenOdd(x, y);
        }
        else if (this.fillRule === FILL_RULE.NONZERO)
        {
            return this.hitNonZero(x, y);
        }

        return false;
    }

    /**
     * Clone this path.
     */
    clone(): Path
    {
        const contours = this.contours.map((c) => [...c]);
        const path = new Path();

        path.contours = contours;
        path.fillRule = this.fillRule;

        return path;
    }

    /**
     * Closes the last contour of this path and pushes a new one.
     */
    closeContour(): void
    {
        if (this.points.length === 0)
        {
            return;
        }

        this.contours.push([]);
    }

    /**
     * This should be called when the path is updated so that the hit-testing bounds are recalculated.
     */
    invalidate(): void
    {
        this.dirty = true;
    }

    toString(): string
    {
        return `[@pixi-essentials/svg:Path Don't expect points to be printed :P]`;
    }

    /**
     * Recalculates the bounds of this path and sets {@link Path.bounds this.bounds}.
     */
    private calculateBounds()
    {
        const bounds = this.bounds

        let minX = Infinity;
        let minY = Infinity;
        let maxX = -Infinity;
        let maxY = -Infinity;

        for (const contour of this.contours)
        {
            for (let i = 0, j = contour.length; i < j;)
            {
                const x = contour[i++];
                const y = contour[i++];

                minX = x < minX ? x : minX;
                minY = y < minY ? y : minY;
                maxX = x > maxX ? x : maxX;
                maxY = y > maxY ? y : maxY;
            }
        }

        bounds.minX = minX;
        bounds.minY = minY;
        bounds.maxX = maxX;
        bounds.maxY = maxY;
    }
    
    /**
     * Hit-tests the point (x, y) based on the even-odd fill rule.
     * 
     * @see http://geomalgorithms.com/a03-_inclusion.html
     */
    private hitEvenOdd(x: number, y: number): boolean
    {
        // Here, we do we a ray tracing of a horizontally line extending from (x, y) infinitely towards the
        // right. The number of edges crossing this ray are counted.
        let crossingCount = 0;
        
        for (const contour of this.contours)
        {
            for (let i = 0, j = contour.length; i < j;)
            {
                const x0 = contour[i++];
                const y0 = contour[i++];
                const x1 = contour[i % contour.length];
                const y1 = contour[(i + 1) % contour.length];

                if ((y0 < y && y1 > y) ||  // Downward crossing
                    (y0 > y && y1 < y))    // Upward crossing
                {
                    // Calculate the x-coordinate of the point of intersection.
                    const it = (y - y0) / (y1 - y0);
                    const ix = x0 + it * (x1  - x0);

                    if (x < ix)
                    {
                        ++crossingCount;
                    }
                }
            }
        }

        return !!(crossingCount % 2);
    }

    /**
     * Hit-tests the point (x, y) based on non-zero fill rule.
     *
     * @see http://geomalgorithms.com/a03-_inclusion.html
     */
    private hitNonZero(x: number, y: number)
    {
        // Calculate the winding number of (x, y) by finding the net number of edges that cross the horizontal ray
        // from (x, y) upwards minus downwards.
        let windingNumber = 0;

        for (const contour of this.contours)
        {
            for (let i = 0, j = contour.length; i < j;)
            {
                const x0 = contour[i++];
                const y0 = contour[i++];
                const x1 = contour[i % contour.length];
                const y1 = contour[(i + 1) % contour.length];

                if (y0 <= y)
                {
                    if (y1 > y &&   // Cross downward
                        calculateSide(
                            x, y,
                            x0, y0,
                            x1, y1
                        ) > 0)      // (x, y) left of edge
                    {
                        ++windingNumber;
                    }
                }
                else if (y1 <= y)    // Cross upward
                {
                    if (calculateSide(
                        x, y,
                        x0, y0,
                        x1, y1
                    ) < 0)           // (x, y) right of edge
                    {
                        --windingNumber;
                    }                   
                }
            }
        }

        // Winding number will be zero for points outside the shape.
        return windingNumber !== 0;
    }
}

/**
 * Calculates whether (x, y) is left, on, or right of the line extending through (x0, y0) and (x1, y1).
 *
 * @ignore
 * @return > 0 if on on left side, = 0 if on line, < 0 if on right side
 */
function calculateSide(x: number, y: number, x0: number, y0: number, x1: number, y1: number)
{
    // Basically calculate the area of the triangle (x0, y0), (x1, y1), (x, y), with vertices
    // in that order. If counterlockwise, then the area is positive - then (x, y) is on left;

    return (x1 - x0) * (y - y0) -  (x - x0) * (y1 - y0);
}