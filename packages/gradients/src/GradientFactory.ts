import { Renderer, Texture } from 'pixi.js';

import type { ColorStop } from './ColorStop';

/**
 * Converts a hexadecimal color into a CSS color string.
 *
 * @ignore
 * @param color - The hexadecimal form of the color.
 */
function cssColor(color: number | string): string
{
    if (typeof color === 'string')
    {
        return color;
    }
    let string = color.toString(16);

    while (string.length < 6)
    {
        string = `0${string}`;
    }

    return `#${string}`;
}

/**
 * Factory class for generating color-gradient textures.
 *
 * @public
 */
export class GradientFactory
{
    /**
     * Renders a linear-gradient into `renderTexture` that starts from (x0, y0) and ends at (x1, y1). These
     * coordinates are defined in the **texture's space**.
     * That means only the frame (0, 0, `renderTexture.width`, `renderTexture.height` will be rendered.
     *
     * This method can be called inside a render cycle, and will preserve the renderer state.
     *
     * @param renderer - The renderer to use for drawing the gradient.
     * @param renderTexture - The texture to render the gradient into.
     * @param options - The gradient parameters.
     * @param options.x0 - The x-coordinate of the gradient's start point.
     * @param options.y0 - The y-coordinate of the gradient's start point.
     * @param options.x1 - The x-coordinate of the gradient's end point.
     * @param options.y1 - The y-coordinate of the gradient's end point.
     * @param options.colorStops - The color stops along the gradient pattern.
     * @todo This implementation is currently using the Canvas API (slow). It will be converted to a WebGL shader.
     */
    static createLinearGradient(
        renderer: Renderer,
        renderTexture: Texture,
        options: {
            x0: number;
            y0: number;
            x1: number;
            y1: number;
            colorStops: ColorStop[];
        },
    ): Texture
    {
        const { x0, y0, x1, y1, colorStops } = options;

        const canvas = document.createElement('canvas');

        canvas.width = renderTexture.width;
        canvas.height = renderTexture.height;

        const context = canvas.getContext('2d');

        const gradient = context.createLinearGradient(x0, y0, x1, y1);

        colorStops.forEach((stop) =>
        {
            gradient.addColorStop(stop.offset, cssColor(stop.color));
        });

        context.fillStyle = gradient;
        context.fillRect(0, 0, renderTexture.width, renderTexture.height);

        const renderTarget = renderer.renderTarget.getRenderTarget(canvas);

        renderer.renderTarget.copyToTexture(
            renderTarget,
            renderTexture,
            { x: 0, y: 0 },
            { width: renderTexture.width, height: renderTexture.height },
            { x: renderTexture.frame.x, y: renderTexture.frame.y }
        );
        renderTarget.destroy();

        return renderTexture;
    }

    /**
     * Renders a radial-gradient into `renderTexture` that starts at the circle centered at (x0, y0) of radius r0 and
     * ends at the circle centered at (x1, y1) of radius r1.
     *
     * This method can be called inside a render cycle, and will preserve the renderer state.
     *
     * @param renderer - The renderer to use for drawing the gradient.
     * @param renderTexture - The texture to render the gradient into.
     * @param options - The gradient parameters.
     * @param options.x0 - The x-coordinate of the starting circle's center.
     * @param options.y0 - The y-coordinate of the starting circle's center.
     * @param options.r0 - The radius of the starting circle.
     * @param options.x1 - The x-coordinate of the ending circle's center.
     * @param options.y1 - The y-coordinate of the ending circle's center.
     * @param options.colorStops - The color stops along the gradient pattern.
     * @todo This implementation is currently using the Canvas API (slow). It will be converted to a WebGL shader.
     */
    static createRadialGradient(
        renderer: Renderer,
        renderTexture: Texture,
        options: {
            x0: number;
            y0: number;
            r0: number;
            x1: number;
            y1: number;
            r1: number;
            colorStops: ColorStop[];
        },
    ): Texture
    {
        const { x0, y0, r0, x1, y1, r1, colorStops } = options;

        const canvas = document.createElement('canvas');

        canvas.width = renderTexture.width;
        canvas.height = renderTexture.height;

        const context = canvas.getContext('2d');

        const gradient = context.createRadialGradient(x0, y0, r0, x1, y1, r1);

        colorStops.forEach((stop) =>
        {
            gradient.addColorStop(stop.offset, cssColor(stop.color));
        });

        context.fillStyle = gradient;
        context.fillRect(0, 0, renderTexture.width, renderTexture.height);

        const renderTarget = renderer.renderTarget.getRenderTarget(canvas);

        renderer.renderTarget.copyToTexture(
            renderTarget,
            renderTexture,
            { x: 0, y: 0 },
            { width: renderTexture.width, height: renderTexture.height },
            { x: renderTexture.frame.x, y: renderTexture.frame.y });
        renderTarget.destroy();

        return renderTexture;
    }
}
