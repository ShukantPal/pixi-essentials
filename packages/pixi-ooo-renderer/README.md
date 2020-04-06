# [WIP][Experimental] Out-of-Order Renderer for PixiJS Scene Graphs

This packages provides an out-of-order batch renderer, which:

* can improve batching efficiency by smartly re-ordering your display-object renders
to minimize draw calls. This can be done because display-objects that do not intersect
in world space do not need to be rendered in-order.

* does not need to prematurely flush when a filtered or masked
display-object is encountered, unlike Pixi's in-built batch renderer. Instead of doing
a full-flush, this renderer will only flush the display objects that intersect with
the filtered/masked one.

## Basic Usage

The following example will setup a built-in preset of the out-of-order renderer:

```js
import * as PIXI from 'pixi.js;
import { Oooable, OooRendererPluginFactory } from 'pixi-ooo-renderer';
import { DropShadowFilter } from '@pixi/filter-drop-shadow';

// Create a sprite that will render using the ooo-renderer instead of
// default batching mechanism in PixiJS.
//
// OooMixin allows the OooRenderer to redirect the filter/mask mechanism
// if used.
function createOooSprite(textureOrUrl) {
    const sprite = Oooable(typeof textureOrUrl === 'string' 
        ? PIXI.Sprite.from(textureOrUrl) 
        : new PIXI.Sprite(textureOrUrl));

    sprite.pluginName = 'ooo';
    return sprite;
}

// Register out-of-order renderer plugin. The default preset was made
// for rendering Sprite, Mesh, Graphics (PixiJS built-in display-object).
//
// For custom-tailored display objects, you can use the OooRendererPluginFactory
// API to define your own rendering pipeline.
PIXI.Renderer.registerPlugin('ooo', OooRendererPluginFactory.create({
    preset: 'built-in'    
}))

const app = new PIXI.Application({ /* options */ });

app.stage.addChild(createOooSprite('./assets/foo.png'));

// If you used Pixi's default batch renderer, then foo.png and bar.png
// wouldn't get batched. That is because of a sprite with filters comes
// in-between.
//
// The OooRenderer modifies the filter system to clear the depth buffer
// on the screen after the sprite is rendered.
const spriteWithFilters = createOooSprite('./assets/foobar.png');
spriteWithFilters.filters = [new DropShadowFilter()];
spriteWithFilters.position.set(100, 350);// away from sprite 1 and 3
app.stage.addChild(spriteWithFilters);

app.stage.addChild(createOooSprite('./assets/bar.png));
```
