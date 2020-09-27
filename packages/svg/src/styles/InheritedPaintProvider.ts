import type { LINE_CAP, LINE_JOIN } from '@pixi/graphics';
import type { Paint } from './Paint';
import type { PaintProvider } from './PaintProvider';

/**
 * Inherited paint, used for &lt;use /&gt; elements. The properties used on the inherited paint do not
 * override those on the parent.
 */
export class InheritedPaintProvider implements Paint
{
    public parent: Paint;
    public provider: PaintProvider;

    constructor(parent: Paint, provider: PaintProvider)
    {
        this.parent = parent;
        this.provider = provider;
    }

    get dirtyId(): number
    {
        return this.parent.dirtyId + this.provider.dirtyId;
    }

    get fill(): number | 'none'
    {
        return (this.parent && (typeof this.parent.fill === 'number' || this.parent.fill === 'none'))
            ? this.parent.fill : this.provider.fill;
    }

    get opacity(): number
    {
        return (this.parent && typeof this.parent.opacity === 'number') ? this.parent.opacity : this.provider.opacity;
    }

    get stroke(): number
    {
        return (this.parent && typeof this.parent.stroke === 'number') ? this.parent.stroke : this.provider.stroke;
    }

    get strokeDashArray(): number[]
    {
        return (this.parent && Array.isArray(this.parent.strokeDashArray))
            ? this.parent.strokeDashArray : this.provider.strokeDashArray;
    }

    get strokeDashOffset(): number
    {
        return (this.parent && typeof this.parent.strokeDashOffset === 'number')
            ? this.parent.strokeDashOffset : this.provider.strokeDashOffset;
    }

    get strokeLineCap(): LINE_CAP
    {
        return (this.parent && typeof this.parent.strokeLineCap === 'number')
            ? this.parent.strokeLineCap : this.provider.strokeLineCap;
    }

    get strokeLineJoin(): LINE_JOIN
    {
        return (this.parent && typeof this.parent.strokeLineJoin === 'number')
            ? this.parent.strokeLineJoin : this.provider.strokeLineJoin;
    }

    get strokeMiterLimit(): number
    {
        return (this.parent && typeof this.parent.strokeMiterLimit === 'number')
            ? this.parent.strokeMiterLimit : this.provider.strokeMiterLimit;
    }

    get strokeWidth(): number
    {
        return (this.parent && typeof this.parent.strokeWidth === 'number')
            ? this.parent.strokeWidth : this.provider.strokeWidth;
    }
}
