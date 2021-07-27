import { AtlasResource } from './AtlasResource';
import { BaseTexture, Texture } from '@pixi/core';
import { GuilloteneAllocator } from '@pixi-essentials/area-allocator';
import { TextureAllocator } from './TextureAllocator';
import { TextureSlab } from './TextureSlab';

import type { AtlasResourceSource } from './AtlasResource';

/**
 * This texture allocator auto-manages the base-texture with an {@link AtlasResource}. You can also
 * pass a texture source to `allocate`, mimicing {@link Texture.from} functionality.
 * 
 * @public
 */
export class AtlasAllocator extends TextureAllocator
{
    /**
     * Creates a texture slab backed by an {@link AtlasResource}.
     */
    protected createSlab(): TextureSlab
    {
        return {
            managedArea: new GuilloteneAllocator(this.slabWidth, this.slabHeight),
            managedTextures: [],
            slab: new BaseTexture(new AtlasResource(this.slabWidth, this.slabHeight),
            {
                width: this.slabWidth,
                height: this.slabHeight,
            }),
        };
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
    allocate(width: number, height: number, padding?: number, source?: AtlasResourceSource): Texture;

    /**
     * Allocates a texture backed by the given source, with default padding.
     *
     * @param width
     * @param height 
     * @param source 
     */
    allocate(width: number, height: number, source?: AtlasResourceSource): Texture;

    allocate(width: number, height: number, paddingOrSource?: number | AtlasResourceSource, source?: AtlasResourceSource): Texture
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
            const atlas = texture.baseTexture.resource as AtlasResource;
            const item = {
                frame: texture.frame,
                source,
                dirtyId: source instanceof HTMLImageElement && source.loading ? -1 : 0,
                updateId: -1,
                texture,
            };

            atlas.managedItems.push(item);

            if (source instanceof HTMLImageElement && source.loading) {
                source.addEventListener('load', () => {
                    if (texture.baseTexture.valid && !texture.baseTexture.destroyed && atlas.managedItems.indexOf(item) >= 0) {
                        item.dirtyId++;
                        texture.baseTexture.update();
                    }
                });
            }

            texture.baseTexture.update();
        }

        return texture;
    }

    free(texture: Texture): void
    {
        super.free(texture);

        const atlas = texture.baseTexture.resource as AtlasResource;
        const item = atlas.managedItems.find(item => item.texture === texture);

        if (item)
        {
            atlas.managedItems.splice(atlas.managedItems.indexOf(item), 1);
        }
    }
}