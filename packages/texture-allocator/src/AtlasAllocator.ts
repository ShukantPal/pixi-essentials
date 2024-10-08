import { Texture } from 'pixi.js';
import { AtlasSource, optimizeAtlasUploads } from './AtlasSource';
import { TextureAllocator } from './TextureAllocator';

import type { Renderer } from 'pixi.js';
import type { AtlasItem, AtlasItemSource } from './AtlasSource';

/**
 * This texture allocator auto-manages the base-texture with an {@link AtlasSource}. You can also
 * pass a texture source to `allocate`, mimicing {@link Texture.from} functionality.
 *
 * @public
 */
export class AtlasAllocator extends TextureAllocator<AtlasSource>
{
    /**
     * Creates an atlas allocator.
     *
     * @param renderer - The renderer to register the atlas source uploader for. This is optional, but
     *  the atlas textures won't work without calling {@link optimizeAtlasUploads} on the renderer.
     * @param slabWidth
     * @param slabHeight
     */
    constructor(renderer: Renderer | null, slabWidth = 2048, slabHeight = 2048)
    {
        super(slabWidth, slabHeight);

        if (renderer)
        {
            optimizeAtlasUploads(renderer);
        }
    }

    /**
     * Creates a texture slab backed by an {@link AtlasSource}.
     */
    protected override createSlabSource(): AtlasSource
    {
        return new AtlasSource(this.slabWidth, this.slabHeight);
    }

    /**
     * Allocates a texture backed by the given atlas source, with the given padding.
     *
     * @override
     * @param width
     * @param height
     * @param padding
     * @param source
     */
    allocate(width: number, height: number, padding?: number, source?: AtlasItemSource): Texture;

    /**
     * Allocates a texture backed by the given source, with default padding.
     *
     * @param width
     * @param height
     * @param source
     */
    allocate(width: number, height: number, source?: AtlasItemSource): Texture;

    allocate(width: number, height: number, paddingOrSource?: number | AtlasItemSource, source?: AtlasItemSource): Texture
    {
        let padding: number;

        if (typeof paddingOrSource === 'number')
        {
            padding = paddingOrSource;
        }
        else
        {
            padding = this.calculatePadding(width, height);
            source = paddingOrSource;
        }

        const texture = super.allocate(width, height, padding);

        if (source)
        {
            const atlas = texture.source as AtlasSource;
            const item = {
                frame: texture.frame,
                source,
                // dirtyId !== updateId only if image loaded
                dirtyId: source instanceof HTMLImageElement && !source.complete ? -1 : 0,
                updateId: -1,
                texture,
            } satisfies AtlasItem;

            atlas.managedItems.push(item);

            if (source instanceof HTMLImageElement && !source.complete)
            {
                source.addEventListener('load', () =>
                {
                    if (!texture.source.destroyed && atlas.managedItems.indexOf(item) >= 0)
                    {
                        item.dirtyId++;
                        atlas.update();
                        texture.update();
                    }
                    else
                    {
                        console.warn('Image loaded after texture was destroyed');
                    }
                });
            }

            atlas.update();
        }

        return texture;
    }

    free(texture: Texture): void
    {
        super.free(texture);

        const atlas = texture.source as AtlasSource;
        const item = atlas.managedItems.find((item) => item.texture === texture);

        if (item)
        {
            atlas.managedItems.splice(atlas.managedItems.indexOf(item), 1);
        }
    }
}
