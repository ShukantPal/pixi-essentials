(This package was never implemented - merely an idea :-)
# @pixi-essentials/ooo-renderer

This package implements a out-of-order rendering pipeline that improves batching efficiency in:
* scene graphs that use multiple shaders
* (not implemented) scene graphs heavily relying on filtering or masking

## Concept

The out-of-order renderer aims to dramatically increase batching efficiency in scene graphs that are drawn using multiple shaders. 

The traditional batch shader preserves the drawing order of display-objects by flushing out the object-buffer whenever an object is 
encountered that cannot be added to a batch. This results in very inefficient batching when objects drawn with different shaders are
interleaved throughout the scene graph. This is because, after every few objects, the batch renderer must flush itself.

The out-of-order renderer fixes this problem by creating one universal object renderer that handles all the different shader pipelines
for the scene graph. Instead of preserving  the drawing order, it preserves the local z-order of display-objects. Specifically, instead
of drawing each object in the same order, it will only ensure an object B that is on top of another object A will always be drawn after object A.
The z-orders of display-objects are inferred by intersecting their bounds with preceding object bounds. If object B intersects with a
preceding object A, then its z-order will one more than that of object A. If an object intersects with multiple other objects, then its 
z-order will always be one more than that of the maximum z-order in the intersections. If an object does not intersect at all, then its 
z-order will be zero.

## Under the hood

The out-of-order plugin maintains a list of display-object batches, which is updated on each `render` request. Each batch in one-pass by the
underlying batch plugin.

A display-object is put into the first same-plugin batch that occurs with or after all its z-dependencies. The z-dependencies are display-objects
that are "underneath" (i.e. bounds intersect & the display-object below occurs before in the scene).

The benefit of this is that display-objects are rendered in an order that optimizes batching efficiency.

### Example

In the scene below, there are two types of objects: cards and text. The cards are `PIXI.Graphics` objects while the text is drawn using a special
MSDF shader. Since each text object occurs after the card below, the default batch shader will never be able to group more than one card/text
together.

The out-of-order pipeline drastically optimizes this by rendering all the cards together, and then all the text together.

<img src="https://i.ibb.co/Pr0K15n/Screen-Shot-2020-07-11-at-1-23-37-PM.png"></img>

## Usage with multiple object renderers

This basic example demonstrates how to integrate your own batch-renderer plugin and Pixi's built-in batching plugin to
build an out-of-order pipeline:

```js
import * as PIXI from 'pixi.js;
import { OooRenderer } from '@pixi-essentials/ooo-renderer';
import { BatchRendererPluginFactory } from 'pixi-batch-renderer';
import { MSDFText } from './MSDFText';// HINT: This is the custom shaded display-object

function registerMSDFShader()
{
    const msdfRendererPlugin = BatchRendererPluginFactory.from({
        // HINT: You must generate the batch renderer plugin for the MSDF text
    });

    PIXI.Renderer.registerPlugin('textRenderer', msdfRendererPlugin);
}
function registerOooPipeline()
{
    const oooPipelinePlugin = OooRenderer;

    PIXI.Renderer.registerPlugin('ooo', oooPipelinePlugin);
}

registerMSDFShader();
registerOooPipeline();

const app = new PIXI.Application({
    width: 800,
    height: 600
});
const stage = app.stage;

document.body.appendChild(app.view);

for (let i = 0; i < 4; i++)
{
    for (let j = 0; j < 3; j++)
    {
        const x = 160 * i;
        const y = 200 * j;

        const cardBackground = new PIXI.Graphics()
            .beginFill(0xff0000)
            .drawRect(10, 10, 140, 180)
            .endFill();
        const text = new MSDFText("MSDF Text");
        const container = new PIXI.Container();

        container.addChild(cardBackground, text);
        container.position.set(x, y);
        text.position.set(70, 95);

        stage.addChild(container);

        cardBackground.pluginName = "ooo";
        text.pluginName = "ooo";
    }
}
```
