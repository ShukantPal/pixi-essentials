import * as PIXI from 'pixi.js';
import { SpatialHash } from 'pixi-spatial-hash';
import { BatchRenderer, IBatchRendererOptions } from 'pixi-batch-renderer';
import { BatchableEntity, entityPool } from './BatchableEntity';
import { IBatchHasher } from './IBatchHasher';
import { BatchBucket } from './BatchBucket';

/**
 * @public
 * @interface
 */
export interface IOooRendererOptions extends IBatchRendererOptions {
    batchHasher: IBatchHasher;
    hashCell?: number;
}

/**
 * The out-of-order renderer can efficiently batch display-objects using a spatial
 * hash to keep track of z-ordering.
 *
 * @namespace PIXI.ooo
 * @template <C extends PIXI.ooo.OooRenderClient>
 * @class
 * @augments PIXI.ObjectRenderer
 */
export class OooRenderer extends BatchRenderer
{
    protected _hasher: IBatchHasher;

    protected _spatialHash: SpatialHash<BatchableEntity>;
    protected _batchBuckets: Map<number, BatchBucket>;

    constructor(renderer: PIXI.Renderer, options: IOooRendererOptions)
    {
        super(renderer, options);

        /**
         * The batch-ID generator
         * @protected
         * @member {IBatchHasher}
         */
        this._hasher = options.batchHasher;

        /**
         * Spatial hash used to quickly find overlapping display-objects
         * @protected
         * @member {PIXI.SpatialHash}
         */
        this._spatialHash = new SpatialHash(options.hashCell || 256);
    }

    /**
     * @override
     * @param {PIXI.DisplayObject} displayObject
     */
    render(displayObject: PIXI.DisplayObject): void
    {
        // Instead of super.render(), we do this locally instead.
        this._bufferedVertices += this._vertexCountFor(displayObject);

        if (this._indexProperty)
        {
            this._bufferedIndices += (displayObject as any)[this._indexProperty]
                ? ((displayObject as any)[this._indexProperty] as Array<any>).length
                : (this._indexProperty as unknown) as number;
        }

        const entity: BatchableEntity = entityPool.allocate();
        const bounds = entity.displayObject.getBounds(true, entity.bounds);

        entity.reset();
        entity.displayObject = displayObject;

        const dependencies: BatchableEntity[] = Array.from(this._spatialHash.search(bounds));

        this._spatialHash.put(entity, bounds);

        const deps = dependencies;
        let depsMaxLayerID = -1;

        // Find the highest layerID overlapping with the display-object
        for (let i = 0, j = deps.length; i < j; i++)
        {
            if (depsMaxLayerID < deps[i].layerID)
            {
                depsMaxLayerID = deps[i].layerID;
            }
        }

        entity.layerID = depsMaxLayerID + 1;
        entity.batchID = this._hasher.batchID(displayObject);

        let bucket = this._batchBuckets.get(entity.batchID);

        if (!bucket)
        {
            bucket = new BatchBucket();
            this._batchBuckets.set(entity.batchID, bucket);
        }

        bucket.put(entity);
    }

    flush(): void
    {
        const { _batchFactory: batchFactory, _geometryFactory: geometryFactory, _stateFunction: stateFunction } = this;
    }
}
