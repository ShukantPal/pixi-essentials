import * as PIXI from 'pixi.js';
import { OooPipeline } from './OooPipeline';

const builtInPreset = new OooPipeline();

export function autoDetectPreset(displayObject: PIXI.DisplayObject): OooPipeline
{
    if (displayObject instanceof PIXI.Sprite
            || displayObject instanceof PIXI.Graphics
            || displayObject instanceof PIXI.Mesh)
    {
        return builtInPreset;
    }

    return null;
}
