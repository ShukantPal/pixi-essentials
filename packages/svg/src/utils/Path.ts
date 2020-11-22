export const PATH = 100;

export type Contour = Array<number>;

export enum FILL_RULE {
    NONZERO = 'nonzero',
    EVENODD = 'evenodd',
}

/**
 * Shape extension for Graphics
 *
 * @ignore
 */
export class Path
{
    contours: Contour[];
    fillRule: FILL_RULE;
    type: number;

    constructor()
    {
        this.contours = [];
        this.fillRule = FILL_RULE.NONZERO;
        this.type = PATH;
    }

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

    clone(): Path
    {
        const contours = this.contours.map(c => [...c]);
        const path = new Path();

        path.contours = contours;

        return path;
    }

    closeContour(x = 0, y = 0): void
    {
        this.contours.push([x, y]);
    }

    toString(): string
    {
        return `[@pixi-essentials/svg:Path Don't expect points to be printed :P]`;
    }
}