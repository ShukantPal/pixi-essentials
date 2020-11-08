import type { AreaAllocator } from '@pixi-essentials/area-allocator';
import { BaseTexture } from '@pixi/core';
import { GLTexture } from '@pixi/core';
import { Rectangle } from '@pixi/math';
import { Renderer } from '@pixi/core';
import { RenderTexture } from '@pixi/core';
import { resources } from '@pixi/core';
import { Texture } from '@pixi/core';

/**
 * This texture allocator auto-manages the base-texture with an {@link AtlasResource}. You can also
 * pass a texture source to `allocate`, mimicing {@link Texture.from} functionality.
 */
export declare class AtlasAllocator extends TextureAllocator {
    /**
     * Creates a texture slab backed by an {@link AtlasResource}.
     */
    protected createSlab(): TextureSlab;
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
    free(texture: Texture): void;
}

/**
 * An {@code AtlasResource} is used by {@link AtlasAllocator} to manage texture sources
 */
export declare class AtlasResource extends resources.Resource {
    /**
     * The list of managed resources in the atlas.
     */
    managedItems: AtlasResourceItem[];
    /**
     * Creates an atlas resource.
     *
     * @param width
     * @param height
     */
    constructor(width: number, height: number);
    /**
     * Uploads the atlas.
     *
     * @param renderer
     * @param baseTexture
     * @param glTexture
     */
    upload(renderer: Renderer, baseTexture: BaseTexture, glTexture: GLTexture): boolean;
    /**
     * Uploads the atlas item to the GPU.
     *
     * @param renderer - The renderer holding the WebGL context.
     * @param target - The binding point of the base-texture.
     * @param format - The format of the base-texture.
     * @param type - The type of the base-texture data.
     * @param item - The item to upload.
     */
    protected uploadItem(renderer: Renderer, target: number, format: number, type: number, item: AtlasResourceItem): void;
}

/**
 * An item that is uploaded to the atlas texture.
 */
export declare type AtlasResourceItem = {
    /**
     * The location of the atlas item in the base-texture's space.
     */
    frame: Rectangle;
    /**
     * The source of the texture data.
     */
    source: AtlasResourceSource;
    /**
     * This flags when the resource is to be re-uploaded.
     */
    dirtyId: number;
    /**
     * This flags when the resource is uploaded and update-to-date with the dirty ID.
     */
    updateId: number;
    /**
     * The texture holding this item.
     */
    texture: Texture;
};

/**
 * Types of image sources supported by {@link AtlasResource}.
 */
export declare type AtlasResourceSource = HTMLImageElement | HTMLCanvasElement | ImageBitmap | ImageData | ArrayBufferView;

/**
 * This allocator issues texture backed by a canvas. You can draw on to that canvas to soruce
 * each texture.
 */
export declare class CanvasTextureAllocator extends TextureAllocator {
    /**
     * Creates a texture slab backed by a canvas.
     */
    protected createSlab(): TextureSlab;
}

/**
 * This allocator issues render-textures, and is otherwise just like {@link TextureAllocator}.
 */
export declare class RenderTextureAllocator extends TextureAllocator<RenderTexture> {
    /**
     * Creates a texture slab backed by a base render-texture.
     */
    protected createSlab(): TextureSlab;
    /**
     * Creates a render-texture from the given base render-texture.
     *
     * @param baseTexture
     * @param frame
     */
    protected createTexture(baseTexture: BaseTexture, frame: Rectangle): RenderTexture;
}

/**
 * The texture allocator dynamically manages space on base-texture slabs. It can be used to generate
 * atlases on demand, which improve batching efficiency.
 */
export declare class TextureAllocator<T = Texture> {
    /**
     * The width of texture slabs.
     */
    readonly slabWidth: number;
    /**
     * The height of texture slabs.
     */
    readonly slabHeight: number;
    /**
     * The list of base-textures that are used to allocate texture space.
     */
    protected textureSlabs: TextureSlab[];
    /**
     * @param slabWidth - The width of base-texture slabs. This should be at most 2048.
     * @param slabHeight - The height of base-texture slabs. This should be at most 2048.
     */
    constructor(slabWidth: number, slabHeight?: number);
    /**
     * Allocates a texture from this allocator.
     *
     * If its existing slab pool has enough space, the texture is issued from one. Otherwise,
     * a new slab is created and the texture is issued from it. However, if the requested
     * dimensions are larger than slabs themselves, then `null` is always returned.
     *
     * To upload a texture source, you will have to create an atlas-managing {@link Resource}
     * yourself on the base-texture. The {@link AtlasAllocator} does this for you, while the
     * {@link CanvasTextureAllocator} can be used to draw on a canvas-based atlas.
     *
     * @param width - The width of the requested texture.
     * @param height - The height of the requested texture.
     * @param padding - The padding requested around the texture, to prevent bleeding.
     * @return The allocated texture, if successful; otherwise, `null`.
     */
    allocate(width: number, height: number, padding?: number): T;
    /**
     * Frees the texture and reclaims its space. It is assumed you will not use it again, and have
     * destroyed any resource uploading its data.
     *
     * @param texture
     * @throws When the texture was not located in this allocator.
     */
    free(texture: T): void;
    protected calculatePadding(width: number, height: number): number;
    /**
     * Creates a texture slab. The slab's base-texture is not backed by any resource. You
     * will have to manage that yourself. See {@link AtlasAllocator} or {@link CanvasTextureAllocator}
     * for better resource semantics.
     */
    protected createSlab(): TextureSlab;
    /**
     * Creates a texture on the given base-texture at {@code frame}.
     *
     * @param baseTexture - The base texture that will hold the texture's space.
     * @param frame - The frame in which the texture will be stored.
     */
    protected createTexture(baseTexture: BaseTexture, frame: Rectangle): T;
    /**
     * Issues a texture from the given texture slab, if possible.
     *
     * @param slab - The texture slab to allocate frame.
     * @param width - The width of the requested texture.
     * @param height - The height of the requested texture.
     * @param padding - Padding required around the texture.
     * @return The issued texture, if successful; otherwise, `null`.
     */
    protected issueTexture(slab: TextureSlab, width: number, height: number, padding?: number): Texture;
}

/**
 * An entry of an issued texture from a {@link TextureSlab}.
 */
export declare type TextureEntry = {
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
 */
export declare type TextureSlab = {
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

export { }
