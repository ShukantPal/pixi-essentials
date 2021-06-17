import { BaseImageResource, Texture } from '@pixi/core';
import { Matrix } from '@pixi/math';
import { SVGGraphicsNode } from './SVGGraphicsNode';

const tempMatrix = new Matrix();

/**
 * Draws SVG &lt;image /&gt; elements.
 * 
 * @public
 */
export class SVGImageNode extends SVGGraphicsNode
{
    /**
     * The canvas used into which the `SVGImageElement` is drawn. This is because WebGL does not support
     * using `SVGImageElement` as an `ImageSource` for textures.
     */
    protected _canvas: HTMLCanvasElement;

    /**
     * The Canvas 2D context for `this._canvas`.
     */
    protected _context: CanvasRenderingContext2D;

    /**
     * A texture backed by `this._canvas`.
     */
    protected _texture: Texture;

    /**
     * Embeds the given SVG image element into this node.
     *
     * @param element - The SVG image element to embed.
     */
    embedImage(element: SVGImageElement): void
    {
        element.x.baseVal.convertToSpecifiedUnits(SVGLength.SVG_LENGTHTYPE_PX);
        element.y.baseVal.convertToSpecifiedUnits(SVGLength.SVG_LENGTHTYPE_PX);
        element.width.baseVal.convertToSpecifiedUnits(SVGLength.SVG_LENGTHTYPE_PX);
        element.height.baseVal.convertToSpecifiedUnits(SVGLength.SVG_LENGTHTYPE_PX);

        // Image frame
        const x = element.x.baseVal.valueInSpecifiedUnits;
        const y = element.y.baseVal.valueInSpecifiedUnits;
        const width = element.width.baseVal.valueInSpecifiedUnits;
        const height = element.height.baseVal.valueInSpecifiedUnits;
        const opacity = Number.parseFloat(element.getAttribute('opacity') || '1');

        // Calculate scale. If the <image /> element is scaled down, then the texture can be rendered at a lower
        // resolution to save graphics memory.
        const transform = element instanceof SVGGraphicsElement ? element.transform.baseVal.consolidate() : null;
        const transformMatrix = transform ? transform.matrix : tempMatrix.identity();
        const { a, b, c, d } = transformMatrix;
        const sx = Math.min(1, Math.sqrt((a * a) + (b * b)));
        const sy = Math.min(1, Math.sqrt((c * c) + (d * d)));
        const twidth = Math.ceil(width * sx);
        const theight = Math.ceil(height * sy);

        // Initialize the texture & canvas
        this.initTexture(twidth, theight);

        // Load the image element
        /* eslint-disable-next-line no-undef */
        const baseURL = globalThis?.location.href;
        const imageURL = element.getAttribute('href') || element.getAttribute('xlink:href');
        const imageOrigin = new URL(imageURL).origin;
        let imageElement: HTMLImageElement | SVGImageElement = element;

        if (imageOrigin && imageOrigin !== baseURL)
        {
            imageElement = document.createElement('img');
            imageElement.crossOrigin = 'anonymous';
            imageElement.src = imageURL;
        }

        // Draw the image when it loads
        imageElement.onload = (): void =>
        {
            this.drawTexture(imageElement);
        };

        // Generate the quad geometry
        this.beginTextureFill({
            texture: this._texture,
            alpha: opacity,
            matrix: new Matrix()
                .scale(1 / sx, 1 / sy),
        });
        this.drawRect(x, y, width, height);
        this.endFill();
    }

    /**
     * Initializes {@code this._texture} by allocating it from the atlas. It is expected the texture size requested
     * is less than the atlas's slab dimensions.
     *
     * @param width
     * @param height
     */
    private initTexture(width: number, height: number): void
    {
        // If the texture already exists, nothing much to do.
        if (this._texture)
        {
            if (this._texture.width <= this.context.atlas.maxWidth
                && this._texture.height <= this.context.atlas.maxHeight)
            {
                this.context.atlas.free(this._texture);
            }
            else
            {
                // TODO: This does destroy it, right?
                this._texture.destroy();
            }
        }

        this._texture = null;
        this._texture = this.context.atlas.allocate(width, height);

        if (this._texture)
        {
            this._canvas = (this._texture.baseTexture.resource as BaseImageResource).source as HTMLCanvasElement;
            this._context = this._canvas.getContext('2d');
        }
        else // Allocation fails if the texture is too large. If so, create a standalone texture.
        {
            this._canvas = document.createElement('canvas');

            this._canvas.width = width;
            this._canvas.height = height;

            this._context = this._canvas.getContext('2d');
            this._texture = Texture.from(this._canvas);
        }
    }

    /**
     * Draws the image into this node's texture.
     *
     * @param image - The image element holding the image.
     */
    private drawTexture(image: HTMLImageElement | SVGImageElement): void
    {
        const destinationFrame = this._texture.frame;

        this._context.clearRect(
            destinationFrame.x,
            destinationFrame.y,
            destinationFrame.width,
            destinationFrame.height,
        );

        this._context.drawImage(
            image,
            destinationFrame.x,
            destinationFrame.y,
            destinationFrame.width,
            destinationFrame.height,
        );

        this._texture.update();
    }
}
