import { main } from '../../../src/main';
import { SVGScene } from '@pixi-essentials/svg';
import { Ticker } from 'pixi.js';

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 356">
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
</svg>
`.trim();

main((app) =>
{
    app.render = app.render.bind(app);

    const svgElement = new DOMParser().parseFromString(svg, 'image/svg+xml').documentElement as unknown as SVGSVGElement;
    const svgScene = new SVGScene(svgElement);

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
