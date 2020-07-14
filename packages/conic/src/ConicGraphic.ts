import { Conic, LinearFunctional } from './Conic';
import { Container } from '@pixi/display';
import { Matrix, Transform } from '@pixi/math';
import { Renderer, Texture } from '@pixi/core';
import { ConicRenderer } from './ConicRenderer';

const tempMatrix = new Matrix();

/**
 * Draws a segment of conic section represented by the equation _k_<sup>2</sup>- _lm = 0_, where k, l, m are lines.
 *
 * This display-object shades the inside/outside of a conic section within a mesh.
 *
 * A conic curve can be represented in the form: _k_<sup>2</sup> - _lm = 0_, where k, l, m are lines described in
 * the form _ax + by + c = 0_. _l_ and _m_ are the tangents to the curve, and _k_ is a chord connecting the points
 * of tangency.
 */
export class ConicGraphic extends Container
{
    public shape: Conic;

    // Container
    public transform: Transform;
    public worldTransform: Matrix;

    public worldPositionData: Array<number>;
    public texturePositionData: Array<number>;
    public indexData: Array<number>;

    protected _texture: Texture;
    protected _updateID: number;
    protected _transformID: number;
    protected _dirtyID: number;

    constructor(conic = new Conic())
    {
        super();

        /**
         * The conic curve drawn by this graphic.
         */
        this.shape = conic;

        /**
         * Flags whether the geometry data needs to be updated.
         */
        this._dirtyID = 0;

        /**
         * The world transform ID last when the geometry was updated.
         */
        this._transformID = 0;

        /**
         * Last {@link _dirtyID} when the geometry was updated.
         */
        this._updateID = -1;

        /**
         * World positions of the vertices
         */
        this.worldPositionData = [];

        /**
         * Texture positions of the vertices.
         */
        this.texturePositionData = [];

        this._texture = Texture.WHITE;
    }

    /**
     * @see Conic#k
     */
    get k(): [number, number, number]
    {
        return this.shape.k;
    }
    set k(line: [number, number, number])
    {
        this.shape.setk(...line);
    }

    /**
     * @see Conic#l
     */
    get l(): [number, number, number]
    {
        return this.shape.l;
    }
    set l(line: [number, number, number])
    {
        this.shape.setl(...line);
    }

    /**
     * @see Conic#m
     */
    get m(): [number, number, number]
    {
        return this.shape.m;
    }
    set m(line: [number, number, number])
    {
        this.shape.setm(...line);
    }

    _render(renderer: Renderer): void
    {
        if (!renderer.plugins.conicRenderer)
        {
            renderer.plugins.conicRenderer = new ConicRenderer(renderer, null);
        }

        renderer.batch.setObjectRenderer(renderer.plugins.conicRenderer);
        renderer.plugins.conicRenderer.render(this);
    }

    drawTriangle(x0: number, y0: number, x1: number, y1: number, x2: number, y2: number): void
    {
        const data = this.texturePositionData;
        const i = data.length;

        data.length += 6;
        data[i] = x0;
        data[i + 1] = y0;
        data[i + 2] = x1;
        data[i + 3] = y1;
        data[i + 4] = x2;
        data[i + 5] = y2;
    }

    /**
     * @param x
     * @param y
     * @param width
     * @param height
     */
    drawRect(x: number, y: number, width: number, height: number): void
    {
        const data = this.texturePositionData;
        const i = data.length;

        data.length += 12;
        data[i] = x;
        data[i + 1] = y;
        data[i + 2] = x + width;
        data[i + 3] = y;
        data[i + 4] = x + width;
        data[i + 5] = y + height;
        data[i + 6] = x;
        data[i + 7] = y;
        data[i + 8] = x + width;
        data[i + 9] = y + height;
        data[i + 10] = x;
        data[i + 11] = y + height;
    }

    /**
     * Updates the geometry data for this conic.
     */
    updateConic(): void
    {
        const worldPositionData = this.worldPositionData;
        const texturePositionData = this.texturePositionData;

        worldPositionData.length = texturePositionData.length;

        const matrix = tempMatrix.copyFrom(this.shape.textureTransform).prepend(this.worldTransform);
        const { a, b, c, d, tx, ty } = matrix;

        for (let i = 0, j = worldPositionData.length / 2; i < j; i++)
        {
            const x = texturePositionData[(i * 2)];
            const y = texturePositionData[(i * 2) + 1];

            worldPositionData[(i * 2)] = (a * x) + (c * y) + tx;
            worldPositionData[(i * 2) + 1] = (b * x) + (d * y) + ty;
        }

        this._updateID = this._dirtyID;

        const indexData = this.indexData = new Array(worldPositionData.length / 2);

        // TODO: Remove indexData, pixi-batch-renderer might have a problem with it
        for (let i = 0, j = indexData.length; i < j; i++)
        {
            indexData[i] = i;
        }
    }

    /**
     * Updates the transform of the conic, and if changed updates the geometry data.
     *
     * @override
     */
    updateTransform(): void
    {
        const ret = super.updateTransform();

        if (this._transformID !== this.transform._worldID)
        {
            this.updateConic();
            this._transformID = this.transform._worldID;
        }

        return ret;
    }
}
