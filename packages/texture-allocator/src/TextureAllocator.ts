import { BaseTexture, Texture } from '@pixi/core';
import { GuilloteneAllocator } from '@pixi-essentials/area-allocator';
import { Rectangle } from '@pixi/math';

import type { TextureSlab } from './TextureSlab';

const tempRect = new Rectangle();

/**
 * The texture allocator dynamically manages space on base-texture slabs. It can be used to generate
 * atlases on demand, which improve batching efficiency.
 */
export class TextureAllocator<T = Texture>
{
    /**
     * The width of texture slabs.
     */
    public readonly slabWidth: number;

    /**
     * The height of texture slabs.
     */
    public readonly slabHeight: number;

    /**
     * The list of base-textures that are used to allocate texture space.
     */
    protected textureSlabs: TextureSlab[];

    /**
     * @param slabWidth - The width of base-texture slabs. This should be at most 2048.
     * @param slabHeight - The height of base-texture slabs. This should be at most 2048.
     */
    constructor(slabWidth = 2048, slabHeight = 2048)
    {
        this.slabWidth = slabWidth;
        this.slabHeight = slabHeight;

        this.textureSlabs = [];
    }

    get maxWidth() {
        return this.slabWidth - (2 * this.calculatePadding(this.slabWidth, this.slabHeight));
    }

    get maxHeight() {
        return this.slabHeight - (2 * this.calculatePadding(this.slabWidth, this.slabHeight));
    }

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
    allocate(width: number, height: number, padding = this.calculatePadding(width, height)): T
    {
        // Cannot allocate a texture larger than a texture-slab.
        if (width + 2 * padding > this.slabWidth || 
                height + 2 * padding > this.slabHeight)
        {
            return null;
        }

        const slabs = this.textureSlabs;

        // Loop through the slabs and find one with enough space, if any.
        for (let i = 0, j = slabs.length; i < j; i++)
        {
            const slab = slabs[i];
            const texture = this.issueTexture(slab, width, height, padding);

            if (texture)
            {
                return texture;
            }
        }

        // Issue a new slab.
        const slab = this.createSlab();

        // Append this slab to the head of the list.
        this.textureSlabs.unshift(slab);

        // Issue the texture from this blank slab.
        return this.issueTexture(slab, width, height, padding);
    }

    /**
     * Frees the texture and reclaims its space. It is assumed you will not use it again, and have
     * destroyed any resource uploading its data.
     *
     * @param texture 
     * @throws When the texture was not located in this allocator.
     */
    free(texture: T): void
    {
        const baseTexture = (texture as Texture).baseTexture;
        const slab = this.textureSlabs.find(sl => sl.slab === baseTexture);

        if (!slab)
        {
            throw new Error("The texture cannot be freed because " + 
                "its base-texture is not pooled by this allocator. " +
                "This is either a bug in TextureAllocator or you tried to free a " +
                "texture that was never allocated by one.");
        }

        const textureEntry = slab.managedTextures.find(entry => entry.texture === texture);

        if (!textureEntry)
        {
            throw new Error("The texture cannot be freed because it was not found " +
                "in the managed list of issued textures on its slab. This may be because you " +
                "duplicated this texture or a bug in TextureAllocator");
        }

        slab.managedArea.free(textureEntry.area);
        slab.managedTextures.splice(slab.managedTextures.indexOf(textureEntry), 1);
    }

    protected calculatePadding(width: number, height: number): number
    {
        const dimen = Math.max(width, height);

        if (dimen < 64)
        {
            return 2;
        }
        else if (dimen < 128)
        {
            return 4;
        }
        else if (dimen < 1024)
        {
            return 8;
        }
        else
        {
            return 16;
        }
    }

    /**
     * Creates a texture slab. The slab's base-texture is not backed by any resource. You
     * will have to manage that yourself. See {@link AtlasAllocator} or {@link CanvasTextureAllocator}
     * for better resource semantics.
     */
    protected createSlab(): TextureSlab
    {
        return {
            managedArea: new GuilloteneAllocator(this.slabWidth, this.slabHeight),
            managedTextures: [],
            slab: new BaseTexture(null,
            {
                width: this.slabWidth,
                height: this.slabHeight,
            }),
        };
    }

    /**
     * Creates a texture on the given base-texture at {@code frame}.
     *
     * @param baseTexture - The base texture that will hold the texture's space.
     * @param frame - The frame in which the texture will be stored.
     */
    protected createTexture(baseTexture: BaseTexture, frame: Rectangle): T
    {
        return new Texture(baseTexture, frame);
    }

    /**
     * Issues a texture from the given texture slab, if possible.
     *
     * @param slab - The texture slab to allocate frame.
     * @param width - The width of the requested texture.
     * @param height - The height of the requested texture.
     * @param padding - Padding required around the texture.
     * @return The issued texture, if successful; otherwise, `null`.
     */
    protected issueTexture(slab: TextureSlab, width: number, height: number, padding = 0): Texture
    {
        const area = slab.managedArea.allocate(width + 2 * padding, height + 2 * padding);

        if (!area)
        {
            return null;
        }

        tempRect.copyFrom(area);
        tempRect.pad(-padding);

        const baseTexture = slab.slab;
        const issuedTexture = this.createTexture(baseTexture, tempRect.clone());

        slab.managedTextures.push({
            area,
            texture: issuedTexture,
        });

        return issuedTexture;
    }
}