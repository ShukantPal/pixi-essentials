import type { LINE_CAP, LINE_JOIN } from '@pixi/graphics';

/**
 * Internal, parsed form of painting attributes. If a paint attribute was not defined, it **must** be
 * `null` (not `undefined`).
 *
 * @public
 * @see https://www.w3.org/TR/SVG2/painting.html#Introduction
 */
export interface Paint
{
    /**
     * The interior paint for the shape.
     */
    readonly fill: number | string;

    /**
     * The opacity of the fill.
     */
    readonly opacity: number;

    /**
     * The color of the stroke outline applied on the shape.
     */
    readonly stroke: number | string;

    /**
     * The dash pattern for stroking the shape.
     */
    readonly strokeDashArray: number[];

    /**
     * The distance into the dash pattern at which the stroking is started.
     */
    readonly strokeDashOffset: number;

    /**
     * The line caps applied at the end of the stroke. This is not applied for closed shapes.
     */
    readonly strokeLineCap: LINE_CAP;

    /**
     * The line join applied at the joint to line segments.
     */
    readonly strokeLineJoin: LINE_JOIN;

    /**
     * The maximum miter distance.
     */
    readonly strokeMiterLimit: number;

    /**
     * The width of the stroke outline applied on the shape.
     */
    readonly strokeWidth: number;

    /**
     * Flags when the paint is updated.
     */
    readonly dirtyId: number;
}
