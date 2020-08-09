import assert from 'assert';
import { CircularLinkedListIterator, CircularDoublyLinkedList } from '@pixi-essentials/types';
import { Face } from './Face';
import { HalfEdge } from './HalfEdge';
import { Vertex } from './Vertex';

/**
 *
 */
export class Mesh<V = any, E = any, F = any>
{
    protected readonly faceList: CircularDoublyLinkedList<Face<V, E, F>>;
    protected readonly edgeList: CircularDoublyLinkedList<HalfEdge<V, E, F>>;
    protected readonly edgeTwinList: CircularDoublyLinkedList<HalfEdge<V, E, F>>;
    protected readonly vertexList: CircularDoublyLinkedList<Vertex<V, E, F>>;

    private _faceIterator: CircularLinkedListIterator<Face<V, E, F>>;
    private _edgeIterator: CircularLinkedListIterator<HalfEdge<V, E, F>>;
    private _vertexIterator: CircularLinkedListIterator<Vertex<V, E, F>>;

    constructor()
    {
        this.faceList = new CircularDoublyLinkedList(new Face(null));
        this.edgeList = new CircularDoublyLinkedList(new HalfEdge(null));
        this.edgeTwinList = new CircularDoublyLinkedList(new HalfEdge(null));
        this.vertexList = new CircularDoublyLinkedList(new Vertex(null));

        // Pair _edgeHead chain with _edgeHeadTwin chain
        // NOTE: Head edges are dummies and not connected to vertices, faces
        this.edgeList.head.connect(null, this.edgeTwinList.head);
        this.edgeTwinList.head.connect(null, this.edgeList.head);
    }

    /**
     * Creates a degenerate (one-point loop) face and adds it to this mesh.
     *
     * @param data - the data associated with the face, if any
     * @return the newly created degenerate face
     */
    addDegenerateFace(data?: F): Face<V, E, F>
    {
        const origin = new Vertex<V, E, F>(null);

        const edge = new HalfEdge<V, E, F>(null);
        const twinEdge = new HalfEdge<V, E, F>(null);
        const face = new Face<V, E, F>(data);

        // Pair half-edges, connect to vertices & faces
        edge.connect(origin, twinEdge, face);
        twinEdge.connect(origin, edge, face);

        // Connect vertices to edges
        origin.connect(edge);

        // Connect face to edge loop
        face.connect(edge);

        // Insert into mesh lists
        this.faceList.add(face);
        this.edgeList.add(edge);
        this.edgeTwinList.add(twinEdge);
        this.vertexList.add(origin);

        return face;
    }

    // addPolygonalFace(vertexData?: V[])

    /**
     * Adds a vertex to {@code face} by splitting the last edge.
     *
     * @param face
     * @param vertexData
     * @param edgeData
     */
    addVertex(face: Face<V, E, F>, vertexData?: V, edgeData?: E): void
    {
        const edge = new HalfEdge<V, E, F>(edgeData);
        const vertex = new Vertex<V, E, F>(vertexData);
    }

    /**
     * Returns the shared face iterator for this mesh. The first face is a dummy.
     *
     * CONTRACT: It is expected that the caller does not hold a reference to the iterator after immediate use.
     */
    sharedFaceIterator(): CircularLinkedListIterator<Face<V, E, F>>
    {
        if (!this._faceIterator)
        {
            this._faceIterator = new CircularLinkedListIterator(this.faceList.head);
        }

        return this._faceIterator.reset();
    }

    /**
     * Returns the shared edge iterator for this mesh. The first edge is a dummy.
     *
     * CONTRACT: It is expected that the caller does not hold a reference to the iterator after immediate use.
     */
    sharedEdgeIterator(): CircularLinkedListIterator<HalfEdge<V, E, F>>
    {
        if (!this._edgeIterator)
        {
            this._edgeIterator = new CircularLinkedListIterator(this.edgeList.head);
        }

        return this._edgeIterator.reset();
    }

    /**
     * Returns the shared vertex iterator for this mesh. The first vertex is a dummy.
     *
     * CONTRACT: It is expected that the caller does not hold a reference to the iterator after immediate use.
     */
    sharedVertexIterator(): CircularLinkedListIterator<Vertex<V, E, F>>
    {
        if (!this._vertexIterator)
        {
            this._vertexIterator = new CircularLinkedListIterator(this.vertexList.head);
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

        for (const face of this.faceList)
        {
            assert(face.previous.next === face, 'face.previous.next === face');
            assert(face.next.previous === face, 'face.next.previous === face');

            for (const edge of face)
            {
                assert(!!edge);

                assert(edge.twin !== edge);
                assert(edge.twin.twin === edge);
            }
        }
    }
}
