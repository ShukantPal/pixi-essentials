import { ObjectRenderer, Renderer } from '@pixi/core';

export class InstancedRenderer extends ObjectRenderer
{
    constructor(renderer: Renderer)
    {
        super(renderer);
    }
}

export interface IInstancedRendererOptions
{
    geometryProperty: string;
}
