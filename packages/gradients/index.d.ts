import type { Renderer } from '@pixi/core';
import { RenderTexture } from '@pixi/core';

/**
 * Color stop used to generate gradients
 */
export declare interface ColorStop {
    color: number;
    offset: number;
}

/**
 * Factory class for generating color-gradient textures.
 */
export declare class GradientFactory {
    /**
     * Renders a linear-gradient into `renderTexture` that starts from (x0, y0) and ends at (x1, y1). These
     * coordinates are defined in the **texture's space**. That means only the frame (0, 0, `renderTexture.width`, `renderTexture.height`)
     * will be rendered.
     *
     * This method can be called inside a render cycle, and will preserve the renderer state. However, the current implementation
     * causes a batch renderer flush.
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
     * @todo This implementation causes a batch renderer flush. This will be optimized in a future release.
     */
    static createLinearGradient(renderer: Renderer, renderTexture: RenderTexture, options: {
        x0: number;
        y0: number;
        x1: number;
        y1: number;
        colorStops: ColorStop[];
    }): RenderTexture;
    /**
     * Renders a radial-gradient into `renderTexture` that starts at the circle centered at (x0, y0) of radius r0 and
     * ends at the circle centered at (x1, y1) of radius r1.
     *
     * This method can be called inside a render cycle, and will preserve the renderer state. However, the current implementation
     * causes a batch renderer flush.
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
     * @todo This implementation causes a batch renderer flush. This will be optimized in a future release.
     */
    static createRadialGradient(renderer: Renderer, renderTexture: RenderTexture, options: {
        x0: number;
        y0: number;
        r0: number;
        x1: number;
        y1: number;
        r1: number;
        colorStops: ColorStop[];
    }): RenderTexture;
}

export { }
