/*!
 * @pixi-essentials/types - v0.0.1-alpha.0
 * Compiled Sun, 09 Aug 2020 02:07:48 UTC
 *
 * @pixi-essentials/types is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 * 
 * Copyright 2019-2020, Shukant K. Pal, All Rights Reserved
 * 
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
var CircularLinkedListIterator = /** @class */ (function () {
    function CircularLinkedListIterator(node) {
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
    CircularLinkedListIterator.prototype.next = function () {
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
    };
    return CircularLinkedListIterator;
}());

export { CircularLinkedListIterator };
//# sourceMappingURL=types.mjs.map
