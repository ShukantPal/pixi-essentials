# Object Pool

This package implements a custom-tailored object pool for high frequency allocations. It resizes
itself when demand significantly changes. It can be used to:

* minimize memory usage _and_ the number of new allocations per frame

* track memory leaks in short-lived objects

## Usage

This package is [WIP] and the following is draft-only:

```
import { ObjectPoolFactory } from 'pixi-object-pool';

// Create a pool for PIXI.Rectangle
const rpool = ObjectPoolFactory.build(PIXI.Rectangle);
```
