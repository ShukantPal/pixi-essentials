import { NODE_TRANSFORM_DIRTY } from './const';
import { Sprite } from '@pixi/sprite';
import { Texture } from '@pixi/core';
import { TextMetrics, TextStyle } from '@pixi/text';

import type { IPointData, Matrix } from '@pixi/math';
import type { Renderer } from '@pixi/core';
import type { SVGTextEngine } from './SVGTextEngine';

/**
 * `SVGTextEngineImpl` is the default implementation for {@link SVGTextEngine}. It is inspired by {@link PIXI.Text} that
 * is provided by @pixi/text. It uses a &lt;canvas /&gt; to draw and cache the text. This may cause blurring issues when
 * the SVG is viewed at highly zoomed-in scales because it is rasterized.
 *
 * @public
 */
export class SVGTextEngineImpl extends Sprite implements SVGTextEngine
{
    protected canvas: HTMLCanvasElement;
    protected context: CanvasRenderingContext2D;
    protected contentList: Map<any, {
        position: IPointData;
        content: string;
        style: Partial<TextStyle>;
        matrix?: Matrix;
    }>;

    protected dirtyId: number;
    protected updateId: number;

    constructor()
    {
        super(Texture.EMPTY);

        this.canvas = document.createElement('canvas');
        this.context = this.canvas.getContext('2d');
        this.texture = Texture.from(this.canvas);

        this.contentList = new Map();

        this.dirtyId = 0;
        this.updateId = 0;
    }

    async clear(): Promise<void>
    {
        this.contentList.clear();
        this.dirtyId++;
        this.position.set(0, 0);
    }

    async put(
        id: any,
        position: IPointData,
        content: string,
        style: Partial<TextStyle>,
        matrix?: Matrix,
    ): Promise<IPointData>
    {
        this.contentList.set(id, {
            position,
            content,
            style,
            matrix,
        });

        const textMetrics = TextMetrics.measureText(content, new TextStyle(style), false, this.canvas);

        this.dirtyId++;

        return {
            x: position.x + textMetrics.width,
            y: position.y,
        };
    }

    updateText(): void
    {
        let w = 0;
        let h = 0;

        this.contentList.forEach(({ position, content, style }) =>
        {
            const textMetrics = TextMetrics.measureText(content, new TextStyle(style), false, this.canvas);

            w = Math.max(w, position.x + textMetrics.width);
            h = Math.max(h, position.y + textMetrics.height + textMetrics.fontProperties.descent);
        });

        const resolution = window.devicePixelRatio || 1;

        this.canvas.width = w * resolution;
        this.canvas.height = h * resolution;
        this.texture.baseTexture.setRealSize(w, h, resolution);
        this.texture.update();

        this.context.clearRect(0, 0, w * resolution, h * resolution);
        this.context.setTransform(1, 0, 0, 1, 0, 0);
        this.context.scale(resolution, resolution);

        let i = 0;

        for (const [_, { position, content, style }] of this.contentList)
        {
            const textMetrics = TextMetrics.measureText(content, new TextStyle(style), false, this.canvas);
            const textStyle = new TextStyle(style);

            this.context.fillStyle = typeof textStyle.fill === 'string' ? textStyle.fill : 'black';
            this.context.font = textStyle.toFontString();

            this.context.fillText(content, position.x, position.y + textMetrics.height);

            if (i === 0)
            {
                this.y -= textMetrics.height;
            }

            i++;
        }

        this.updateId = this.dirtyId;

        // Ensure the SVG scene updates its bounds after the text is rendered.
        this.emit(NODE_TRANSFORM_DIRTY);
     }

    render(renderer: Renderer): void
    {
        if (this.updateId !== this.dirtyId)
        {
            this.updateText();
            this.updateTransform();
        }

        super.render(renderer);
    }
}
