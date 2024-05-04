import { CanvasSource } from 'pixi.js';
import { TextureAllocator } from './TextureAllocator';

/**
 * This allocator issues texture backed by a canvas. You can draw on to that canvas to source
 * each texture.
 *
 * @public
 */
export class CanvasTextureAllocator extends TextureAllocator<CanvasSource>
{
    /**
     * Creates a texture slab backed by a canvas.
     */
    protected override createSlabSource(): CanvasSource
    {
        return new CanvasSource({
            height: this.slabHeight,
            width: this.slabWidth,
        });
    }
}
