import { BaseRenderTexture, RenderTexture } from '@pixi/core';
import { GuilloteneAllocator } from '@pixi-essentials/area-allocator';
import { TextureAllocator } from './TextureAllocator';

import type { BaseTexture } from '@pixi/core';
import type { Rectangle } from '@pixi/math';
import type { TextureSlab } from './TextureSlab';

/**
 * This allocator issues render-textures, and is otherwise just like {@link TextureAllocator}.
 * 
 * @public
 */
export class RenderTextureAllocator extends TextureAllocator<RenderTexture>
{
    /**
     * Creates a texture slab backed by a base render-texture.
     */
    protected createSlab(): TextureSlab
    {
        return {
            managedArea: new GuilloteneAllocator(this.slabWidth, this.slabHeight),
            managedTextures: [],
            slab: new BaseRenderTexture({
                width: this.slabWidth,
                height: this.slabHeight
            })
        };
    }

    /**
     * Creates a render-texture from the given base render-texture.
     *
     * @param baseTexture 
     * @param frame 
     */
    protected createTexture(baseTexture: BaseTexture, frame: Rectangle): RenderTexture
    {
        return new RenderTexture(baseTexture as BaseRenderTexture, frame);
    }
}