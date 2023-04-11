import { ALPHA_MODES } from '@pixi/constants';
import { BaseTexture, GLTexture, Resource, Renderer } from '@pixi/core';

import type { Rectangle } from '@pixi/math';
import type { Texture } from '@pixi/core';

/**
 * Types of image sources supported by {@link AtlasResource}.
 * 
 * @public
 */
export type AtlasResourceSource =  HTMLImageElement | HTMLCanvasElement | ImageBitmap | ImageData | ArrayBufferView;

/**
 * An item that is uploaded to the atlas texture.
 * 
 * @public
 */
export type AtlasResourceItem =
{
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
 * An {@code AtlasResource} is used by {@link AtlasAllocator} to manage texture sources
 * 
 * @public
 */
export class AtlasResource extends Resource
{
    /**
     * The list of managed resources in the atlas.
     */
    public managedItems: AtlasResourceItem[];

    /**
     * Creates an atlas resource.
     *
     * @param width 
     * @param height 
     */
    constructor(width: number, height: number)
    {
        super(width, height);

        this.managedItems = [];
    }

    /**
     * Uploads the atlas.
     *
     * @param renderer 
     * @param baseTexture 
     * @param glTexture 
     */
    upload(renderer: Renderer, baseTexture: BaseTexture, glTexture: GLTexture): boolean
    {
        const gl: WebGLRenderingContext = renderer.gl;
        const width = baseTexture.realWidth;
        const height = baseTexture.realHeight;

        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, baseTexture.alphaMode === ALPHA_MODES.UNPACK)

        // Allocate the texture on the GPU
        if (glTexture.width !== width ||
            glTexture.height !== height)
        {
            glTexture.width = width;
            glTexture.height = height;

            gl.texImage2D(
                baseTexture.target, 
                0, 
                baseTexture.format,
                width,
                height,
                0,
                baseTexture.format,
                baseTexture.type,
                undefined
            );
        }

        const items = this.managedItems;

        // Upload all atlas items.
        for (let i = 0, j = items.length; i < j; i++)
        {
            this.uploadItem(
                renderer,
                baseTexture.target,
                baseTexture.format,
                baseTexture.type,
                items[i]
            );
        }

        return true;
    }

    /**
     * Uploads the atlas item to the GPU.
     *
     * @param renderer - The renderer holding the WebGL context.
     * @param target - The binding point of the base-texture.
     * @param format - The format of the base-texture.
     * @param type - The type of the base-texture data.
     * @param item - The item to upload.
     */
    protected uploadItem(
        renderer: Renderer, 
        target: number,
        format: number,
        type: number,
        item: AtlasResourceItem
    ): void
    {
        if (item.updateId === item.dirtyId)
        {
            return;
        }

        const gl: WebGLRenderingContext = renderer.gl;
        const isWebGL2 = (gl instanceof WebGL2RenderingContext);
        const frame = item.frame;
        let source = item.source;

        // if WebGL1, convert whatever we have into a typed array
        if (!isWebGL2) {
            if (source instanceof ImageData) {
                source = source.data;  // pass the typed array directly

            } else if (source instanceof HTMLCanvasElement) {
                const ctx = source.getContext('2d');
                const [w, h] = [source.width, source.height];
                source = ctx.getImageData(0, 0, w, h).data;

            } else if (source instanceof HTMLImageElement) {
                const [w, h] = [source.naturalWidth, source.naturalHeight];
                const canvas = document.createElement('canvas');
                canvas.width = w;
                canvas.height = h;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(source, 0, 0);
                source = ctx.getImageData(0, 0, w, h).data;
            }
        }

        gl.texSubImage2D(
            target,
            0,
            frame.x,
            frame.y,
            frame.width,
            frame.height,
            format,
            type,
            source as any,
        );

        item.updateId = item.dirtyId;
    }
}