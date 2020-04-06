import * as PIXI from 'pixi.js';
import { OooRenderClient } from './OooMixin';
import { SpatialHash } from 'pixi-spatial-hash';

/**
 * The out-of-order renderer can efficiently batch display-objects using a spatial
 * hash to keep track of z-ordering.
 *
 * @namespace PIXI.ooo
 * @template <C extends PIXI.ooo.OooRenderClient>
 * @class
 * @augments PIXI.ObjectRenderer
 */
export class OooRenderer<C extends OooRenderClient> extends PIXI.ObjectRenderer
{
    protected _bufferedObjects: SpatialHash<C>;

    constructor(renderer: PIXI.Renderer)
    {
        super(renderer);

        /**
         * @protected
         * @member {PIXI.SpatialHash<C>}
         */
        this._bufferedObjects = new SpatialHash<C>();
    }
}
