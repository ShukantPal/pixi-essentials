import type { Rectangle } from '@pixi/math'

export interface AreaAllocator<N>
{
    readonly width: number;
    readonly height: number;

    allocate(width: number, height: number): Rectangle & N;
    free(area: N): void;
}