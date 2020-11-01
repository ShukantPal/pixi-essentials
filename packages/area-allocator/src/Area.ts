/**
 * The orientation of an area indicates the axis along which it is split. This is a 1-bit field.
 */
export enum AreaOrientation {
    HORIZONTAL = 0,
    VERTICAL = 1
};

/**
 * Alias for the 31-bit field texture-area type.
 */
export type AreaField = number;

/**
 * An area represents an oriented rectangular region. It is implemented as a 31-bit field. The open/close edges are
 * specified along its parent's orientation axis, i.e. if the parent is horizontal, the left and right edges are defined,
 * else if the parent is vertical, the top and bottom edges are defined. Similarly, the open/close edges of its
 * children will be along its own orientation axis.
 * 
 * The orientation axes flip-flop along the hierarchy, i.e. an area's parent's orientation is always opposite to
 * the area's own orientation. This is because if the orientation were to be same, the area's children could be
 * "pulled up" to the parent making itself redundant.
 * 
 * All four edges of an area can be retrieved from it and its parent.
 * 
 * <table>
 *  <thead>
 *    <tr>
 *      <th>Field</th>
 *      <th>Bits</th>
 *      <th>Description</th>
 *    </tr>
 *  </thead>
 *  <tbody>
 *    <tr>
 *      <td>OPEN_OFFSET</td>
 *      <td>0-14</td>
 *      <td>
 *        The offset along the parent's axis at which the area begins. If orientation is horizontal,
 *        this is the left edge. If orientation is vertical, this is the top edge.
 *      </td>
 *    </tr>
 *    <tr>
 *      <td>CLOSE_OFFSET</td>
 *      <td>15-29</td>
 *      <td>
 *        The offset along the parent's axis at which the area ends. If orientation is horizontal,
 *        this is the right edge. If orientation is vertical, this is the bottom edge.
 *      </td>
 *    </tr>
 *    <tr>
 *      <td>ORIENTATION</td>
 *      <td>30</td>
 *      <td>
 *        The orientation of the area, which indicates the axis along it is split. The open and close
 *        offsets of its children are along this axis. See {@link TextureAreaOrientation}.
 *      </td>
 *    </tr>
 *  </tbody>
 * </table>
 */
export class Area
{
    static makeArea(openOffset: number, closeOffset: number, orientation: number): number
    {
        return openOffset | (closeOffset << 15) | (orientation << 30);
    }

    static getOpenOffset(area: number): number
    {
        return area & ~((1 << 15) - 1);
    }

    static getCloseOffset(area: number): number
    {
        return (area >> 15) & ~((1 << 15) - 1);
    }

    static getOrientation(area: number): AreaOrientation
    {
        return (area >> 30) & 1;
    }
}