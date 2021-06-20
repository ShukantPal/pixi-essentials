# @pixi-essentials/svg

This package aims to implements the [SVG Native Specification](https://svgwg.org/specs/svg-native/). In addition, it also
supports the &lt;text /&gt;, &lt;tspan /&gt; elements.

It is designed for high performance rendering. As such, it automatically culls its internal scene graph and uses a shared
texture atlas for rasterized images.

## Installation :package:

```bash
npm install @pixi-essentials/svg
```

## Usage :page_facing_up:

```ts
import { SVGScene } from '@pixi-essentials/svg';

async function main() {
  console.info("Loaded payload");

  const app = new PIXI.Application({
    antialias: true,
    autoDensity: true,
    autoStart: false,
    backgroundColor: 0xffffff,
    resolution: window.devicePixelRatio,
    view: document.getElementById("view")
  });

  const viewport = app.stage.addChild(new PIXI.Container());
  const scene = viewport.addChild(await PIXI.SVGScene.from("https://upload.wikimedia.org/wikipedia/commons/f/fa/De_Groot_academic_genealogy.svg"));

  app.renderer.render(app.stage);

  console.info("Success");
}

main();
```

## Implementation

@pixi-essentials/svg generates a scene graph that maps one-to-one for each SVG DOM element. Features like masks and gradients are implemented
as "servers" which lazily render when needed.

## Collaboration

I'd like to thank [Strytegy](strytegy.com) for funding the initial development of this package.

<a href="https://www.strytegy.com"><img src="https://i.imgur.com/3Ns1JJb.png" width="153.3px" /></a>
