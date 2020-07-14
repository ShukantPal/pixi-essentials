# @pixi-essentials/conic

This package is a display-object library for drawing conic sections (or any quadric curve) in
two dimensions.

Any quadratic curve can be represented in the form _k_<sup>2</sup> - _lm_ = _0_, where _k_, _l_, _m_ are linear functionals (of form _ax_ + _by_ + _c_ = _0_). _l_
and _m_ are tangents to the curve, while _k_ is the chord joining the points of tangency. The `Conic` shape exploits this representation to store quadric curves.

## Usage

```ts
import { Conic, ConicGraphic } from '@pixi-essentials/conic';

const l = [1, 0, 0];
const m = [0, 1, 0];
const k = [Math.sqrt(1/2), Math.sqrt(1/2), 1/(2*Math.sqrt(2))];

const circleShape = new Conic();

circleShape.setl(...l);
circleShape.setm(...m);
circleShape.setk(...k);

const graphic = new ConicGraphic(circleShape);

graphic.drawRect(0, 0, 1, 1);
graphic.scale.set(100, 100);
graphic.position.set(10, 10);
```

The snippet creates a circular curve centered at (0.5, 0.5) of radius 0.5. Then, a graphic is used to display the curve in a rectangle (0, 0, 1, 1), upscaled
at 100x resolution.

The linear functionals & the produced curves can be seen here: https://www.desmos.com/calculator/x2fubla43s

<img src="https://i.ibb.co/8mQ9xTM/Screen-Shot-2020-07-14-at-2-30-36-PM.png"></img>
