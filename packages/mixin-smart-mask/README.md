# @pixi-essentials/smart-mask

This package is a mixin for `DisplayObject` that optimizes mask rendering. It is used to prevent masking when the contents of a
display-object already lie inside the mask's bounds.

## Usage

In order for to use smart-masks, you must set masks on the `smartMask` property of display-objects instead; before each rendering
frame, you must call `updateSmartMask` to re-evalulate which masks are essential for rendering correctly.

```js
import * as PIXI from 'pixi.js';
import '@pixi-essentials/mixin-smart-mask';

const app = new PIXI.Application();

const maskedContainer = new PIXI.Container();
const mask = new PIXI.Graphics().drawRect(0, 0, 100, 100);
const child = new PIXI.Graphics().beginFill(0xff).drawRect(0, 0, 50, 50).endFill();

maskedContainer.addChild(mask, child);

// Set smartMask instead of mask
maskedContainer.smartMask = mask;

/*
 * Before rendering your scene each frame, you must update the smart-masks.
 */
app.renderer.on('prerender', function() {
    /* 
     * This will recalculate the world transforms in the scene graph. You don't need to do this if you
     * are already doing it somewhere else OR you could pass skipUpdate=false to updateSmartMask() instead.
     */
    app.stage.getBounds();

    /*
     * This will set display-object masks only if they are required, based on whether their smart-mask bounds cover
     * their contents fully.
     */
    app.stage.updateSmartMask();
});

/*
 * Since the 50x50 child lies entirely inside the 100x100 mask, updateSmartMask() will not set the mask of the
 * masked-container.
 */
```
