import { Container } from '@pixi/display';

import type { SVGGraphicsNode } from './SVGGraphicsNode';

/**
 * Container for rendering SVG &lt;use /&gt; elements.
 * 
 * @public
 */
export class SVGUseNode extends Container
{
    public isRefExternal = false;

    private _ref: SVGGraphicsNode;

    /**
     * Embeds the `SVGUseElement` into this node.
     *
     * @param element - The &lt;use /&gt; element to draw.
     */
    embedUse(element: SVGUseElement): void
    {
        element.x.baseVal.convertToSpecifiedUnits(SVGLength.SVG_LENGTHTYPE_PX);
        element.y.baseVal.convertToSpecifiedUnits(SVGLength.SVG_LENGTHTYPE_PX);
        element.width.baseVal.convertToSpecifiedUnits(SVGLength.SVG_LENGTHTYPE_PX);
        element.height.baseVal.convertToSpecifiedUnits(SVGLength.SVG_LENGTHTYPE_PX);

        const x = element.x.baseVal.valueInSpecifiedUnits;
        const y = element.y.baseVal.valueInSpecifiedUnits;

        // TODO: width,height only have an efffect if the reference element is <svg> or <symbol>.
        // const width = element.width.baseVal.valueInSpecifiedUnits;
        // const height = element.height.baseVal.valueInSpecifiedUnits;

        this.position.set(x, y);
    }

    /**
     * The node that renders the element referenced by a &lt;element /&gt; element.
     */
    get ref(): SVGGraphicsNode
    {
        return this._ref;
    }
    set ref(value: SVGGraphicsNode)
    {
        if (this._ref)
        {
            if (this._ref === value)
            {
                return;
            }

            this.removeChild(this._ref);
        }

        this._ref = value;
        this.addChild(this._ref);
    }
}