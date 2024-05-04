import { RenderTexture, TextureSource } from 'pixi.js';
import { TextureAllocator } from './TextureAllocator';

import type { Rectangle } from 'pixi.js';

/**
 * This allocator issues render-textures, and is otherwise just like {@link TextureAllocator}.
 *
 * @public
 */
export class RenderTextureAllocator extends TextureAllocator<TextureSource, RenderTexture>
{
    /**
     * Creates a texture slab backed by a base render-texture.
     */
    protected override createSlabSource(): TextureSource
    {
        return new TextureSource({
            height: this.slabHeight,
            width: this.slabWidth,
        });
    }

    /**
     * Creates a render-texture from the given base render-texture.
     *
     * @param source
     * @param frame
     */
    protected override createTexture(source: TextureSource, frame: Rectangle): RenderTexture
    {
        return new RenderTexture({
            frame,
            source,
        });
    }
}
