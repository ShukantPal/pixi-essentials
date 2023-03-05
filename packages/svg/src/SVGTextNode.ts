import '@pixi/events';
import { Container } from '@pixi/display';
import { NODE_TRANSFORM_DIRTY } from './const';
import { SVGTextEngineImpl } from './SVGTextEngineImpl';
import { parseMeasurement } from './utils/parseMeasurement';

import type { DisplayObject } from '@pixi/display';
import type { IPointData } from '@pixi/math';
import type { SVGTextEngine } from './SVGTextEngine';
import type { TextStyle, TextStyleFontWeight } from '@pixi/text';

/**
 * Draws SVG &lt;text /&gt; elements.
 *
 * @public
 */
export class SVGTextNode extends Container
{
    /**
     * The SVG text rendering engine to be used by default in `SVGTextNode`. This API is not stable and
     * can change anytime.
     *
     * @alpha
     */
    static defaultEngine: { new(): SVGTextEngine & DisplayObject } = SVGTextEngineImpl;

    /**
     * An instance of a SVG text engine used to layout and render text.
     */
    protected engine: SVGTextEngine & DisplayObject;

    /**
     * The current text position, where the next glyph will be placed.
     */
    protected currentTextPosition: IPointData;

    constructor()
    {
        super();

        this.currentTextPosition = { x: 0, y: 0 };
        this.engine = new (SVGTextNode.defaultEngine)();
        this.addChild(this.engine);

        // Listen to nodetransformdirty on the engine so bounds are updated
        // when the text is rendered.
        this.engine.on(NODE_TRANSFORM_DIRTY, () => {
            this.emit(NODE_TRANSFORM_DIRTY);
        });
    }

    /**
     * Embeds a `SVGTextElement` in this node.
     *
     * @param {SVGTextElement} element - The `SVGTextElement` to embed.
     */
    async embedText(element: SVGTextElement | SVGTSpanElement, style: Partial<TextStyle> = {}): Promise<void>
    {
        const engine = this.engine;

        if (element instanceof SVGTextElement)
        {
            await engine.clear();

            this.currentTextPosition.x = element.x.baseVal.length > 0
                ? element.x.baseVal.getItem(0).value
                : 0;
            this.currentTextPosition.y = element.y.baseVal.length > 0
                ? element.y.baseVal.getItem(0).value
                : 0;
        }

        const fill = element.getAttribute('fill');
        const fontFamily = element.getAttribute('font-family');
        const fontSize = parseFloat(element.getAttribute('font-size'));
        const fontWeight = element.getAttribute('font-weight');
        const letterSpacing = parseMeasurement(element.getAttribute('letter-spacing'), fontSize);

        style.fill = fill || style.fill || 'black';
        style.fontFamily = fontFamily || !style.fontFamily ? `${fontFamily || 'serif'}, serif` : style.fontFamily;
        style.fontSize = !isNaN(fontSize) ? fontSize : style.fontSize;
        style.fontWeight = (fontWeight as TextStyleFontWeight) || style.fontWeight || 'normal';
        style.letterSpacing = !isNaN(letterSpacing) ? letterSpacing : (style.letterSpacing || 0);
        style.wordWrap = true;
        style.wordWrapWidth = 400;

        const childNodes = element.childNodes;

        for (let i = 0, j = childNodes.length; i < j; i++)
        {
            const childNode = childNodes.item(i);

            let textContent: string;
            let textStyle: Partial<TextStyle>;

            /* eslint-disable-next-line no-undef */
            if (childNode instanceof globalThis.Text)
            {
                textContent = childNode.data;
                textStyle = style;

                this.currentTextPosition = await engine.put(
                    childNode,
                    {
                        x: this.currentTextPosition.x,
                        y: this.currentTextPosition.y,
                    },
                    textContent,
                    textStyle,
                );

                // Ensure transforms are updated as new text phrases are loaded.
                this.emit(NODE_TRANSFORM_DIRTY);
            }
            else if (childNode instanceof SVGTSpanElement)
            {
                if (childNode.x.baseVal.length > 0)
                {
                    this.currentTextPosition.x = childNode.x.baseVal.getItem(0).value;
                }
                if (childNode.y.baseVal.length > 0)
                {
                    this.currentTextPosition.y = childNode.y.baseVal.getItem(0).value;
                }

                await this.embedText(childNode, { ...style });
            }
        }
    }
}
