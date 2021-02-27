export const PATH = 100;

export type Contour = Array<number>;

/**
 * The fill rules supported by {@link Path}.
 */
export enum FILL_RULE {
    NONZERO = 'nonzero',
    EVENODD = 'evenodd',
}

/**
 * Shape extension for Graphics
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

    /**
     * Initializes the path with zero contours and a non-zero fill rule.
     */
    constructor()
    {
        this.contours = [];
        this.fillRule = FILL_RULE.NONZERO;
        this.type = PATH;
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

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    contains(_x: number, _y: number): boolean
    {
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

    toString(): string
    {
        return `[@pixi-essentials/svg:Path Don't expect points to be printed :P]`;
    }
}