import { main } from '../../../src/main';
import { SVGScene } from '@pixi-essentials/svg';
import { Ticker } from 'pixi.js';

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">
    <img src="/images/flower.webp" width="200" height="156" />
</svg>
`.trim();

main((app) =>
{
    app.render = app.render.bind(app);

    const svgElement = new DOMParser().parseFromString(svg, 'image/svg+xml').documentElement as unknown as SVGSVGElement;
    const svgScene = new SVGScene(svgElement);

    app.stage.addChild(svgScene);

    const imgElement = svgElement.firstElementChild as SVGImageElement;

    imgElement.addEventListener('load', () =>
    {
        Ticker.shared.addOnce(app.render);
    });

    Ticker.shared.addOnce(app.render);
}, {
    backgroundColor: 0xffffff,
    height: 200,
    width: 200,
});
