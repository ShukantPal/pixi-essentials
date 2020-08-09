import { Rectangle } from '@pixi/math';

/**
 * An object that can be represented by an axis-aligned bounding box
 *
 * @interface
 */
export declare interface Boundable {
    /**
     * @returns {PIXI.Rectangle} axis-aligned bounding box inside which this object exists
     */
    getBounds(): Rectangle;
}

/**
 * Iterator for circular linked-lists
 *
 * @example
 * const iterator = new CircularLinkedListIterator<Node>(startNode);
 *
 * while (!iterator.done)
 * {
 *      // Each node will be assigned to "value", including startNode
 *      const { value } = iterator.next();
 * }
 */
export declare class CircularLinkedListIterator<Node extends ILinkedListNode> implements Iterator<Node, Node, Node>
{
    current: Node;
    done: boolean;
    protected start: Node;
    constructor(node: Node);
    next(): IteratorResult<Node, Node>;
}

export declare interface ILinkedListNode {
    next: this;
    previous: this;
}

export { };
