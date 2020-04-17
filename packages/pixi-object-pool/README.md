# Object Pool

This package implements a custom-tailored object pool for high frequency allocations. It dynamically adjusts the
outstanding supply to match demand on a per-frame basis. This serves the following purposes:

* minimizing memory usage while also reducing the number of new allocations per frame.

* tracking leaks in objects that are supposed to be returned by the end of each animation frame.

## Usage

This package is [WIP] and the following is draft-only:

```
import { ObjectPoolFactory } from 'pixi-object-pool';

// Create a pool for PIXI.Rectangle
const rpool = ObjectPoolFactory.build(PIXI.Rectangle);
```
