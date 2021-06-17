import { Rectangle } from '@pixi/math';
import { Area, AreaOrientation } from './Area';

import type { AreaAllocator } from './AreaAllocator';
import type { AreaField } from './Area';

/**
 * An allocator node is represented as a tuple. The zeroth element is the parent of the node. The first element 
 * always exists and is the texture area it wholly represents. The second element is whether the rectangle
 * is allocated or free. The last element is optional and is the list
 * of its children.
 *
 * @public
 * @ignore
 */
export type AreaNode = [AreaNode, AreaField, boolean] | [AreaNode, AreaField, AreaNode[]];

/**
 * Pointer to guillotene node.
 * 
 * @public
 * @ignore
 */
export type AreaPtr = { __mem_area: AreaNode };

/**
 * @public
 * @ignore
 */
export enum SPLIT_ORIENTATION {
    HOR = 0,
    VERT = 1,
    NONE = 2
}

const tempRect = new Rectangle();

/** @public */
export class GuilloteneAllocator implements AreaAllocator<AreaPtr>
{
    protected _root: AreaNode;

    private _width: number;
    private _height: number;

    constructor(width: number, height: number)
    {
        this._width = width;
        this._height = height;

        // NOTE: getFrame assumes root node is always horizontal!
        this._root = [
            null,
            Area.makeArea(0, this._height, AreaOrientation.HORIZONTAL),
            false
        ];
    }

    /**
     * Allocates an area of the given `width` and `height`.
     *
     * @param width - The width required for the allocated area.
     * @param height - The height required for the allocated area.
     * @param rect - An optional `Rectangle` instance to put the resulting area frame into.
     * @return The rectangle frame of the area allocated.
     */
    allocate(width: number, height: number, rect?: Rectangle): Rectangle & AreaPtr
    {
        const area = this.findArea(width, height);

        if (!area)
        {
            return null;
        }

        if (!rect)
        {
            rect = new Rectangle();
        }

        this.getFrame(area, rect);

        const hole = new Rectangle(rect.x, rect.y, width, height);
        const node = this.split(area, rect, hole);

        rect.copyFrom(hole);
        (rect as any).__mem_area = node;

        return rect as (Rectangle & AreaPtr);
    }

    /**
     * Frees the area represented by the given area pointer. The original rectangle returned by
     * {@link GuilloteneAllocator#allocate} included this pointer (the `__mem_area` property).
     *
     * @param areaPtr 
     */
    free(areaPtr: AreaPtr): void
    {
        const area = areaPtr.__mem_area;

        area[2] = false;
        this.merge(area);
    }

    get width(): number
    {
        return this._width;
    }

    get height(): number
    {
        return this._height;
    }

    /**
     * Returns the [area]{@link Area} data for the node.
     *
     * @param node 
     * @returns The area data for the node.
     */
    protected getAreaField(node: AreaNode): AreaField
    {
        return node[1];
    }

    /**
     * Returns the rectangle covered by the area node.
     *
     * @param node - The node whose covered rectangular area is needed.
     * @param rect - An optional `Rectangle` instance to put the data in.
     * @return The rectangle covered by `node`.
     */
    protected getFrame(node: AreaNode, rect?: Rectangle): Rectangle
    {
        if (!rect)
        {
            rect = new Rectangle();
        }

        const nodeArea = this.getAreaField(node);
        const nodeParent = this.getParent(node);
        const nodeOrientation = Area.getOrientation(nodeArea);
        const nodeOpen = Area.getOpenOffset(nodeArea);
        const nodeClose = Area.getCloseOffset(nodeArea);
        const parentOpen = nodeParent ? Area.getOpenOffset(nodeParent[1]) : 0;
        const parentClose = nodeParent ? Area.getCloseOffset(nodeParent[1]) : this._width;// (because root node is horizontal)

        if (nodeOrientation) // VERTICAL
        {
            rect.x = nodeOpen;
            rect.y = parentOpen;
            rect.width = nodeClose - rect.x;
            rect.height = parentClose - parentOpen;
        } 
        else // HORIZONTAL
        {
            rect.x = parentOpen;
            rect.y = nodeOpen;
            rect.width = parentClose - rect.x;
            rect.height = nodeClose - rect.y;
        }

        return rect;
    }

    /**
     * Returns the parent of the area node.
     *
     * @param node 
     * @return The parent of `node`
     */
    protected getParent(node: AreaNode): AreaNode
    {
        return node[0];
    }

    /**
     * Returns whether the given node has any children.
     *
     * @param node 
     * @return Whether the given node has any children.
     */
    protected hasChildren(node: AreaNode): boolean
    {
        return (Array.isArray(node[2]) && (node[2].length !== 0));
    }

    /**
     * Returns the children of the passed node, if any.
     *
     * @param node
     */
    protected getChildren(node: AreaNode): AreaNode[]
    {
        if (!Array.isArray(node[2])) {
            throw new Error("Children don't exist")
        }

        return node[2];
    }

    protected addChild(parent: AreaNode, ...nodes: AreaNode[]): void
    {
        parent[2] = Array.isArray(parent[2]) ? parent[2] : []
        parent[2].push(...nodes)
    }

    /**
     * Finds an area node with minimum width `aw` and minimum height `ah`.
     *
     * @param aw 
     * @param ah 
     */
    protected findArea(aw: number, ah: number): AreaNode
    {
        return this.findAreaRecursive(this._root, aw, ah);
    }

    /**
     * The recursive implementation for {@link AreaAllocator#findArea}.
     *
     * @param rootArea 
     * @param aw 
     * @param ah 
     */
    protected findAreaRecursive(rootArea: AreaNode, aw: number, ah: number): AreaNode
    {
        const frame = this.getFrame(rootArea, tempRect);

        if (frame.width < aw || frame.height < ah)
        {
            return null;
        }

        if (!this.hasChildren(rootArea))
        {
            const dx = frame.width - aw;
            const dy = frame.height - ah;

            if (dx < 0 || dy < 0 || rootArea[2])
            {
                return null;
            }

            return rootArea;
        }

        const children = this.getChildren(rootArea);

        let bestCandidate = null;
        let bestCandidateScore = Infinity;

        for (let i = 0, j = children.length; i < j; i++)
        {
            const candidate = this.findAreaRecursive(children[i], aw, ah);

            if (!candidate)
            {
                continue;
            }

            const candidateFrame = this.getFrame(candidate, tempRect);

            const dx = candidateFrame.width - aw;
            const dy = candidateFrame.height - ah;

            if (dx < 0 || dy < 0)
            {
                continue;
            }
            if (!dx && !dy)
            {
                // Perfect fit!
                return candidate;
            }

            const score = Math.min(dx, dy);

            if (bestCandidateScore > score)
            {
                bestCandidate = candidate;
                bestCandidateScore = score;
            }
        }

        return bestCandidate;
    }

    /**
     * Returns the orientation of the primary split of host.
     */
    protected splitOrientation(host: Rectangle, hole: Rectangle): SPLIT_ORIENTATION
    {
        if (hole.width === host.width && hole.height === host.height) {
            return SPLIT_ORIENTATION.NONE;
        }
        if (hole.width === host.width) {
            return SPLIT_ORIENTATION.VERT;
        }
        if (hole.height === host.height) {
            return SPLIT_ORIENTATION.HOR;
        }

        // ____________________
        // |        |         |
        // |        |         |
        // |  hole  |         |
        // |        |         |
        // |________| Primary |
        // |        |         |
        // |        |         |
        // |  Sec.  |         |
        // |________|_________|
        const horAreaDiff = Math.abs(
            // (Primary) Right
            (host.width - hole.width) * host.height -
            // (Secondary) Bottom
            hole.width * (host.height - hole.height)
        ) 

        // ____________________
        // |        |         |
        // |        |         |
        // |  hole  | Sec.    |
        // |        |         |
        // |________|_________|
        // |                  |
        // |    Primary       |
        // |__________________|
        const verAreaDiff = Math.abs(
            // (Primary) Bottom
            host.width * (host.height - hole.height) -
            (host.width - hole.width) * hole.height
        )

        if (horAreaDiff > verAreaDiff)
        {
            return SPLIT_ORIENTATION.HOR
        } 
        else
        {
            return SPLIT_ORIENTATION.VERT
        }
    }

    protected split(
        area: AreaNode,
        areaFrame: Rectangle,
        holeFrame: Rectangle,
        orientation: SPLIT_ORIENTATION = this.getParent(area) ? this.splitOrientation(areaFrame, holeFrame) : SPLIT_ORIENTATION.HOR
    ): AreaNode
    {
        if (area[2] === true) 
        {
            throw new Error('Cannot deallocate')
        }
        if (orientation === SPLIT_ORIENTATION.NONE)
        {
            area[2] = true;
            return area;
        }

        return this[orientation === SPLIT_ORIENTATION.HOR 
            ? 'splitPrimaryHorizontal' 
            : 'splitPrimaryVertical'](area, areaFrame, holeFrame);
    }

    private splitPrimaryHorizontal(area: AreaNode, areaFrame: Rectangle, holeFrame: Rectangle): AreaNode
    {
        const field = this.getAreaField(area);
        const axis = Area.getOrientation(field);
        const parent = this.getParent(area);

        if (this.hasChildren(area))
        {
            throw new Error("Can't split non-leaf node")
        }

        const firstChild: AreaNode = [
            area,
            Area.makeArea(
                areaFrame.left,
                areaFrame.x + holeFrame.width,
                AreaOrientation.VERTICAL
            ),
            []
        ];
        const secondChild: AreaNode = [
            area,
            Area.makeArea(
                areaFrame.x + holeFrame.width, 
                areaFrame.right, 
                AreaOrientation.VERTICAL
            ),
            false
        ];

        if (axis === AreaOrientation.HORIZONTAL) {
            this.addChild(area, firstChild, secondChild)
        } else {
            const i = this.getChildren(parent).indexOf(area);

            firstChild[0] = parent;
            secondChild[0] = parent;

            this.getChildren(parent).splice(i, 1, firstChild, secondChild);
        }

        if (holeFrame.height !== areaFrame.height)
        {
            const secondaryFirstChild: AreaNode = [
                firstChild,
                Area.makeArea(
                    areaFrame.top,
                    areaFrame.y + holeFrame.height,
                    AreaOrientation.HORIZONTAL
                ),
                true
            ];
            const secondarySecondChild: AreaNode = [
                firstChild,
                Area.makeArea(
                    areaFrame.y + holeFrame.height,
                    areaFrame.bottom,
                    AreaOrientation.HORIZONTAL
                ),
                false
            ];

            this.addChild(firstChild, secondaryFirstChild, secondarySecondChild);

            return secondaryFirstChild;
        }
        else
        {
            (firstChild as AreaNode)[2] = true;
        }

        return firstChild;
    }

    private splitPrimaryVertical(area: AreaNode, areaFrame: Rectangle, holeFrame: Rectangle): AreaNode
    {
        const field = this.getAreaField(area);
        const axis = Area.getOrientation(field);
        const parent = this.getParent(area);

        if (this.hasChildren(area)) {
            throw new Error("Can't split non-leaf node")
        }

        const primaryFirstChild: AreaNode = [
            area,
            Area.makeArea(
                areaFrame.top,
                areaFrame.y + holeFrame.height,
                AreaOrientation.HORIZONTAL
            ),
            []
        ];
        const primarySecondChild: AreaNode = [
            area,
            Area.makeArea(
                areaFrame.y + holeFrame.height,
                areaFrame.bottom,
                AreaOrientation.HORIZONTAL
            ),
            false
        ];

        if (axis === AreaOrientation.VERTICAL) 
        {
            this.addChild(area, primaryFirstChild, primarySecondChild);
        }
        else
        {
            const i = this.getChildren(parent).indexOf(area);
            primaryFirstChild[0] = parent;
            primarySecondChild[0] = parent;
            this.getChildren(parent).splice(i, 1, primaryFirstChild, primarySecondChild);
        }

        if (holeFrame.width !== areaFrame.height)
        {
            const secondaryFirstChild: AreaNode = [
                primaryFirstChild,
                Area.makeArea(
                    areaFrame.left,
                    areaFrame.x + holeFrame.width,
                    AreaOrientation.VERTICAL
                ),
                true
            ];
            const secondarySecondChild: AreaNode = [
                primaryFirstChild,
                Area.makeArea(
                    areaFrame.x + holeFrame.width,
                    areaFrame.right,
                    AreaOrientation.VERTICAL
                ),
                false
            ];

            this.addChild(primaryFirstChild, secondaryFirstChild, secondarySecondChild);

            return secondaryFirstChild;
        }
        else
        {
            (primaryFirstChild as AreaNode)[2] = true;
        }

        return primaryFirstChild;
    }

    protected merge(
        area: AreaNode
    ) {
        if (this.hasChildren(area))
        {
            throw new Error("Cannot merge a non-leaf node");
        }

        const parent = this.getParent(area);

        if (!parent)
        {
            return;
        }

        const siblings = this.getChildren(parent);
        const i = siblings.indexOf(area);

        const leftSibling = siblings[i - 1];
        const rightSibling = siblings[i + 1];

        if (rightSibling && rightSibling[2] === false)
        {
            // Merge rightSibling into area
            area[1] = Area.setCloseOffset(area[1], Area.getCloseOffset(rightSibling[1]));
            siblings.splice(i + 1, 1);
        }
        if (leftSibling && leftSibling[2] === false)
        {
            // Merge leftSibling into area
            area[1] = Area.setOpenOffset(area[1], Area.getOpenOffset(leftSibling[1]));
            siblings.splice(i - 1, 1);
        }

        if (siblings.length === 1) {
            parent[2] = false;
            this.merge(parent);
        }
    }

    private printState(area: AreaNode): void
    {
        if (!this.hasChildren(area)) {
            console.log({ ...this.getFrame(area) }, area[2])
        } else {
            this.getChildren(area).forEach(n => this.printState(n))
        }
    }
}