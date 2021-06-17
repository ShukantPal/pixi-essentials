import type { LINE_CAP, LINE_JOIN } from '@pixi/graphics';
import type { Paint } from './Paint';

/**
 * Inherited paint, used for &lt;use /&gt; elements. The properties used on the inherited paint do not
 * override those on the parent.
 * 
 * @public
 */
export class InheritedPaintProvider implements Paint
{
    public parent: Paint;
    public provider: Paint;

    /**
     * Composes a `Paint` that will inherit properties from the `parent` if the `provider` does not
     * define them.
     *
     * @param parent
     * @param provider
     */
    constructor(parent: Paint, provider: Paint)
    {
        this.parent = parent;
        this.provider = provider;
    }

    get dirtyId(): number
    {
        return this.parent.dirtyId + this.provider.dirtyId;
    }

    get fill(): number | string
    {
        return this.provider.fill !== null ? this.provider.fill : this.parent.fill;
    }

    get opacity(): number
    {
        return (typeof this.provider.opacity === 'number') ? this.provider.opacity : this.parent.opacity;
    }

    get stroke(): number | string
    {
        return this.provider.stroke !== null ? this.provider.stroke : this.parent.stroke;
    }

    get strokeDashArray(): number[]
    {
        return Array.isArray(this.provider.strokeDashArray) ? this.provider.strokeDashArray : this.parent.strokeDashArray;
    }

    get strokeDashOffset(): number
    {
        return typeof this.provider.strokeDashOffset === 'number'
            ? this.provider.strokeDashOffset : this.parent.strokeDashOffset;
    }

    get strokeLineCap(): LINE_CAP
    {
        return typeof this.provider.strokeLineCap === 'string' ? this.provider.strokeLineCap : this.parent.strokeLineCap;
    }

    get strokeLineJoin(): LINE_JOIN
    {
        return typeof this.provider.strokeLineJoin === 'string' ? this.provider.strokeLineJoin : this.parent.strokeLineJoin;
    }

    get strokeMiterLimit(): number
    {
        return typeof this.provider.strokeMiterLimit === 'number'
            ? this.provider.strokeMiterLimit : this.parent.strokeMiterLimit;
    }

    get strokeWidth(): number
    {
        return typeof this.provider.strokeWidth === 'number' ? this.provider.strokeWidth : this.parent.strokeWidth;
    }
}
