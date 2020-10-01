import { Texture } from '@pixi/core';
import { Matrix } from '@pixi/math';
import { SVGGraphicsNode } from './SVGGraphicsNode';

/**
 * Draws SVG &lt;image /&gt; elements.
 */
export class SVGImageNode extends SVGGraphicsNode
{
    id = Math.random();
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

    embedImage(element: SVGImageElement): void
    {
        if (!this._canvas)
        {
            this._canvas = document.createElement('canvas');
            this._context = this._canvas.getContext('2d');
            this._texture = Texture.from(this._canvas);
        }

        element.x.baseVal.convertToSpecifiedUnits(SVGLength.SVG_LENGTHTYPE_PX);
        element.y.baseVal.convertToSpecifiedUnits(SVGLength.SVG_LENGTHTYPE_PX);
        element.width.baseVal.convertToSpecifiedUnits(SVGLength.SVG_LENGTHTYPE_PX);
        element.height.baseVal.convertToSpecifiedUnits(SVGLength.SVG_LENGTHTYPE_PX);

        const x = element.x.baseVal.valueInSpecifiedUnits;
        const y = element.y.baseVal.valueInSpecifiedUnits;
        const width = element.width.baseVal.valueInSpecifiedUnits;
        const height = element.height.baseVal.valueInSpecifiedUnits;

        this._canvas.width = width;
        this._canvas.height = height;

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

        // TODO: Handle previous image callback if this is being reused
        imageElement.onload = (): void =>
        {
            this._context.drawImage(imageElement, 0, 0, width, height);
            this._texture.update();
        };

        // SVGImageElement does not support resolution, and so the texture must have resolution = 1.
        this._texture.baseTexture.setRealSize(width, height, 1);
        this._texture.update();

        this.beginTextureFill({ texture: this._texture, matrix: new Matrix() });
        this.drawRect(x, y, width, height);
        this.endFill();
    }
}
