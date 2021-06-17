import { Rectangle } from '@pixi/math';
import { Sprite } from '@pixi/sprite';
import { l2rFilter } from './L2RFilter';

import type { Container, DisplayObject } from '@pixi/display';
import type { Renderer, RenderTexture } from '@pixi/core';

const tempSourceFrame = new Rectangle();
const tempDestinationFrame = new Rectangle();

/**
 * A sprite that does not render anything. It can be used as a mask whose bounds can be updated by adding it
 * as a child of the mask-target.
 *
 * @public
 * @see MaskServer.createMask
 * @ignore
 */
export class MaskSprite extends Sprite
{
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    render(_: Renderer): void
    {
        // NOTHING
    }
}

/**
 * A `MaskServer` will lazily render its content's luminance into its render-texture's alpha
 * channel using the luminance-alpha filter. The `dirtyId` flag can be used to make it re-render its
 * contents. It is intended to be used as a sprite-mask, where black pixels are invisible and white
 * pixels are visible (i.e. black pixels are filtered to alpha = 0, while white pixels are filtered
 * to alpha = 1. The rest are filtered to an alpha such that 0 < alpha < 1.). This is in compliance
 * with [CSS Masking Module Level 1](https://www.w3.org/TR/css-masking-1/#MaskElement).
 *
 * @public
 * @ignore
 */
export class MaskServer extends Sprite
{
    /**
     * Flags when re-renders are required due to content updates.
     */
    public dirtyId: number;

    /**
     * Flags when the content is re-rendered and should be equal to `this.dirtyId` when the texture
     * is update-to-date.
     */
    public updateId: number;

    /**
     * @param texture - The render-texture that will cache the contents.
     */
    constructor(texture: RenderTexture)
    {
        super(texture);

        this.dirtyId = 0;
        this.updateId = -1;
    }

    /**
     * @override
     */
    render(renderer: Renderer): void
    {
        if (this.dirtyId !== this.updateId)
        {
            // Update texture resolution, without changing screen-space resolution
            this.texture.baseTexture.setSize(this.texture.width, this.texture.height, renderer.resolution);

            renderer.batch.flush();

            const renderTarget = renderer.renderTexture.current;
            const sourceFrame = tempSourceFrame.copyFrom(renderer.renderTexture.sourceFrame);
            const destinationFrame = tempDestinationFrame.copyFrom(renderer.renderTexture.destinationFrame);

            const localBounds = (this as Sprite).getLocalBounds(null);
            const children: DisplayObject[] = this.children;

            renderer.renderTexture.bind(this.texture as RenderTexture, localBounds);
            renderer.renderTexture.clear();
            renderer.filter.push({ filterArea: localBounds, getBounds: () => localBounds }, [l2rFilter]);

            for (let i = 0, j = children.length; i < j; i++)
            {
                const child = children[i];

                child.enableTempParent();
                child.updateTransform();
                (children[i] as Container).render(renderer);
                child.disableTempParent(this);
            }

            renderer.batch.flush();
            renderer.filter.pop();

            renderer.renderTexture.bind(renderTarget, sourceFrame, destinationFrame);

            this.updateId = this.dirtyId;

            this.getBounds();
        }
    }

    /**
     * Create a mask that will overlay on top of the given display-object using the texture of this
     * mask server.
     *
     * @param displayObject - The mask target.
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    createMask(_: Container): MaskSprite
    {
        return new MaskSprite(this.texture);
    }
}
