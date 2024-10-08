import { main } from '../../../src/main';
import { SVGScene } from '@pixi-essentials/svg';
import { Ticker } from 'pixi.js';

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 356">
    <text x="0" y="250" fill="blue" font-family="Helvetica" font-size="72">Hello, SVG!</text>
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
