import { DisplayObject } from 'pixi.js';
import { ObjectRenderer } from 'pixi.js';
import { Renderer } from 'pixi.js';
import { SpatialHash } from 'pixi-spatial-hash';

/**
 * @public
 */
declare interface IOooRendererOptions {
    blockSize: number;
    pluginProvider: (displayObject: DisplayObject) => string;
}

/**
 * The out-of-order rendering pipeline
 *
 * @public
 */
export declare class OooRenderer extends ObjectRenderer {
    spatialHash: SpatialHash<DisplayObject>;
    pluginProvider: (displayObject: DisplayObject) => string;
    protected batchList: Array<{
        pluginName: string;
        displayObjects: Array<DisplayObject>;
    }>;
    constructor(renderer: Renderer, options?: Partial<IOooRendererOptions>);
    start(): void;
    /**
     * @override
     */
    render(displayObject: DisplayObject): void;
    /**
     * @override
     */
    flush(): void;
}

/**
 * Plugin factory for the out-of-order pipeline
 */
export declare class OooRendererPluginFactory {
    static from(options: IOooRendererOptions): typeof OooRenderer;
}

export { }
