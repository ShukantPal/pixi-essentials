import { Container } from '@pixi/display';

import type { SVGGraphicsNode } from './SVGGraphicsNode';

/**
 * Container for rendering SVG &lt;use /&gt; elements.
 */
export class SVGUseNode extends Container
{
    private _ref: SVGGraphicsNode;

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