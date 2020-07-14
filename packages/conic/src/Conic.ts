import { Matrix, Point } from '@pixi/math';
import mat3 from 'gl-mat3';

/**
 * A linear function _ax + by + c_, where the coefficients _a, b, c_ are stored
 * in a 3-tuple.
 *
 * @public
 */
export type LinearFunctional = [number, number, number];

/**
 * Describes a conic section
 *
 * A quadric curve can be represented in the form _k<sup>2</sup> - lm_, where, _k_, _l_, _m_
 * are linear functionals. _l_ and _m_ are two lines tangent to the curve, while _k_ is the
 * line connecting the two points of tangency.
 *
 * The curve equation is defined in "design space", and is transformed into texture space using
 * the {@link textureTransform}.
 *
 * @public
 */
export class Conic
{
    public k: LinearFunctional;
    public l: LinearFunctional;
    public m: LinearFunctional;
    public textureTransform: Matrix;

    public _dirtyID: number;

    constructor()
    {
        /**
         * The chord connecting the points of tangency on _l_ and _m_.
         */
        this.k = [0, 1, -1];

        /**
         * A line tangent to the curve.
         */
        this.l = [2, -1, -1];

        /**
         * A line tangent to the curve.
         */
        this.m = [-2, -1, -1];

        /**
         * The transformation matrix from design space to texture space.
         */
        this.textureTransform = new Matrix();

        /**
         * Flags changes in the shape data
         */
        this._dirtyID = 0;
    }

    /**
     * Sets the equation of the "k" line to _ax + by + c = 0_.
     *
     * @param a
     * @param b
     * @param c
     */
    setk(a: number, b: number, c: number): this
    {
        this.k[0] = a;
        this.k[1] = b;
        this.k[2] = c;

        this._dirtyID++;

        return this;
    }

    /**
     * Sets the equation of the "l" line to _ax + by + c = 0_.
     *
     * @param a
     * @param b
     * @param c
     */
    setl(a: number, b: number, c: number): this
    {
        this.l[0] = a;
        this.l[1] = b;
        this.l[2] = c;

        this._dirtyID++;

        return this;
    }

    /**
     * Sets the equation of the line "m" to _ax + by + c = 0_.
     *
     * @param a
     * @param b
     * @param c
     */
    setm(a: number, b: number, c: number): this
    {
        this.m[0] = a;
        this.m[1] = b;
        this.m[2] = c;

        this._dirtyID++;

        return this;
    }

    /**
     * Set the transform of the conic
     *
     * @param matrix - transformation between design space and texture space
     */
    setTransform(matrix: Matrix): this;

    /**
     * Set the transformation by defining a triangle in design space _(a0, b0, c0)_ mapping to
     * the triangle _(a1, b1, c1)_ in texture space.
     *
     * @param a0
     * @param b0
     * @param c0
     * @param a1
     * @param b1
     * @param c1
     */
    setTransform(a0: Point, b0: Point, c0: Point, a1: Point, b1: Point, c1: Point): this;

    /**
     * Set the transformation by defining the triangle in design space _(ax0, ay0), (bx0, by0), (cx0, cy0)_
     * mapping to the triangle _(ax1, ay1), (bx1, by1), (cx1, cy1)_ in texture space.
     *
     * @param ax0
     * @param ay0
     * @param bx0
     * @param by0
     * @param cx0
     * @param cy0
     * @param ax1
     * @param ay1
     * @param bx1
     * @param by1
     * @param cx1
     * @param cy1
     */
    setTransform(ax0: number, ay0: number, bx0: number, by0: number, cx0: number, cy0: number,
        ax1: number, ay1: number, bx1: number, by1: number, cx1: number, cy1: number): this;

    setTransform(...args: any): this
    {
        if (args.length === 1)
        {
            this.textureTransform.copyFrom(args[0]);

            return this;
        }

        this.textureTransform.identity();

        // Design space
        let ax0: number;
        let ay0: number;
        let bx0: number;
        let by0: number;
        let cx0: number;
        let cy0: number;

        // Texture space
        let ax1: number;
        let ay1: number;
        let bx1: number;
        let by1: number;
        let cx1: number;
        let cy1: number;

        if (args.length === 6)
        {
            const points = args as Point[];

            ax0 = points[0].x;
            ay0 = points[0].y;
            bx0 = points[1].x;
            by0 = points[1].y;
            cx0 = points[2].x;
            cy0 = points[2].y;

            ax1 = points[3].x;
            ay1 = points[3].y;
            bx1 = points[4].x;
            by1 = points[4].y;
            cx1 = points[5].x;
            cy1 = points[5].y;
        }
        else
        {
            const coords = args as number[];

            ax0 = coords[0];
            ay0 = coords[1];
            bx0 = coords[2];
            by0 = coords[3];
            cx0 = coords[4];
            cy0 = coords[5];

            ax1 = coords[6];
            ay1 = coords[7];
            bx1 = coords[8];
            by1 = coords[9];
            cx1 = coords[10];
            cy1 = coords[11];
        }

        const input = [
            ax0, bx0, cx0,
            ay0, by0, cy0,
            1, 1, 1,
        ];
        const inverse = mat3.invert(input, input);

        // input * textureTransform = output
        // textureTransform = inverse(input) * output
        this.textureTransform.a = (inverse[0] * ax1) + (inverse[3] * bx1) + (inverse[6] * cx1);
        this.textureTransform.c = (inverse[1] * ax1) + (inverse[4] * bx1) + (inverse[7] * cx1);
        this.textureTransform.tx = (inverse[2] * ax1) + (inverse[5] * bx1) + (inverse[8] * cx1);

        this.textureTransform.b = (inverse[0] * ay1) + (inverse[3] * by1) + (inverse[6] * cy1);
        this.textureTransform.d = (inverse[1] * ay1) + (inverse[4] * by1) + (inverse[7] * cy1);
        this.textureTransform.ty = (inverse[2] * ay1) + (inverse[5] * by1) + (inverse[8] * cy1);

        return this;
    }

    /**
     * Flag the shape as dirty after you have modified the data directly.
     */
    update(): this
    {
        this._dirtyID++;

        return this;
    }
}
