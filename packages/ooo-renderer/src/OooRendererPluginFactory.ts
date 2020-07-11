import { IOooRendererOptions, OooRenderer } from './OooRenderer';
import { Renderer } from 'pixi.js';

/**
 * Plugin factory for the out-of-order pipeline
 */
export class OooRendererPluginFactory
{
    static from(options: IOooRendererOptions): typeof OooRenderer
    {
        return class extends OooRenderer
        {
            constructor(renderer: Renderer)
            {
                super(renderer, options);
            }
        };
    }
}
