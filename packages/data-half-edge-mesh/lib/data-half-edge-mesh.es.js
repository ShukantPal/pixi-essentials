/* eslint-disable */
 
/*!
 * @pixi-essentials/data-half-edge-mesh - v1.0.2
 * Compiled Thu, 20 Aug 2020 23:24:32 UTC
 *
 * @pixi-essentials/data-half-edge-mesh is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 * 
 * Copyright 2019-2020, Shukant K. Pal, All Rights Reserved
 */
/**
 * Iterator for traversing over the edges forming a loop around a face. It loops in the counterclockwise
 * direction.
 *
 * In order to guarantee that each edge is encountered only once, the face's edge list not be modified.
 *
 * You can get the shared iterator of a {@code Face}: `face[Symbol.iterator]`
 */
class EdgeLoopIterator {
    /**
     * @param face - the face around which to iterate
     */
    constructor(face) {
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
    next() {
        if (!this.current) {
            this.current = this.face.anEdge;
        }
        else if (this.current.next !== this.face.anEdge) {
            this.current = this.current.next;
        }
        else {
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
    reset() {
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
class Face {
    constructor(data) {
        this.data = data;
    }
    connect(edge) {
        this.anEdge = edge;
        return this;
    }
    [Symbol.iterator]() {
        if (!this._edgeLoopIterator) {
            this._edgeLoopIterator = new EdgeLoopIterator(this);
        }
        return this._edgeLoopIterator;
    }
}

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
class HalfEdge {
    constructor(data) {
        this.data = data;
        this._onext = this;
    }
    connect(origin, twin, leftFace) {
        this._origin = origin;
        this._twin = twin;
        this._leftFace = leftFace;
        return this;
    }
    get previous() {
        return this._twin.next;
    }
    /**
     * The origin vertex
     */
    get org() {
        return this._origin;
    }
    /**
     * The destination vertex
     */
    get dst() {
        return this._twin._origin;
    }
    /**
     * The next edge sharing {@code this.dst} in the counterclockwise direction.
     */
    get dnext() {
        return this.rnext.twin;
    }
    /**
     * The last edge sharing {@code this.dst} in the counterclockwise direction.
     */
    get dlast() {
        return this.lnext.twin;
    }
    /**
     * The next edge sharing {@code this.org} in the counterclockwise direction.
     */
    get onext() {
        return this._onext;
    }
    /**
     * The previous edge sharing {@code this.org} in the counterclockwise direction. It is also
     * the next edge in the clockwise direction.
     */
    get oprev() {
        return this.twin.lnext;
    }
    /**
     * The next edge on the left face (pointing counterclockwise direction).
     *
     * {@code this.lnext}'s origin vertex is this edge's destination vertex.
     */
    get lnext() {
        return this._lnext;
    }
    /**
     * The previous edge on the left face (pointing counterclockwise direction).
     *
     * {@code this.lprev}'s destination vertex is this edge's origin vertex.
     */
    get lprev() {
        return this._onext.twin;
    }
    /**
     * The next edge on the right face in counterclockwise direction; however, this and {@code this.rnext}
     * are directed in the clockwise direction of the right face.
     *
     * {@code this.rnext}'s destination vertex is this edge's origin vertex.
     */
    get rnext() {
        return this.oprev.twin;
    }
    /**
     * The next edge on the right face in counterclockwise direction; however, this and {@code this.rlast}
     * are directed in the clockwise direction of the right face.
     *
     * {@code this.rlast}'s origin vertex is this edge's destination vertex.
     */
    get rlast() {
        return this.twin.onext;
    }
    /**
     * The half-edge directed from {@code this.dst}.
     */
    get twin() {
        return this._twin;
    }
    /**
     * The face on the left side of this edge. This edge is oriented counterclockwise to its left face.
     */
    get leftFace() {
        return this._leftFace;
    }
    /**
     * The face on the right side of this edge. This edge is oriented clockwise to its right face.
     */
    get rightFace() {
        return this._twin.leftFace;
    }
}

/**
 *
 */
class Vertex {
    constructor(data) {
        this.data = data;
    }
    connect(edge) {
        this.anEdge = edge;
        return this;
    }
}

export { EdgeLoopIterator, Face, HalfEdge, Vertex };
//# sourceMappingURL=data-half-edge-mesh.es.js.map
