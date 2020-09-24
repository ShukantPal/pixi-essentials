import { Sprite } from '@pixi/sprite';
import { Texture } from '@pixi/core';

export class SVGImageNode extends Sprite
{
    public canvas: HTMLCanvasElement;
    public context: CanvasRenderingContext2D;

    constructor()
    {
        // Do not allocate a Texture until drawImage is invoked.
        super(Texture.EMPTY);
    }

    drawSVGImageElement(element: SVGImageElement): void
    {
        if (!this.canvas)
        {
            this.canvas = document.createElement('canvas');
            this.context = this.canvas.getContext('2d');
            (this as Sprite).texture = Texture.from(this.canvas);
        }

        element.width.baseVal.convertToSpecifiedUnits(SVGLength.SVG_LENGTHTYPE_PX);
        element.height.baseVal.convertToSpecifiedUnits(SVGLength.SVG_LENGTHTYPE_PX);

        const width = element.width.baseVal.value;
        const height = element.height.baseVal.value;

        this.canvas.width = width;
        this.canvas.height = height;

        // SVGImageElement does not support resolution, and so the texture must have resolution = 1.
        (this as Sprite).texture.baseTexture.setRealSize(width, height, 1);
        (this as Sprite).texture.update();
    }
}
