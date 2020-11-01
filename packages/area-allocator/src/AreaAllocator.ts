import { Rectangle } from '@pixi/math';
import { Area, AreaOrientation } from './Area';

import type { AreaField } from './Area';

/**
 * An allocator node is represented as a tuple. The zeroth element is the parent of the node. The first element 
 * always exists and is the texture area it wholly represents. The second/last element is optional and is the list
 * of its children.
 *
 * @ignore
 */
type AreaNode = [AreaNode, AreaField] | [AreaNode, AreaField, AreaNode[]];

const tempRect = new Rectangle();

export class AreaAllocator
{
    protected _root: AreaNode;
    protected _buckets: AreaNode[];

    private _width: number;
    private _height: number;

    constructor(width: number, height: number)
    {
        // NOTE: getFrame assumes root node is always horizontal!
        this._root = [
            null,
            Area.makeArea(0, this._width, AreaOrientation.HORIZONTAL),
        ];
        this._width = width;
        this._height = height;
    }

    /**
     * Allocates an area of the given `width` and `height`.
     *
     * @param width - The width required for the allocated area.
     * @param height - The height required for the allocated area.
     * @param rect - An optional `Rectangle` instance to put the resulting area frame into.
     * @return The rectangle frame of the area allocated.
     */
    allocate(width: number, height: number, rect?: Rectangle): Rectangle
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

        return rect;
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
        const parentOpen = nodeParent ? Area.getOpenOffset(nodeArea) : 0;
        const parentClose = nodeParent ? Area.getCloseOffset(nodeArea) : this._height;// (because root node is horizontal)

        if (!nodeOrientation) // HORIZONTAL
        {
            rect.x = nodeOpen;
            rect.y = parentOpen;
            rect.width = nodeClose - rect.x;
            rect.height = parentClose - parentOpen;
        } 
        else // VERTICAL
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
        return (node[2] && (node[2].length !== 0));
    }

    /**
     * Returns the children of the passed node, if any.
     *
     * @param node
     */
    protected getChildren(node: AreaNode): AreaNode[]
    {
        return node[2];
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

            if (dx < 0 || dy < 0)
            {
                return null;
            }

            return rootArea;
        }

        const children = this.getChildren(rootArea);

        let bestCandidate = null;
        let bestCandidateScore = -1;

        for (let i = 0, j = children.length; i < j; i++)
        {
            const candidate = this.findAreaRecursive(children[i], aw, ah);
            
            if (!candidate)
            {
                return null;
            }

            const candidateFrame = this.getFrame(candidate, tempRect);

            const dx = candidateFrame.width - aw;
            const dy = candidateFrame.height - ah;

            if (!dx && !dy)
            {
                // Perfect fit!
                return candidate;
            }

            const score = Math.min(dx, dy);

            if (bestCandidateScore < score)
            {
                bestCandidate = candidate;
                bestCandidateScore = score;
            }
        }

        return bestCandidate;
    }
}