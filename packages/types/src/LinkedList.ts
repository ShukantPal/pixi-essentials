/**
 * A node in a linked-list data-structure.
 */
export interface ILinkedListNode
{
    /**
     * The next node in the linked-list.
     */
    next: this;
}

/**
 * A node in a doubly linked-list data structure.
 */
export interface IDoublyLinkedListNode extends ILinkedListNode
{
    previous: this;
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
export class CircularLinkedListIterator<Node extends ILinkedListNode> implements Iterator<Node, Node, Node>
{
    public current: Node;
    public done: boolean;

    protected start: Node;

    constructor(node: Node)
    {
        /**
         * The last node returned by {@code this.next}.
         */
        this.current = null;

        /**
         * Whether the iterator has finished iterating over all elements.
         */
        this.done = false;

        /**
         * The first node occurring in this iteration.
         */
        this.start = node;
    }

    /**
     * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Iterators_and_Generators#Iterators
     */
    next(): IteratorResult<Node, Node>
    {
        if (this.current === null)
        {
            this.current = this.start;
        }
        else if (this.current.next !== this.start)
        {
            this.current = this.current.next;
        }
        else
        {
            // this.current.next === this.start, so we are done here
            this.current = null;
            this.done = true;
        }

        return {
            value: this.current,
            done: this.done,
        };
    }

    /**
     * Reset the iterator so it can be used again.
     */
    reset(start: Node = this.start): this
    {
        this.current = null;
        this.done = false;
        this.start = start;

        return this;
    }
}

/**
 * An iterable circular linked-list data structure.
 */
export class CircularLinkedList<Node extends ILinkedListNode> implements Iterable<Node>
{
    public head: Node;

    private _sharedIterator: CircularLinkedListIterator<Node>;

    constructor(head: Node)
    {
        this.head = head;
    }

    [Symbol.iterator](): Iterator<Node, Node, Node>
    {
        if (!this._sharedIterator)
        {
            this._sharedIterator = new CircularLinkedListIterator(this.head);
        }

        this._sharedIterator.reset(this.head);

        return this._sharedIterator;
    }
}
