import * as PIXI from 'pixi.js';

export class OutOfOrderRenderer extends PIXI.ObjectRenderer
{
    private _bufferedObjects: Array<PIXI.DisplayObject>;

    constructor(renderer: PIXI.Renderer)
    {
        super(renderer);

        this._bufferedObjects = [];
    }
}
