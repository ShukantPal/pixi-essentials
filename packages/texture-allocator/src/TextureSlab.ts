import type { AreaAllocator } from '@pixi-essentials/area-allocator';
import type { BaseTexture, Texture } from '@pixi/core';
import type { Rectangle } from '@pixi/math';

/**
 * An entry of an issued texture from a {@link TextureSlab}.
 * 
 * @public
 */
export type TextureEntry = 
{
    /**
     * The area returned by the area allocator, with the `__mem_area` key.
     */
    area: Rectangle;

    /**
     * The issued texture.
     */
    texture: Texture;
};

/**
 * A texture slab holds a managed base-texture that is used to issue allocated texture space. The
 * texture allocator maintains a pool of these texture slabs.
 * 
 * @public
 */
export type TextureSlab = 
{
    /**
     * The area allocator that issues texture space.
     */
    managedArea: AreaAllocator<any>;
    
    /**
     * The list of allocated textures and their area.
     */
    managedTextures: TextureEntry[];

    /**
     * The base-texture that holds all the issued textures.
     */
    slab: BaseTexture;
};