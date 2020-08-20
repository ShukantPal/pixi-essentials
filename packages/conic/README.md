# @pixi-essentials/conic

This package is a display-object library for drawing conic sections (or any quadric curve) in
two dimensions.

Any quadratic curve can be represented in the form _k_<sup>2</sup> - _lm_ = _0_, where _k_, _l_, _m_ are linear functionals (of form _ax_ + _by_ + _c_ = _0_). _l_
and _m_ are tangents to the curve, while _k_ is the chord joining the points of tangency. The `Conic` shape exploits this representation to store quadric curves.

## Installation :package:

```bash
npm install @pixi-essentials/conic
```

## Usage :page_facing_up:

```ts
import { Conic, ConicDisplay } from '@pixi-essentials/conic';

const circleShape = Conic.createCircle(.5);
const circleDisplay = new ConicDisplay(circleShape);

circleDisplay.drawRect(0, 0, 1, 1);
circleDisplay.scale.set(100, 100);
circleDisplay.position.set(10, 10);
```

The snippet creates a circular curve centered at (0.5, 0.5) of radius 0.5. Then, a graphic is used to display the curve in a rectangle (0, 0, 1, 1), upscaled
at 100x resolution.

The linear functionals & the produced curves can be seen here: https://www.desmos.com/calculator/bbeizcgnhl

<img src="https://i.ibb.co/8mQ9xTM/Screen-Shot-2020-07-14-at-2-30-36-PM.png"></img>

## Control points & bezier curves

By default, a conic is a bezier. You can set the local control points on the conic-display to draw a
bezier curve.

```ts
import { Point } from 'pixi.js';
import { Conic, ConicDisplay } from '@pixi-essentials/conic`;

const bezierShape = new Conic();
const bezierDisplay = new ConicDisplay(bezierShape);

bezierDisplay
    .drawControlPoints()
    .setControlPoints(
        new Point(10, 10),
        new Point(200, 500),
        new Point(800, 20)
    );
```

This snippet will draw a quadratic bezier curve with control points (10,10), (200,500), (800,20).

<img src="https://i.ibb.co/TgPZMMJ/Screen-Shot-2020-07-15-at-2-39-30-PM.png"></img>

## Antialiasing

The conic shader uses a hardware-based derivatives to antialias pixels on the edge of the curve.