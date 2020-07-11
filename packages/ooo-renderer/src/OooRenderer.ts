import { DisplayObject, Renderer, ObjectRenderer } from 'pixi.js';
import { SpatialHash } from 'pixi-spatial-hash';
import { OooElement } from './OooElement';
import { ObjectPoolFactory } from '@pixi-essentials/object-pool';

const elementPool = ObjectPoolFactory.build(OooElement as any);

/**
 * @public
 */
export interface IOooRendererOptions {
    blockSize: number;
    pluginProvider: (displayObject: DisplayObject) => string;
}

/**
 * The out-of-order rendering pipeline
 *
 * @public
 */
export class OooRenderer extends ObjectRenderer
{
    public spatialHash: SpatialHash<DisplayObject>;
    public pluginProvider: (displayObject: DisplayObject) => string;

    protected batchList: Array<{ pluginName: string; displayObjects: Array<DisplayObject> }>;

    constructor(renderer: Renderer, options: Partial<IOooRendererOptions> = {})
    {
        super(renderer);

        /**
         * 2D spatial hash of the buffered display-objects. This updated on each render call on this object-renderer.
         */
        this.spatialHash = new SpatialHash<DisplayObject>(options.blockSize || 256);

        /**
         * Provides the pipeline used to render an object. By default, the ooo-renderer will use the `pluginName` property
         * to determine the pipeline.
         */
        this.pluginProvider = options.pluginProvider || ((displayObject: any): string => displayObject.pluginName);

        /**
         * The list of batches created for the buffered objects
         */
        this.batchList = [];
    }

    start(): void
    {
        this.spatialHash.clear();
        this.batchList = [];
    }

    /**
     * @override
     */
    render(displayObject: DisplayObject): void
    {
        const element: OooElement = elementPool.allocate();
        const elementBounds = displayObject.getBounds(true);
        const zDependencies: Array<OooElement> = this.spatialHash.search(elementBounds);

        element.displayObject = displayObject;
        element.pluginName = this.pluginProvider(displayObject);
        element.zIndex = zDependencies.length
            ? zDependencies.reduce((maxIndex, zDep) => Math.max(maxIndex, zDep.zIndex), 0)
            : 0;
        element.zDependencies = zDependencies;

        this.spatialHash.put(element, elementBounds);

        // The minimum batch index needed to ensure this display-object is rendered after its z-dependencies. This
        // is always less than the length of the batchList.
        const minBatchIndex = zDependencies.length
            ? zDependencies.reduce((minBatchIndex, zDep) => Math.max(minBatchIndex, zDep.batchIndex), 0)
            : 0;

        // Search for a batch for this display-object after minBatchIndex
        for (let i = minBatchIndex, j = this.batchList.length; i < j; i++)
        {
            const batch = this.batchList[i];
            const pluginName = batch.pluginName;

            if (pluginName === element.pluginName)
            {
                batch.displayObjects.push(displayObject);

                return;
            }
        }

        const batch = {
            pluginName: element.pluginName,
            displayObjects: [displayObject],
        };

        this.batchList.push(batch);
    }

    /**
     * @override
     */
    flush(): void
    {
        const rendererPlugins = this.renderer.plugins;

        for (let i = 0, j = this.batchList.length; i < j; i++)
        {
            const batch = this.batchList[i];
            const displayObjects = batch.displayObjects;
            const pluginRenderer: ObjectRenderer = rendererPlugins[batch.pluginName];

            pluginRenderer.start();

            for (let u = 0, v = displayObjects.length; u < v; u++)
            {
                pluginRenderer.render(displayObjects[u]);
            }

            pluginRenderer.stop();
        }
    }
}
