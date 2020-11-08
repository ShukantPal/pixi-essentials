# @pixi-essentials/texture-allocator

This package implements a slab-based texture allocator. It aims to help improve texture batching efficiency by
generating atlases on-the-fly. You can allocate and free texture space on demand. The following implementations
are provided:

* TextureAllocator: This generic allocator issues texture that are not backed by any resource. You must handle
resource management yourself.
* AtlasAllocator: This allocator can be used to issue image/canvas/bitmap- backed textures. Each image item is
uploaded separately with a `texSubImage2D` call.
* CanvasTextureAllocator: This allocator creates texture slabs backed by a canvas. You can draw to that canvas
(`texture.baseTexture.resource.source.getContext('2d')`) to draw each texture.
* RenderTextureAllocator: This allocator issues render-textures. Since you render directly into the render-texture,
it requires no resource management.

## Installation :package:

```bash
npm install @pixi-essentials/texture-allocator
```

## Usage :page_facing_up:

### AtlasAllocator

```ts
import { AtlasAllocator } from '@pixi-essentials/texture-allocator';

// Create an atlas allocator
const allocator = new AtlasAllocator();

// Create an image-source
const image = document.createElement('img');

// Load the image
image.src = "example.com/example.jpg";

// After the image loads, create the texture. You must do this *after* the image is loaded so you know the
// width and height needed. Also, the atlas resource requires the image to be loaded; otherwise, it will
// forget to re-upload once it does load.
image.onload = function() {
    // Find the dimensions of the texture. Make sure this is less than 2048x2048, otherwise the allocator
    // will fail to issue a texture.
    const { naturalWidth, naturalHeight } = image;

    // Allocate the texture. Edge padding is included by default.
    const texture = allocator.allocate(naturalWidth, naturalHeight);

    // Use the texture as you'd like. It's yours now!

    // Free the texture once you're done with it!
    allocate.free(texture);
}
```

### CanvasTextureAllocator

```ts
import { CanvasTextureAllocator } from '@pixi-essentials/texture-allocator';

import type { BaseImageResource, Texture } from '@pixi/core';

// Create a canvas-texture allocator
const allocator = new CanvasTextureAllocator();

// Allocate a texture
const texture = allocator.allocate(256, 256);

// This will draw our geometry into a texture
function cacheGeometry(texture: Texture) {
    const baseTexture = texture.baseTexture;
    const canvas = (baseTexture.resource as BaseImageResource).source as HTMLCanvasElement;
    const context = canvas.getContext('2d');

    const frame = texture.frame;

    // Our geometry is just a rectangle, nothing silly :P
    context.fillStyle = 'green';
    context.fillRect(frame.left, frame.top, frame.width, frame.height);
}

// Draw stuff into the texture
cacheGeometry(texture);

// Do stuff with the texture, i.e. add a sprite to your scene
```

### RenderTextureAllocator

```ts
import { Graphics } from '@pixi/graphics';
import { RenderTextureAllocator } from '@pixi-essentials/texture-allocator';

// Create a render-texture allocator
const allocator = new RenderTextureAllocator();

// Create something complicated. NOTE: This example is not complicated and is not recommended for caching
// into a texture.
const complexGraphics = new Graphics()
    .beginFill(0xff)
    .drawCircle(150, 150, 100, 100)
    .endFill();

// Allocate the texture
const texture = allocator.allocate(0, 0, 250, 250);

// Cache the graphics into this texture
renderer.render(complexGraphics, texture);

// Use the texture instead of the graphics, i.e. add a sprite to your scene
```