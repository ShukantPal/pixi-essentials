import { Rectangle } from '@pixi/math';

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
export declare class Area {
    static makeArea(openOffset: number, closeOffset: number, orientation: number): number;
    static getOpenOffset(area: AreaField): number;
    static getCloseOffset(area: AreaField): number;
    static getOrientation(area: AreaField): AreaOrientation;
    static setOpenOffset(area: AreaField, offset: number): number;
    static setCloseOffset(area: AreaField, offset: number): number;
}

export declare interface AreaAllocator<N> {
    readonly width: number;
    readonly height: number;
    allocate(width: number, height: number): Rectangle & N;
    free(area: N): void;
}

/**
 * Alias for the 31-bit field texture-area type.
 */
export declare type AreaField = number;

/**
 * An allocator node is represented as a tuple. The zeroth element is the parent of the node. The first element
 * always exists and is the texture area it wholly represents. The second element is whether the rectangle
 * is allocated or free. The last element is optional and is the list
 * of its children.
 *
 * @ignore
 */
declare type AreaNode = [AreaNode, AreaField, boolean] | [AreaNode, AreaField, AreaNode[]];

/**
 * The orientation of an area indicates the axis along which it is split. This is a 1-bit field.
 */
export declare enum AreaOrientation {
    HORIZONTAL = 0,
    VERTICAL = 1
}

/**
 * Pointer to guillotene node.
 */
declare type AreaPtr = {
    __mem_area: AreaNode;
};

export declare class GuilloteneAllocator implements AreaAllocator<AreaPtr> {
    protected _root: AreaNode;
    private _width;
    private _height;
    constructor(width: number, height: number);
    /**
     * Allocates an area of the given `width` and `height`.
     *
     * @param width - The width required for the allocated area.
     * @param height - The height required for the allocated area.
     * @param rect - An optional `Rectangle` instance to put the resulting area frame into.
     * @return The rectangle frame of the area allocated.
     */
    allocate(width: number, height: number, rect?: Rectangle): Rectangle & AreaPtr;
    /**
     * Frees the area represented by the given area pointer. The original rectangle returned by
     * {@link GuilloteneAllocator#allocate} included this pointer (the `__mem_area` property).
     *
     * @param areaPtr
     */
    free(areaPtr: AreaPtr): void;
    get width(): number;
    get height(): number;
    /**
     * Returns the [area]{@link Area} data for the node.
     *
     * @param node
     * @returns The area data for the node.
     */
    protected getAreaField(node: AreaNode): AreaField;
    /**
     * Returns the rectangle covered by the area node.
     *
     * @param node - The node whose covered rectangular area is needed.
     * @param rect - An optional `Rectangle` instance to put the data in.
     * @return The rectangle covered by `node`.
     */
    protected getFrame(node: AreaNode, rect?: Rectangle): Rectangle;
    /**
     * Returns the parent of the area node.
     *
     * @param node
     * @return The parent of `node`
     */
    protected getParent(node: AreaNode): AreaNode;
    /**
     * Returns whether the given node has any children.
     *
     * @param node
     * @return Whether the given node has any children.
     */
    protected hasChildren(node: AreaNode): boolean;
    /**
     * Returns the children of the passed node, if any.
     *
     * @param node
     */
    protected getChildren(node: AreaNode): AreaNode[];
    protected addChild(parent: AreaNode, ...nodes: AreaNode[]): void;
    /**
     * Finds an area node with minimum width `aw` and minimum height `ah`.
     *
     * @param aw
     * @param ah
     */
    protected findArea(aw: number, ah: number): AreaNode;
    /**
     * The recursive implementation for {@link AreaAllocator#findArea}.
     *
     * @param rootArea
     * @param aw
     * @param ah
     */
    protected findAreaRecursive(rootArea: AreaNode, aw: number, ah: number): AreaNode;
    /**
     * Returns the orientation of the primary split of host.
     */
    protected splitOrientation(host: Rectangle, hole: Rectangle): SPLIT_ORIENTATION;
    protected split(area: AreaNode, areaFrame: Rectangle, holeFrame: Rectangle, orientation?: SPLIT_ORIENTATION): AreaNode;
    private splitPrimaryHorizontal;
    private splitPrimaryVertical;
    protected merge(area: AreaNode): void;
    private printState;
}

declare enum SPLIT_ORIENTATION {
    HOR = 0,
    VERT = 1,
    NONE = 2
}

export { }
