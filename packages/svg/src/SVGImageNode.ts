import { Texture } from '@pixi/core';
import { Matrix } from '@pixi/math';
import { SVGGraphicsNode } from './SVGGraphicsNode';

const tempMatrix = new Matrix();

/**
 * Draws SVG &lt;image /&gt; elements.
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

        // Image frame
        const x = element.x.baseVal.valueInSpecifiedUnits;
        const y = element.y.baseVal.valueInSpecifiedUnits;
        const width = element.width.baseVal.valueInSpecifiedUnits;
        const height = element.height.baseVal.valueInSpecifiedUnits;

        // Calculate scale. If the <image /> element is scaled down, then the texture can be rendered at a lower
        // resolution to save graphics memory.
        const transform = element instanceof SVGGraphicsElement ? element.transform.baseVal.consolidate() : null;
        const transformMatrix = transform ? transform.matrix : tempMatrix.identity();
        const { a, b, c, d } = transformMatrix;
        const sx = Math.min(1, Math.sqrt((a * a) + (b * b)));
        const sy = Math.min(1, Math.sqrt((c * c) + (d * d)));

        this._canvas.width = Math.ceil(width * sx);
        this._canvas.height = Math.ceil(height * sy);

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
            this._context.drawImage(imageElement, 0, 0, width * sx, height * sy);
            this._texture.update();
        };

        // SVGImageElement does not support resolution, and so the texture must have resolution = 1.
        this._texture.baseTexture.setRealSize(width * sx, height * sy, 1);
        this._texture.update();

        this.beginTextureFill({ texture: this._texture, matrix: new Matrix().scale(1 / sx, 1 / sy) });
        this.drawRect(x, y, width, height);
        this.endFill();
    }
}
