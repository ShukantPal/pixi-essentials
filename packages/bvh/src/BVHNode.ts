import { Rectangle } from '@pixi/math';
import type { BVHSplitAxis } from './BVHSplitAxis';

/**
 * @memberof PIXI
 * @class
 */
export class BVHNode
{
    public bounds: Rectangle;
    public children: BVHNode[];
    public splitAxis: BVHSplitAxis;
    public objectOffset: number;
    public objectCount: number;

    constructor()
    {
        /**
         * The union of this node's childrens' axis-aligned bounding boxes.
         * @member {PIXI.Rectangle}
         */
        this.bounds = new Rectangle();

        /**
         * The two children of this node.
         * @member {PIXI.BVHNode[]}
         */
        this.children = new Array(2);

        /**
         * The axis alonged which this node was split to get its children.
         * @member {PIXI.BVHSplitAxis}
         */
        this.splitAxis = null;

        /**
         * The index of the first object of this node in its tree's object array.
         * @member {number}
         */
        this.objectOffset = 0;

        /**
         * The number of objects in this node
         * @member {number}
         */
        this.objectCount = 0;
    }

    /**
     * @returns {boolean} whether this node is a leaf
     */
    isLeaf(): boolean
    {
        return !this.children[0] && !this.children[1];
    }

    /**
     * Builds a leaf `BVHNode` whose objects start at `offset` and with bounds `bounds`.
     *
     * @param {number} offset
     * @param {number} objects
     * @param {PIXI.Rectangle} bounds
     */
    resetLeaf(offset: number, objects: number, bounds: Rectangle): BVHNode
    {
        this.objectOffset = offset;
        this.bounds.copyFrom(bounds);

        this.children[0] = this.children[1] = null;
        this.objectCount = objects;

        return this;
    }

    /**
     * Builds a interior `BVHNode` whose children are `child0` and `child1` split along `splitAxis`.
     *
     * @param {PIXI.BVHSplitAxis} splitAxis
     * @param {PIXI.BVHNode} child0
     * @param {PIXI.BVHNode} child1
     */
    resetInterior(splitAxis: number, child0: BVHNode, child1: BVHNode): BVHNode
    {
        this.splitAxis = splitAxis;
        this.children[0] = child0;
        this.children[1] = child1;

        this.bounds.copyFrom(child0.bounds);
        this.bounds.enlarge(child1.bounds);

        return this;
    }
}
