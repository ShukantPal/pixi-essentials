/* eslint-disable */
 
/*!
 * @pixi-essentials/types - v0.0.2
 * Compiled Mon, 17 Aug 2020 15:35:55 UTC
 *
 * @pixi-essentials/types is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 * 
 * Copyright 2019-2020, Shukant K. Pal, All Rights Reserved
 */
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
class CircularLinkedListIterator {
    constructor(node) {
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
    next() {
        if (this.current === null) {
            this.current = this.start;
        }
        else if (this.current.next !== this.start) {
            this.current = this.current.next;
        }
        else {
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
    reset(start = this.start) {
        this.current = null;
        this.done = false;
        this.start = start;
        return this;
    }
}
/**
 * An iterable circular linked-list data structure.
 */
class CircularLinkedList {
    constructor(head) {
        this.head = head;
    }
    [Symbol.iterator]() {
        if (!this._sharedIterator) {
            this._sharedIterator = new CircularLinkedListIterator(this.head);
        }
        this._sharedIterator.reset(this.head);
        return this._sharedIterator;
    }
}
class CircularDoublyLinkedList {
    constructor(head) {
        this.head = head;
    }
    /**
     * Adds {@code node} into this list before {@code nodeAfter}.
     *
     * @param node - the node to be added to this list
     * @param nodeAfter - the node that should come after the added node
     */
    add(node, nodeAfter = this.head) {
        // Initialize node's pointers first!
        node.next = nodeAfter;
        node.previous = nodeAfter.previous;
        nodeAfter.previous = node;
        return this;
    }
    forEach(callback) {
        const head = this.head;
        let current = head;
        do {
            callback(current);
            current = current.next;
        } while (current !== head);
    }
    [Symbol.iterator]() {
        if (!this._sharedIterator) {
            this._sharedIterator = new CircularLinkedListIterator(this.head);
        }
        this._sharedIterator.reset(this.head);
        return this._sharedIterator;
    }
}

export { CircularDoublyLinkedList, CircularLinkedList, CircularLinkedListIterator };
//# sourceMappingURL=types.es.js.map
