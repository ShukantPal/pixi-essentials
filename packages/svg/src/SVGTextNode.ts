import { Text } from '@pixi/text';

export class SVGTextNode extends Text
{
    constructor()
    {
        super('');
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
        const fontWeight = element.getAttribute('font-weight');

        const style = {
            fill: fill || 'black',
            fontFamily,
            fontSize,
            fontWeight,
            wordWrap: true,
            wordWrapWidth: 400,
        };
        const textContent = element.textContent;

        this.style = style;
        this.resolution = window.devicePixelRatio || 1;
        this.text = textContent;
    }
}
