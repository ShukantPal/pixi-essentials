# Object Pool

This package implements a custom-tailored object pool for high frequency allocations. It resizes
itself when demand significantly changes. It can be used to:

* minimize memory usage _and_ the number of new allocations per frame

* track memory leaks in short-lived objects

### Analysis

* https://codepen.io/sukantpal/pen/zYvBOVw: This chart shows the number of allocations per frame and the size & capacity of the object pool from which those allocations are done.

<img src="https://i.ibb.co/Lz4c4rM/Screen-Shot-2020-04-17-at-6-48-19-PM.png"></img>

## Usage

This package is [WIP] and the following is draft-only:

```
import { ObjectPoolFactory } from 'pixi-object-pool';

// Create a pool for PIXI.Rectangle
const rpool = ObjectPoolFactory.build(PIXI.Rectangle);
```
