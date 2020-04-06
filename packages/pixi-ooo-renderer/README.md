# [WIP][Experimental] Out-of-Order Renderer for PixiJS Scene Graphs

This special renderer can improve batching efficiency by using a spatial
hash.

`OooRenderer` also does not need to prematurely flush when a filtered or masked
display-object is rendered, unlike Pixi's in-built batch renderer. You can enable
this by calling `Oooable` on your display-object or extending `OooRenderable`. This
modifies the `render()` pass to be ooo-compatible.

## Basic Usage

The following example will setup the built-in preset of `OooRenderer` and demonstrate
how it can batch the 1st and 3rd sprite together even with a filtered sprite between
them in the rendering list:

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
app.stage.addChild(spriteWithFilters);

app.stage.addChild(createOooSprite('./assets/bar.png));
```
