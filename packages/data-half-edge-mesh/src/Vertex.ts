import type { IDoublyLinkedListNode } from '@pixi-essentials/types';
import type { HalfEdge } from './HalfEdge';

/**
 *
 */
export class Vertex<V = any, E = any, F = any> implements IDoublyLinkedListNode
{
    public next: this;
    public previous: this;

    public anEdge: HalfEdge<V, E, F>;

    public data: V;

    constructor(data: V)
    {
        this.data = data;
    }
}
