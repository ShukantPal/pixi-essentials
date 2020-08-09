import { CircularLinkedListIterator, CircularLinkedList } from '@pixi-essentials/types';

import { Face } from './Face';
import { HalfEdge } from './HalfEdge';
import { Vertex } from './Vertex';

import { assert } from 'assert';

type VertexData<V> = V;
type EdgeData<E> = E;
type FaceData<F> = F;

/**
 *
 */
export class Mesh<V = any, E = any, F = any>
{
    protected readonly _faces: CircularLinkedList<Face<VertexData<V>, EdgeData<E>, FaceData<F>>>;
    protected readonly _edges: CircularLinkedList<HalfEdge<VertexData<V>, EdgeData<E>, FaceData<F>>>;
    protected readonly _edgeTwins: CircularLinkedList<HalfEdge<VertexData<V>, EdgeData<E>, FaceData<F>>>;
    protected readonly _vertices: CircularLinkedList<Vertex<VertexData<V>, EdgeData<E>, FaceData<F>>>;

    private _faceIterator: CircularLinkedListIterator<Face<VertexData<V>, EdgeData<E>, FaceData<F>>>;
    private _edgeIterator: CircularLinkedListIterator<HalfEdge<VertexData<V>, EdgeData<E>, FaceData<F>>>;
    private _vertexIterator: CircularLinkedListIterator<Vertex<VertexData<V>, EdgeData<E>, FaceData<F>>>;

    constructor()
    {
        this._faces = new CircularLinkedList(new Face(null));
        this._edges = new CircularLinkedList(new HalfEdge(null));
        this._vertices = new CircularLinkedList(new Vertex(null));

        // Pair _edgeHead chain with _edgeHeadTwin chain
        this._edgeHead.bind(this._edgeHeadTwin);
    }

    /**
     * Returns the shared face iterator for this mesh.
     *
     * CONTRACT: It is expected that the caller does not hold a reference to the iterator after immediate use.
     */
    sharedFaceIterator(): CircularLinkedListIterator<Face<VertexData<V>, EdgeData<E>, FaceData<F>>>
    {
        if (!this._faceIterator)
        {
            this._faceIterator = new CircularLinkedListIterator(this._faces.head);
        }

        return this._faceIterator.reset();
    }

    /**
     * Returns the shared edge iterator for this mesh.
     *
     * CONTRACT: It is expected that the caller does not hold a reference to the iterator after immediate use.
     */
    sharedEdgeIterator(): CircularLinkedListIterator<HalfEdge<VertexData<V>, EdgeData<E>, FaceData<F>>>
    {
        if (!this._edgeIterator)
        {
            this._edgeIterator = new CircularLinkedListIterator(this._edges.head);
        }

        return this._edgeIterator.reset();
    }

    /**
     * Returns the shared vertex iterator for this mesh.
     *
     * CONTRACT: It is expected that the caller does not hold a reference to the iterator after immediate use.
     */
    sharedVertexIterator(): CircularLinkedListIterator<Vertex<VertexData<V>, EdgeData<E>, FaceData<F>>>
    {
        if (!this._vertexIterator)
        {
            this._vertexIterator = new CircularLinkedListIterator(this._vertices.head);
        }

        return this._vertexIterator.reset();
    }

    /**
     * Validates the mesh and checks whether the following invariants hold true:
     *  + {@code eachEdge.next.twin.next === eachEdge}
     */
    validate(): void
    {
        // Validate face list

        for (const face of this._faces)
        {
            assert(face.previous.next === face, 'face.previous.next === face');
            assert(face.next.previous === face, 'face.next.previous === face');
        }
    }
}
