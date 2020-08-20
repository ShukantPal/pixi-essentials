# @pixi-essentials/cull

This package provides an optimized, highly configurable culling mechanism.

## Installation :package:

```bash
npm install @pixi-essentials/cull
```

## Usage :page_facing_up:

### Static scenes

If display-object's in your scene graph do not change each frame, then you can run culling whenever
your display-object's move or your scene graph changes.

```ts
import { Application } from 'pixi.js';
import { Cull } from '@pixi-essentials/cull';
import { Viewport } from 'pixi-viewport';

const app = new Application({  });
const renderer = app.renderer;
const viewport = initScene(new Viewport());
const cull = new Cull().addAll(viewport.children);

// Flags whether culling, should be set "true" when a child is added to the viewport's subtree.
let cullDirty = false;

viewport.on('frame-end', function() {
    if (viewport.dirty || cullDirty) {
        cull.cull(renderer.screen);

        viewport.dirty = false;
        cullDirty = false;
    }
})
```

### Dynamic scenes

If your scene graph is dynamic and/or changes across frames cannot be tracked, you can run culling
on the `prerender` event.

```ts
renderer.on('prerender', () => {
    cull.cull(renderer.screen);
})
```

### Multiple scene graphs

If you are rendering multiple panes on to the canvas, each with its own scene graph, using different
projections, then you need to use separate culls for each scene graph.

```ts
cull.cull(sourceFrame);
```
