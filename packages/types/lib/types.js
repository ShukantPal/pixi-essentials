/*!
 * @pixi-essentials/types - v0.0.1-alpha.0
 * Compiled Sun, 09 Aug 2020 15:59:00 UTC
 *
 * @pixi-essentials/types is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 * 
 * Copyright 2019-2020, Shukant K. Pal, All Rights Reserved
 * 
 */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

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

exports.CircularLinkedList = CircularLinkedList;
exports.CircularLinkedListIterator = CircularLinkedListIterator;
//# sourceMappingURL=types.js.map
