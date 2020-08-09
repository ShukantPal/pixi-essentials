import type { ILinkedListNode } from '@pixi-essentials/types';
import type { Vertex } from './Vertex';
import type { Face } from './Face';

/**
 * A directed edge from its origin to destination.
 *
 * {@code HalfEdge} is a node of the following circular linked-lists:
 *  + the list of edges in the whole mesh: {@link HalfEdge#next}
 *  + the list of edges around its left face: {@link HalfEdge#lnext}
 *  + the list of edges directed from its origin vertex: {@link HalfEdge#onext}
 *  + the list of edges directed to its destination vertex: {@link HalfEdge#dnext}
 *  + the list of edges around its right face: {@link HalfEdge#rnext}
 */
export class HalfEdge<V = any, E = any, F = any> implements ILinkedListNode
{
    next: this;

    _lnext: this;
    _onext: this;

    _origin: Vertex<V, E, F>;
    _twin: HalfEdge<V, E, F>;
    _leftFace: Face<V, E, F>;

    data: E;

    constructor(data?: E)
    {
        this.data = data;

        this._onext = this;
    }

    connect(origin: Vertex<V, E, F>, twin: HalfEdge, leftFace?: Face): this
    {
        this._origin = origin;
        this._twin = twin;
        this._leftFace = leftFace;

        return this;
    }

    get previous(): HalfEdge<V, E, F>
    {
        return this._twin.next;
    }

    /**
     * The origin vertex
     */
    get org(): Vertex<V, E, F>
    {
        return this._origin;
    }

    /**
     * The destination vertex
     */
    get dst(): Vertex<V, E, F>
    {
        return this._twin._origin;
    }

    /**
     * The next edge sharing {@code this.dst} in the counterclockwise direction.
     */
    get dnext(): HalfEdge<V, E, F>
    {
        return this.rnext.twin;
    }

    /**
     * The last edge sharing {@code this.dst} in the counterclockwise direction.
     */
    get dlast(): HalfEdge<V, E, F>
    {
        return this.lnext.twin;
    }

    /**
     * The next edge sharing {@code this.org} in the counterclockwise direction.
     */
    get onext(): HalfEdge<V, E, F>
    {
        return this._onext;
    }

    /**
     * The previous edge sharing {@code this.org} in the counterclockwise direction. It is also
     * the next edge in the clockwise direction.
     */
    get oprev(): HalfEdge<V, E, F>
    {
        return this.twin.lnext;
    }

    /**
     * The next edge on the left face (pointing counterclockwise direction).
     *
     * {@code this.lnext}'s origin vertex is this edge's destination vertex.
     */
    get lnext(): HalfEdge<V, E, F>
    {
        return this._lnext;
    }

    /**
     * The previous edge on the left face (pointing counterclockwise direction).
     *
     * {@code this.lprev}'s destination vertex is this edge's origin vertex.
     */
    get lprev(): HalfEdge<V, E, F>
    {
        return this._onext.twin;
    }

    /**
     * The next edge on the right face in counterclockwise direction; however, this and {@code this.rnext}
     * are directed in the clockwise direction of the right face.
     *
     * {@code this.rnext}'s destination vertex is this edge's origin vertex.
     */
    get rnext(): HalfEdge<V, E, F>
    {
        return this.oprev.twin;
    }

    /**
     * The next edge on the right face in counterclockwise direction; however, this and {@code this.rlast}
     * are directed in the clockwise direction of the right face.
     *
     * {@code this.rlast}'s origin vertex is this edge's destination vertex.
     */
    get rlast(): HalfEdge<V, E, F>
    {
        return this.twin.onext;
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
