# Pixi Essentials

This is a work-in-progress monorepo for several advanced ideas I want to materialize in the PixiJS ecosystem.

* `@pixi-essentials/object-pool`: This is an object pool custom-tailored for PixiJS applications. It exclusively features
an auto-GC mechanism that prevents the pool from staying too large relative to your application's need.

* `@pixi-essentials/ooo-renderer`: This is an optimized batch renderer that can re-order display-object renders to increase
batching efficiency. It uses the same API surface as [pixi-batch-renderer]{@link https://github.com/pixijs/pixi-batch-renderer}