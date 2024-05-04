import { GlTextureSystem, Renderer, TextureSource } from 'pixi.js';

import type { GlTexture, GlRenderingContext, GLTextureUploader, GpuTextureUploader, GPU, Rectangle, Texture } from 'pixi.js';

/**
 * Types of image sources supported by {@link AtlasSource}.
 *
 * @public
 */
export type AtlasItemSource = HTMLImageElement | HTMLCanvasElement | ImageBitmap | ImageData | ArrayBufferView;

/**
 * An item that is uploaded to the atlas texture.
 *
 * @public
 */
export type AtlasItem =
{
    /**
     * The location of the atlas item in the base-texture's space.
     */
    frame: Rectangle;

    /**
     * The source of the texture data.
     */
    source: AtlasItemSource;

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
 * An {@code AtlasSource} is used by {@link AtlasAllocator} to manage texture sources.
 *
 * @public
 */
export class AtlasSource extends TextureSource
{
    /**
     * The list of managed texture sources in the atlas.
     */
    public managedItems: AtlasItem[];

    public uploadMethodId = 'atlas';

    /**
     * Creates an atlas resource.
     *
     * @param width
     * @param height
     */
    constructor(width: number, height: number)
    {
        super({
            width,
            height,
        });

        this.managedItems = [];
    }
}

let didWarnUnsupportedAtlasSource = false;

const glUploadAtlasResource = {
    id: 'atlas',
    upload(source: AtlasSource, glTexture: GlTexture, gl: GlRenderingContext, webGLVersion: number): void
    {
        const { width, height } = source;
        const premultipliedAlpha = source.alphaMode === 'premultiply-alpha-on-upload';

        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, premultipliedAlpha);

        // Allocate the texture on the GPU
        if (glTexture.width !== width || glTexture.height !== height)
        {
            glTexture.width = width;
            glTexture.height = height;

            gl.texImage2D(
                glTexture.target,
                0,
                glTexture.format,
                width,
                height,
                0,
                glTexture.format,
                glTexture.type,
                undefined,
            );
        }

        const items = source.managedItems;

        // Upload all atlas items.
        for (let i = 0, j = items.length; i < j; i++)
        {
            const item = items[i];

            if (item.updateId === item.dirtyId)
            {
                continue;
            }

            const frame = item.frame;
            let source = item.source;

            if (webGLVersion === 1)
            {
                if (source instanceof ImageData)
                {
                    source = source.data; // pass the typed array directly
                }
                else if (source instanceof HTMLCanvasElement)
                {
                    const ctx = source.getContext('2d');
                    const [w, h] = [source.width, source.height];

                    source = ctx.getImageData(0, 0, w, h).data;
                }
                else if (source instanceof HTMLImageElement)
                {
                    const [w, h] = [source.naturalWidth, source.naturalHeight];
                    const canvas = document.createElement('canvas');

                    canvas.width = w;
                    canvas.height = h;

                    const ctx = canvas.getContext('2d');

                    ctx.drawImage(source, 0, 0);
                    source = ctx.getImageData(0, 0, w, h).data;
                }
                else
                if (!didWarnUnsupportedAtlasSource)
                {
                    console.warn('Unsupported atlas source type. Failed to upload on WebGL 1', source);
                    didWarnUnsupportedAtlasSource = true;
                }
            }

            gl.texSubImage2D(
                glTexture.target,
                0,
                frame.x,
                frame.y,
                frame.width,
                frame.height,
                glTexture.format,
                glTexture.type,
                source as any,
            );

            item.updateId = item.dirtyId;
        }
    },
} satisfies GLTextureUploader;

const gpuUploadAtlasResource = {
    type: 'atlas',
    upload(source: AtlasSource, gpuTexture: GPUTexture, gpu: GPU): void
    {
        const premultipliedAlpha = source.alphaMode === 'premultiply-alpha-on-upload';

        for (const item of source.managedItems)
        {
            if (item.updateId === item.dirtyId)
            {
                continue;
            }

            gpu.device.queue.copyExternalImageToTexture(
                { source: item.source },
                {
                    texture: gpuTexture, premultipliedAlpha,
                    origin: {
                        x: item.frame.x,
                        y: item.frame.y,
                    },
                },
                {
                    height: item.frame.height,
                    width: item.frame.width,
                },
            );
        }
    },
} satisfies GpuTextureUploader<AtlasSource>;

/**
 * Registers the optimized atlas texture uploader for use in WebGL.
 *
 * @param renderer
 * @public
 */
export function optimizeAtlasUploads(renderer: Renderer): void
{
    if (renderer.texture instanceof GlTextureSystem)
    {
        // eslint-disable-next-line dot-notation
        renderer.texture['_uploads'].atlas = glUploadAtlasResource;
    }
    else
    {
        // eslint-disable-next-line dot-notation
        renderer.texture['_uploads'].atlas = gpuUploadAtlasResource;
    }
}
