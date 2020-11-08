# @pixi-essentials/area-allocator

This package implements an area allocator that can be used to issue texture space. It provides the following
implementations:

* GuilloteneAllocator: This maintains a tree of rectangular area nodes that are divided either horizontally or
vertically in a flip-flop fashion. The allocated area is picked from the tightest fit, after which the original
area is sliced. Sibling areas are merged when both are freed. This implementation was inspired the [guillotiere](https://github.com/nical/guillotiere) crate.

## Installation :package:

```bash
npm install @pixi-essentials/area-allocator
```

## Usage :page_facing_up:

```ts
import { GuilloteneAllocator } from '@pixi-essentials/area-allocator';

import type { AreaAllocator } from '@pixi-essentials/area-allocator';

// A guillotene allocator that can manage 2D space
const spatialAllocator: AreaAllocator = new GuilloteneAllocator(1024, 1024);

// Rectange-area allocated by the allocator. The returned object has a __mem_area property that
// points to a area node that is required to free this area.
const space = spatialAllocator.allocate(128, 256);

// Free the 2D space after using. NOTE: This must be the same rectangle passed by "allocate", or you
// must also copy the __mem_area property.
spatialAllocator.free(space);
```