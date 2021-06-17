import { GuilloteneAllocator } from '@pixi-essentials/area-allocator';
import { BaseTexture } from '@pixi/core';
import { TextureAllocator } from './TextureAllocator';
import { TextureSlab } from './TextureSlab';

/**
 * This allocator issues texture backed by a canvas. You can draw on to that canvas to soruce
 * each texture.
 * 
 * @public
 */
export class CanvasTextureAllocator extends TextureAllocator
{
    /**
     * Creates a texture slab backed by a canvas.
     */
    protected createSlab(): TextureSlab
    {
        const canvas = document.createElement('canvas');

        canvas.width = this.slabWidth;
        canvas.height = this.slabHeight;

        return {
            managedArea: new GuilloteneAllocator(this.slabWidth, this.slabHeight),
            managedTextures: [],
            slab: new BaseTexture(canvas, {
                width: this.slabWidth,
                height: this.slabHeight
            })
        };
    }
}