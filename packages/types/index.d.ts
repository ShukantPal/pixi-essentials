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

export declare class CircularDoublyLinkedList<Node extends IDoublyLinkedListNode> implements Iterable<Node> {
    head: Node;
    private _sharedIterator;
    constructor(head: Node);
    /**
     * Adds {@code node} into this list before {@code nodeAfter}.
     *
     * @param node - the node to be added to this list
     * @param nodeAfter - the node that should come after the added node
     */
    add(node: Node, nodeAfter?: Node): this;
    forEach(callback: (node: Node) => any): void;
    [Symbol.iterator](): Iterator<Node, Node, Node>;
}

/**
 * An iterable circular linked-list data structure.
 */
export declare class CircularLinkedList<Node extends ILinkedListNode> implements Iterable<Node> {
    head: Node;
    private _sharedIterator;
    constructor(head: Node);
    [Symbol.iterator](): Iterator<Node, Node, Node>;
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
export declare class CircularLinkedListIterator<Node extends ILinkedListNode> implements Iterator<Node, Node, Node> {
    current: Node;
    done: boolean;
    protected start: Node;
    constructor(node: Node);
    /**
     * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Iterators_and_Generators#Iterators
     */
    next(): IteratorResult<Node, Node>;
    /**
     * Reset the iterator so it can be used again.
     */
    reset(start?: Node): this;
}

/**
 * A node in a doubly linked-list data structure.
 */
export declare interface IDoublyLinkedListNode extends ILinkedListNode {
    previous: this;
}

/**
 * A node in a linked-list data-structure.
 */
export declare interface ILinkedListNode {
    /**
     * The next node in the linked-list.
     */
    next: this;
}

export { }
