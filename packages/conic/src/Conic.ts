import { Matrix, Point } from '@pixi/math';

const SQRT_2 = Math.sqrt(2);

/**
 * A linear function _ax + by + c_, where the coefficients _a, b, c_ are stored
 * in a 3-tuple.
 *
 * @public
 */
export type LinearFunctional = [number, number, number];

/**
 * Describes a conic section or any quadric curve
 *
 * A quadric curve can be represented in the form _k<sup>2</sup> - lm_, where, _k_, _l_, _m_
 * are linear functionals. _l_ and _m_ are two lines tangent to the curve, while _k_ is the
 * line connecting the two points of tangency.
 *
 * @public
 */
export class Conic
{
    public k: LinearFunctional;
    public l: LinearFunctional;
    public m: LinearFunctional;
    public controlPoints: [Point, Point, Point];

    public _dirtyID: number;

    constructor()
    {
        /**
         * The chord connecting the points of tangency on _l_ and _m_.
         */
        this.k = [1, 0, 0];

        /**
         * A line tangent to the curve.
         */
        this.l = [0, 1, 0];

        /**
         * A line tangent to the curve.
         */
        this.m = [0, 0, 1];

        /**
         * The control points in design space. The control points allow you to map design space points to the local space
         * points when creating a graphic.
         *
         * By default, the conic is a quadratic bezier curve.
         */
        this.controlPoints = [
            new Point(0, 0),
            new Point(0.5, 0),
            new Point(1, 1),
        ];

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
     * Set control points in texture space
     * @param c0
     * @param c1
     * @param c2
     */
    setControlPoints(c0: Point, c1: Point, c2: Point): void
    {
        this.controlPoints[0] = c0;
        this.controlPoints[1] = c1;
        this.controlPoints[2] = c2;
    }

    /**
     * Flag the shape as dirty after you have modified the data directly.
     */
    update(): this
    {
        this._dirtyID++;

        return this;
    }

    /**
     * Creates a circular conic of the given {@code radius} that is in the bounding box
     * (0,0,2_r_,2_r_).
     *
     * Implicit form:
     * (_x_/√2 + _y_/√2 - _r_/√2)<sup>2</sup> - _xy_ = _0_
     *
     * Simplified form:
     * (_x_ - _r_)<sup>2</sup> - (_y_ - _r_)<sup>2</sup> - r<sup>2</sup> = _0_
     *
     * @param radius - the radius of the circle
     * @return the conic shape
     */
    static createCircle(radius: number): Conic
    {
        const conic = new Conic();

        conic.setk(1 / SQRT_2, 1 / SQRT_2, -radius / SQRT_2);
        conic.setl(1, 0, 0);
        conic.setm(0, 1, 0);

        return conic;
    }

    /**
     * Creates an ellipse with the given major & minor semi-axes that is located in the
     * bounding box (0,0,2_a_,2_b_).
     *
     * Implicit form:
     * (_x_/_a_ + _y_/_b_ - 1)<sup>2</sup> - 2_xy_/_ab_ = 0
     *
     * Simplified form:
     * (_x_/_a_ - 1)<sup>2</sup> + (_y_/_b_ -  1)<sup>2</sup> - 1 = 0
     *
     * @param a - major semi-axis length
     * @param b - minor semi-axis length
     */
    static createEllipse(a: number, b: number): Conic
    {
        const conic = new Conic();

        conic.setk(1 / a, 1 / b, -1);
        conic.setl(2 / a, 0, 0);
        conic.setm(0, 1 / b, 0);

        return conic;
    }

    /**
     * Creates a parabola that opens upward (for _a_ > 0); since parabolas are not closed
     * curves, they do not have a bounding box.
     *
     * The standard bezier curve is the parabola _x_<sup>2</sup> - _y_, with the control
     * points (0,0), (1/2,0), (1,1).
     *
     * Equation:
     * x<sup>2 - 4_ay_ = 0
     *
     * @param a - distance of directrix, focus from the vertex of the parabola (0,0)
     */
    static createParabola(a: number): Conic
    {
        const conic = new Conic();

        conic.setk(1, 0, 0);
        conic.setl(0, 4 * a, 0);
        conic.setm(0, 0, 1);

        return conic;
    }

    /**
     * Creates a hyperbola that opens up and down; since hyperbolas are not closed curves,
     * they do not have a bounding box.
     *
     * Implicit form:
     * 1<sup>2</sup> - (_y_/_b_ - _x_/_a_)(_y_/_b_ + _x_/_a_) = 0
     *
     * Simplified form:
     * (y/b)<sup>2</sup> - (x/a)<sup>2</sup> = 1
     *
     * @param a - major semi-axis
     * @param b - minor semi-axis
     */
    static createHyperbola(a: number, b: number): Conic
    {
        const conic = new Conic();

        conic.setk(0, 0, 1);
        conic.setl(-1 / a, 1 / b, 0);
        conic.setm(1 / a, 1 / b, 0);

        return conic;
    }
}
