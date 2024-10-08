import type { Rectangle } from 'pixi.js';

/**
 * @public
 * @typeParam N - The internal property for marking rectangles.
 */
export interface AreaAllocator<N>
{
    readonly width: number;
    readonly height: number;

    allocate(width: number, height: number): Rectangle & N;
    free(area: N): void;
}
