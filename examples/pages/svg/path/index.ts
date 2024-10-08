import { main } from '../../../src/main';
import { SVGScene } from '@pixi-essentials/svg';
import { Ticker } from 'pixi.js';

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 356">
  <defs>
    <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="lightblue" />
      <stop offset="100%" stop-color="purple" />
    </linearGradient>
  </defs>

  <!-- Circle -->
  <path d="M 100,100 m -50,0 a 50,50 0 1,0 100,0 a 50,50 0 1,0 -100,0" fill="#ef4444" stroke="black" />
  
  <!-- Ellipse -->
  <path d="M 250,100 a 100,50 0 1,0 200,0 a 100,50 0 1,0 -200,0" fill="#ea580c" stroke="black" />
  
  <!-- Rectangle -->
  <path d="M 100,200 h 200 v 50 h -200 v -50" fill="#ca8a04" stroke="black" />
  
  <!-- Line -->
  <path d="M 250,200 l 100,50" fill="#65a30d" stroke="black" />
  
  <!-- Quadratic Bezier Curve -->
  <path d="M 50,300 q 50,-50 100,0" fill="#0891b2" stroke="black" />
  
  <!-- Cubic Bezier Curve -->
  <path d="M 250,300 c 50,-50 100,50 150,0" fill="#4f46e5" stroke="black" />
  
  <!-- Outer circle with hollow effect (fill-rule: evenodd) at (100, 400) -->
  <path d="M 100 350
           A 50 50 0 1 1 99.9 350 Z
           M 100 380
           A 30 30 0 1 0 100 379.9 Z"
        fill="url(#bgGradient)" fill-rule="evenodd"/>

  <!-- Outer circle without hollow effect (fill-rule: nonzero) at (300, 400) -->
  <path d="M 300 350
           A 50 50 0 1 1 299.9 350 Z
           M 300 380
           A 30 30 0 1 0 300 379.9 Z"
        fill="red" fill-rule="nonzero"/>
</svg>
`.trim();

main((app) =>
{
    app.render = app.render.bind(app);

    const svgElement = new DOMParser().parseFromString(svg, 'image/svg+xml').documentElement as unknown as SVGSVGElement;
    const svgScene = new SVGScene(svgElement);

    svgScene.drawPaints(app.renderer);

    app.stage.addChild(svgScene);

    Ticker.shared.addOnce(app.render);

    Object.assign(window, {
        svgElement,
    });
}, {
    backgroundColor: 0xffffff,
    height: 500,
    width: 500,
});
