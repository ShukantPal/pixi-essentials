import { LineStyle } from '@pixi/graphics';

export class DashedLineStyle extends LineStyle
{
    /**
     * The dashing pattern of dashes and gaps to stroke paths.
     */
    public dashArray: number[] = null;

    /**
     * The distance into the dash pattern to start from.
     */
    public dashOffset = 0;

    /**
     * @override
     */
    public clone(): DashedLineStyle
    {
        const obj = super.clone() as DashedLineStyle;

        obj.dashArray = this.dashArray ? [...this.dashArray] : null;
        obj.dashOffset = this.dashOffset;

        return obj;
    }

    /**
     * @override
     */
    public reset(): void
    {
        super.reset();

        this.dashArray = null;
        this.dashOffset = 0;
    }
}
