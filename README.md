# @pixi-essentials

This is a work-in-progress monorepo for several advanced ideas I want to materialize in the PixiJS ecosystem.

* @pixi-essentials/cull: This is an optimized, recursive scene graph culling package. It sets the visibility objects based on
whether they are outside of the screen or not.

* @pixi-essentials/mixin-smart-mask: This packages ensures that masks are only applied when required, based on the bounds of the target
display-object and the mask. It can significantly improve batching efficiency if your scene graph heavily relies on masking.

* @pixi-essentials/object-pool: This is an object pool custom-tailored for PixiJS applications. It exclusively features
an auto-GC mechanism that prevents the pool from staying too large relative to your application's need.

* @pixi-essentials/ooo-renderer: This is an optimized batch renderer that can re-order display-object renders to increase
batching efficiency. It uses the same API surface as [pixi-batch-renderer]{@link https://github.com/pixijs/pixi-batch-renderer}

* @pixi-essentials/plugin-g: This is a plugin containing useful geometry manipulation utilities, The package also contains
various types of useful geometries.

* @pixi-essentials/shader-preprocessor: (WIP) This package provides compile-time %macro% preprocessing. You can dynamically generate
shaders based on the macros value set provided & a shader template.

* @pixi-essentials/uber: (TODO) This package provides a basic mechanism to generate a uber-shader that can shade multiple types of
objects in one draw call. It is designed to be used along with [pixi-batch-renderer](https://github.com/pixijs/pixi-batch-renderer).
