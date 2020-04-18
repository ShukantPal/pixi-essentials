# Object Pool

This package implements a custom-tailored object pool for PixiJS applications. It provides the
following features:

* **reserve**: You can preallocate the pool size to have a set amount of objects.

* **limit**: You can reduce the pool size after a lot of allocations.

* **auto-GC**: The GC will reduce your pool to the reserve size after allocation demand goes down
per-frame.

## Usage

This package is [WIP] and the following is draft-only:

```
import { ObjectPoolFactory } from 'pixi-object-pool';

// Create a pool for PIXI.Rectangle
const rpool = ObjectPoolFactory.build(PIXI.Rectangle);
```
