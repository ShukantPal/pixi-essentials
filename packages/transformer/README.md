⚠️ Although the latest version of this package declares a dependency on PixiJS 7, it now has a bug where pointer events outside of the handles causes the UI to stop responding. This is because of how PixiJS (EventSystem) now excludes events outside of a DisplayObject. See (#73)

# @pixi-essentials/transformer

This package contains `Transformer`, which provides an interactive interface for scaling and rotating groups of display-objects.

## Installation :package:

```base
npm install @pixi-essentials/transformer
```

## Pens :pen:

+ Standard usage: https://codepen.io/sukantpal/pen/dyMMmZm
+ Usage with @pixi-essentials/react-bindings: https://codepen.io/sukantpal/pen/ZEWWoWX

## Transform options :page_with_curl:

| Property           | Default         | Description                                                                                 |
| ------------------ | --------------- | ------------------------------------------------------------------------------------------- |
| boxRotationEnabled | false           | Rotation by dragging near outside the four corners of the bounding box                      |
| boxScalingEnabled  | false           | Scaling by dragging the edges of the bounding-box (also called the wireframe)               |
| centeredScaling    | false           | Whether scaling object should keep its center invariant (instead of the side being dragged) |
| rotateEnabled      | true            | Enables the rotator handle above the top-edge of the wireframe                              |
| scaleEnabled       | true            | Enables the 8 scaling handles (topLeft, topCenter, topRight, middleLeft, middleRight, bottomLeft, bottomCenter, bottomRight) |
| skewEnabled        | false           | Enables the 2 skewing handles                                                               |
| translateEnabled   | true            | Enables translation by dragging the wireframe. The transformer will capture all mouse events in the group's bounds |


## Usage :page_facing_up:

```js
import * as PIXI from 'pixi.js';
import { Transformer } from '@pixi-essentials/transformer';

const app = new PIXI.Application({
    resolution: window.devicePixelRatio,
    autoDensity: true,
    backgroundColor: 0xabcdef,
    width: 1024,
    height: 1024,
    antialias: true
});

document.body.appendChild(app.view);

const circle = app.stage.addChild(new PIXI.Graphics());

circle.beginFill(0xfedbac)
    .drawCircle(0, 0, 100)
    .endFill();
circle.pivot.set(50, 100);
circle.scale.set(1);
circle.position.set(300, 300);

const star = app.stage.addChild(new PIXI.Graphics());

star.beginFill(0xfedbac)
    .drawStar(0, 0, 8, 100)
    .endFill();
star.position.set(800, 500);
star.pivot.set(50, 100);

app.stage.addChild(new Transformer({
    group: [circle, star],
}));
```

<p align="center">
<img src="https://i.imgur.com/b82qYjF.png" width="790px" />
</p>

## External Resources

* (Initial release) [Vector rendering of SVG content with PixiJS](https://medium.com/javascript-in-plain-english/vector-rendering-of-svg-content-with-pixijs-6f26c91f09ee?source=friends_link&sk=1faf7f354ab39bd79d476bf33e9d44d1)
