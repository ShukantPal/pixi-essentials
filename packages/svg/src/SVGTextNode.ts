import { Container } from '@pixi/display';
import { SVGTextEngineImpl } from './SVGTextEngineImpl';

import type { DisplayObject } from '@pixi/display';
import type { SVGTextEngine } from './SVGTextEngine';
import type { TextStyle } from '@pixi/text';

/**
 * Draws SVG &lt;text /&gt; elements.
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

    constructor()
    {
        super();

        this.engine = new (SVGTextNode.defaultEngine)();
        this.addChild(this.engine);
    }

    /**
     * Embeds a `SVGTextElement` in this node.
     *
     * @param element - The `SVGTextElement` to embed.
     */
    embedText(element: SVGTextElement): void
    {
        const fill = element.getAttribute('fill');
        const fontFamily = `${element.getAttribute('font-family') || 'serif'}, serif`;
        const fontSize = parseFloat(element.getAttribute('font-size'));
        const fontWeight = element.getAttribute('font-weight') || 'normal';

        const style = {
            fill: fill || 'black',
            fontFamily,
            fontSize,
            fontWeight,
            wordWrap: true,
            wordWrapWidth: 400,
        };
        let textPosition = { x: 0, y: 0 };
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
            }
            else if (childNode instanceof SVGTSpanElement)
            {
                textContent = childNode.textContent;
                textStyle = Object.assign({}, style);

                const fill = element.getAttribute('fill');
                const fontFamily = element.getAttribute('font-family');
                const fontSize = parseFloat(element.getAttribute('font-size'));
                const fontWeight = element.getAttribute('font-weight');

                textStyle.fill = fill || style.fill;
                textStyle.fontFamily = fontFamily ? `${fontFamily}, serif` : style.fontFamily;
                textStyle.fontSize = !isNaN(fontSize) ? fontSize : style.fontSize;
                textStyle.fontWeight = fontWeight || style.fontWeight;

                if (childNode.x.baseVal.length > 0)
                {
                    textPosition.x = childNode.x.baseVal.getItem(0).value;
                }
                if (childNode.y.baseVal.length > 0)
                {
                    textPosition.y = childNode.y.baseVal.getItem(0).value;
                }
            }
            else
            {
                continue;
            }

            textPosition = this.engine.put(childNode, { x: textPosition.x, y: textPosition.y }, textContent, textStyle);
        }
    }
}
