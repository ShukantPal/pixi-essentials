import type { ILinkedListNode } from '@pixi-essentials/types';
import type { Vertex } from './Vertex';
import type { Face } from './Face';

/**
 * A directed edge from its origin to destination.
 */
export class HalfEdge<V = any, E = any, F = any> implements ILinkedListNode
{
    next: this;

    _origin: Vertex<V, E, F>;
    _twin: HalfEdge<V, E, F>;
    _leftFace: Face<V, E, F>;

    data: E;

    constructor(data: E)
    {
        this.data = data;
    }

    bind(twin: HalfEdge, leftFace?: Face): this
    {
        this._twin = twin;
        this._leftFace = leftFace;

        return this;
    }

    get previous(): HalfEdge<V, E, F>
    {
        return this._twin.next;
    }

    get org(): Vertex<V, E, F>
    {
        return this._origin;
    }

    get dst(): Vertex<V, E, F>
    {
        return this._twin._origin;
    }

    /**
     * The half-edge directed from {@code this.dst}.
     */
    get twin(): HalfEdge<V, E, F>
    {
        return this._twin;
    }

    /**
     * The face on the left side of this edge. This edge is oriented counterclockwise to its left face.
     */
    get leftFace(): Face<V, E, F>
    {
        return this._leftFace;
    }

    /**
     * The face on the right side of this edge. This edge is oriented clockwise to its right face.
     */
    get rightFace(): Face<V, E, F>
    {
        return this._twin.leftFace;
    }
}

export class FaceIterator implements Iterator<HalfEdge, HalfEdge, HalfEdge>
{

}
