import { HalfEdge } from './HalfEdge';

import type { IDoublyLinkedListNode } from '@pixi-essentials/types';

export class Face<V = any, E = any, F = any> implements IDoublyLinkedListNode
{
    public next: this;
    public previous: this;

    anEdge: HalfEdge<V, E, F>;

    data: F;

    constructor(data: F)
    {
        this.data = data;
    }
}
