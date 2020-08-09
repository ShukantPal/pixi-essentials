import { HalfEdge } from './HalfEdge';

import type { IDoublyLinkedListNode } from '@pixi-essentials/types';

/**
 * Iterator for traversing over the edges forming a loop around a face. It loops in the counterclockwise
 * direction.
 *
 * In order to guarantee that each edge is encountered only once, the face's edge list not be modified.
 *
 * You can get the shared iterator of a {@code Face}: `face[Symbol.iterator]`
 */
export class EdgeLoopIterator<V, E, F> implements Iterator<HalfEdge<V, E, F>, HalfEdge<V, E, F>>
{
    protected current: HalfEdge;
    protected face: Face;
    protected done: boolean;

    /**
     * @param face - the face around which to iterate
     */
    constructor(face: Face<V, E, F>)
    {
        /**
         * The last half-edge returned by {@code this.next}.
         */
        this.current = null;

        /**
         * The face this iterator will iterate over.
         */
        this.face = face;

        /**
         * Whether this iterator has looped over all the edges of {@code this.face}.
         */
        this.done = false;
    }

    /**
     * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Iterators_and_Generators#Iterators
     */
    next(): IteratorResult<HalfEdge<V, E, F>, HalfEdge<V, E, F>>
    {
        if (!this.current)
        {
            this.current = this.face.anEdge;
        }
        else if (this.current.next !== this.face.anEdge)
        {
            this.current = this.current.next;
        }
        else
        {
            this.current = null;
            this.done = true;
        }

        return {
            value: this.current,
            done: this.done,
        };
    }

    /**
     * Reset this iterator so it can be used from start.
     */
    reset(): this
    {
        this.current = null;
        this.done = false;

        return this;
    }
}

/**
 * A face is bounded by a loop of edges.
 *
 * You can use a for..of loop to iterate over the edges looping around this face:
 * ```js
 * // Loops in counterclockwise direction
 * for (const edge of face)
 * {
 *     assert(edge.leftFace === face);
 * }
 * ```
 */
export class Face<V = any, E = any, F = any> implements IDoublyLinkedListNode, Iterable<HalfEdge<V, E, F>>
{
    public next: this;
    public previous: this;

    anEdge: HalfEdge<V, E, F>;

    data: F;

    private _edgeLoopIterator: EdgeLoopIterator<V, E, F>;

    constructor(data?: F)
    {
        this.data = data;
    }

    connect(edge: HalfEdge<V, E, F>): this
    {
        this.anEdge = edge;

        return this;
    }

    [Symbol.iterator](): Iterator<HalfEdge<V, E, F>, any, undefined>
    {
        if (!this._edgeLoopIterator)
        {
            this._edgeLoopIterator = new EdgeLoopIterator(this);
        }

        return this._edgeLoopIterator;
    }
}
