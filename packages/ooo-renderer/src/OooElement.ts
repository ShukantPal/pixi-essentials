import { DisplayObject, Rectangle } from 'pixi.js';

export class OooElement
{
    public displayObject: DisplayObject;
    public pluginName: string;

    public batchIndex: number;
    public zIndex: number;
    public zDependencies: Array<OooElement>;

    getBounds(): Rectangle
    {
        return this.displayObject.getBounds(true);
    }
}
