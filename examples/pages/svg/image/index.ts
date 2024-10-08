import { main } from '../../../src/main';
import { SVGScene } from '@pixi-essentials/svg';
import { Ticker } from 'pixi.js';

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 356">
    <image href="/images/flower.webp" width="200" height="156" />
    <image href="/images/visual.webp" y="156" width="196" height="183" />
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
        // eslint-disable-next-line no-console
        console.log('loaded');
        Ticker.shared.addOnce(app.render);
    });

    Ticker.shared.add(app.render);

    Object.assign(window, {
        svgElement,
    });
}, {
    backgroundColor: 0xffffff,
    height: 356,
    width: 200,
});
