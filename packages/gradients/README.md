> Note: There is a bug in PixiJS v8.1.0 that prevents `GradientFactory` from correctly rendering into a texture.
> Make sure you have applied this patch to your PixiJS build: https://github.com/pixijs/pixijs/pull/10486

# @pixi-essentials/gradients

This package exports a `GradientFactory` that generates color gradient textures. The implementation wraps around
the Canvas API currently, and is not as performant as a WebGL shader would provide.

## Installation :package:

```bash
npm install @pixi-essentials/gradients
```

## Usage :page_facing_up:

```ts
import { GradientFactory } from '@pixi-essentials/gradients';
```
