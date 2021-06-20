import type { CanvasTextureAllocator } from '@pixi-essentials/texture-allocator';

/**
 * Options to manage the SVG scene
 * 
 * @public
 */
export interface SVGSceneContext
{
    /** The texture allocator for loading images. */
    atlas: CanvasTextureAllocator;

    /** Disable loading SVGs referenced from "href", "xlink:href" attributes of &lt;use /&gt; elements. */
    disableHrefSVGLoading: boolean;

    /** @ignore */
    disableRootPopulation: boolean;
}
