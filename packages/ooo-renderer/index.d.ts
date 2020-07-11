import { DisplayObject } from 'pixi.js';
import { ObjectRenderer } from 'pixi.js';
import { Renderer } from 'pixi.js';
import { SpatialHash } from 'pixi-spatial-hash';

declare interface IOooRendererOptions {
    blockSize: number;
    pluginProvider: (displayObject: DisplayObject) => string;
}

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

export { }
