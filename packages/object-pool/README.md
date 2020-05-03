# Object Pool
[![install size](https://packagephobia.now.sh/badge?p=@pixi-essentials/object-pool)](https://packagephobia.now.sh/result?p=@pixi-essentials/object-pool)

This package implements a custom-tailored object pool for PixiJS applications. It provides the
following features:

* **reserve**: You can preallocate the pool size to have a set amount of objects.

* **limit**: You can reduce the pool size after a lot of allocations.

* **auto-GC**: The GC will reduce your pool to the reserve size after allocation demand goes down
per-frame.

This package is can also be used as a _single-source_ of object pools. If two different libraries need
a pool for say, `PIXI.Rectangle`, then the same object pool will be returned.

### Analysis

* https://codepen.io/sukantpal/pen/zYvBOVw: This chart shows the pool capacity and the allocations done per frame. The GC
is enabled and reserve is set to 100,000.

<img src="https://i.ibb.co/jkNWHdR/Screen-Shot-2020-04-18-at-12-46-08-PM.png"></img>

* You should use auto-GC only if allocations-per-frame is smooth (slowly increase & slowly decrease) or you know the upper
limit of objects you need per frame.

## Usage

```ts
import { ObjectPoolFactory } from 'pixi-object-pool';

const rpool: ObjectPoolFactory = ObjectPoolFactory.build(PIXI.Rectangle);

rpool.reserve(10000);
rpool.startGC();// prevent pool from staying above 10,000 rectangles for too long

const rect: PIXI.Rectangle = rpool.allocate();

// do something

rpool.release(rect);

// Want to reduce pool size now?
rpool.limit(11000);
```
