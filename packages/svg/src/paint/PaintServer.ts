import { GradientFactory } from '@pixi-essentials/gradients';
import { PaintProvider } from './PaintProvider';

import type { Renderer, RenderTexture } from '@pixi/core';
import type { ColorStop } from '@pixi-essentials/gradients';
import type { Rectangle } from '@pixi/math';

/**
 * Converts the linear gradient's x1, x2, y1, y2 attributes into percentage units.
 *
 * @param linearGradient - The linear gradient element whose attributes are to be converted.
 */
function convertLinearGradientAxis(linearGradient: SVGLinearGradientElement): void
{
    linearGradient.x1.baseVal.convertToSpecifiedUnits(SVGLength.SVG_LENGTHTYPE_PERCENTAGE);
    linearGradient.y1.baseVal.convertToSpecifiedUnits(SVGLength.SVG_LENGTHTYPE_PERCENTAGE);
    linearGradient.x2.baseVal.convertToSpecifiedUnits(SVGLength.SVG_LENGTHTYPE_PERCENTAGE);
    linearGradient.y2.baseVal.convertToSpecifiedUnits(SVGLength.SVG_LENGTHTYPE_PERCENTAGE);
}

/**
 * [Paint Servers]{@link https://svgwg.org/svg-next/pservers.html} are implemented as textures. This class is a lazy
 * wrapper around paint textures, which can only be generated using the `renderer` drawing to the screen.
 * 
 * @public
 */
export class PaintServer
{
    public paintServer: SVGGradientElement | SVGPatternElement;
    public paintTexture: RenderTexture;
    public paintContexts: { [id: number]: number };

    public dirtyId: number;

    /**
     * Creates a `PaintServer` wrapper.
     *
     * @param paintServer
     * @param paintTexture
     */
    constructor(paintServer: SVGGradientElement | SVGPatternElement, paintTexture: RenderTexture)
    {
        this.paintServer = paintServer;
        this.paintTexture = paintTexture;
        this.paintContexts = {};
        this.dirtyId = 0;
    }

    /**
     * Ensures the paint texture is updated for the renderer's WebGL context. This should be called before using the
     * paint texture to render anything.
     *
     * @param renderer - The renderer that will use the paint texture.
     */
    public resolvePaint(renderer: Renderer): void
    {
        const contextDirtyId = this.paintContexts[renderer.CONTEXT_UID];
        const dirtyId = this.dirtyId;

        if (contextDirtyId === undefined || contextDirtyId < dirtyId)
        {
            this.updatePaint(renderer);
            this.paintContexts[renderer.CONTEXT_UID] = dirtyId;
        }
    }

    /**
     * Calculates the optimal texture dimensions for the paint texture, given the bounding box of the
     * object applying it. The paint texture is resized accordingly.
     *
     * If the paint texture is sized smaller than the bounding box, then it is expected that it will
     * be scaled up to fit it.
     *
     * @param bbox - The bounding box of the object applying the paint texture.
     */
    public resolvePaintDimensions(bbox: Rectangle): void
    {
        const bwidth = Math.ceil(bbox.width);
        const bheight = Math.ceil(bbox.height);
        const baspectRatio = bwidth / bheight;

        const paintServer = this.paintServer;
        const paintTexture = this.paintTexture;

        if (paintServer instanceof SVGLinearGradientElement)
        {
            convertLinearGradientAxis(paintServer);

            const colorStops = paintServer.children;
            const x1 = paintServer.x1.baseVal.valueInSpecifiedUnits;
            const y1 = paintServer.y1.baseVal.valueInSpecifiedUnits;
            const x2 = paintServer.x2.baseVal.valueInSpecifiedUnits;
            const y2 = paintServer.y2.baseVal.valueInSpecifiedUnits;

            const mainAxisAngle = Math.atan2(y2 - y1, x2 - x1);
            const mainAxisLength = colorStops.length === 1 ? 2 : 64;
            let width = Math.max(1, mainAxisLength * Math.cos(mainAxisAngle));
            let height = Math.max(1, mainAxisLength * Math.sin(mainAxisAngle));

            if (width < bwidth && height < bheight)
            {
                // If the gradient is not parallel to x- or y- axis, then ensure that the texture's aspect ratio
                // matches that of the bounding box. This will ensure scaling is equal along both axes, and the
                // angle is not skewed due to scaling.
                if (Math.abs(mainAxisAngle) > 1e-2
                    && Math.abs(mainAxisAngle) % (Math.PI / 2) > 1e-2)
                {
                    const aspectRatio = width / height;

                    if (aspectRatio > baspectRatio)
                    {
                        height = width / baspectRatio;
                    }
                    else
                    {
                        width = baspectRatio * height;
                    }
                }

                paintTexture.resize(width, height, true);

                return;
            }
        }

        paintTexture.resize(bwidth, bheight, true);
    }

    /**
     * Renders the paint texture using the renderer immediately.
     *
     * @param renderer - The renderer to use for rendering to the paint texture.
     */
    public updatePaint(renderer: Renderer): void
    {
        if (this.paintServer instanceof SVGLinearGradientElement)
        {
            this.linearGradient(renderer);
        }
        else if (this.paintServer instanceof SVGRadialGradientElement)
        {
            this.radialGradient(renderer);
        }
    }

    /**
     * Renders `this.paintServer` as a `SVGLinearGradientElement`.
     *
     * @param renderer - The renderer being used to render the paint texture.
     */
    private linearGradient(renderer: Renderer): RenderTexture
    {
        const linearGradient = this.paintServer as SVGLinearGradientElement;
        const paintTexture = this.paintTexture;

        convertLinearGradientAxis(linearGradient);

        return GradientFactory.createLinearGradient(
            renderer,
            paintTexture,
            {
                x0: linearGradient.x1.baseVal.valueInSpecifiedUnits * paintTexture.width / 100,
                y0: linearGradient.y1.baseVal.valueInSpecifiedUnits * paintTexture.height / 100,
                x1: linearGradient.x2.baseVal.valueInSpecifiedUnits * paintTexture.width / 100,
                y1: linearGradient.y2.baseVal.valueInSpecifiedUnits * paintTexture.height / 100,
                colorStops: this.createColorStops(linearGradient.children),
            },
        );
    }

    /**
     * Renders `this.paintServer` as a `SVGRadialGradientElement`.
     *
     * @param renderer - The renderer being used to render the paint texture.
     */
    private radialGradient(renderer: Renderer): RenderTexture
    {
        const radialGradient = this.paintServer as SVGRadialGradientElement;
        const paintTexture = this.paintTexture;

        radialGradient.fx.baseVal.convertToSpecifiedUnits(SVGLength.SVG_LENGTHTYPE_NUMBER);
        radialGradient.fy.baseVal.convertToSpecifiedUnits(SVGLength.SVG_LENGTHTYPE_NUMBER);
        radialGradient.cx.baseVal.convertToSpecifiedUnits(SVGLength.SVG_LENGTHTYPE_NUMBER);
        radialGradient.cy.baseVal.convertToSpecifiedUnits(SVGLength.SVG_LENGTHTYPE_NUMBER);

        return GradientFactory.createRadialGradient(
            renderer,
            paintTexture,
            {
                x0: radialGradient.fx.baseVal.valueInSpecifiedUnits * paintTexture.width / 100,
                y0: radialGradient.fy.baseVal.valueInSpecifiedUnits * paintTexture.height / 100,
                r0: radialGradient.fr.baseVal.valueInSpecifiedUnits * paintTexture.width / 100,
                x1: radialGradient.cx.baseVal.valueInSpecifiedUnits * paintTexture.width / 100,
                y1: radialGradient.cy.baseVal.valueInSpecifiedUnits * paintTexture.height / 100,
                r1: radialGradient.r.baseVal.valueInSpecifiedUnits * paintTexture.width / 100,
                colorStops: this.createColorStops(radialGradient.children),
            },
        );
    }

    /**
     * Extracts the color-stops from the children of a `SVGGradientElement`.
     *
     * @param stopElements - The children of a `SVGGradientElement`. You can get it via `element.children`.
     * @return The color stops that can be fed into {@link GradientFactory}.
     */
    private createColorStops(stopElements: HTMLCollection): ColorStop[]
    {
        const colorStops: ColorStop[] = [];

        for (let i = 0, j = stopElements.length; i < j; i++)
        {
            const stopElement: SVGStopElement = stopElements.item(i) as SVGStopElement;

            colorStops.push({
                offset: stopElement.offset.baseVal,
                color: PaintProvider.parseColor(stopElement.getAttribute('stop-color')) as number,
            });
        }

        return colorStops;
    }
}
