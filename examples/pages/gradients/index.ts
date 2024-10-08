import { RenderTexture, Sprite } from 'pixi.js';
import { GradientFactory } from '@pixi-essentials/gradients';
import { main } from '../../src/main';

main((app) =>
{
    const gradient1 = GradientFactory.createLinearGradient(
        app.renderer,
        RenderTexture.create({ width: 800, height: 600 }),
        {
            x0: 0,
            y0: 0,
            x1: 800,
            y1: 600,
            colorStops: [
                { color: 0xFF0000, offset: 0 },
                { color: 0x00FF00, offset: 0.5 },
                { color: 0x0000FF, offset: 1 },
            ],
        },
    );
    const gradient1Sprite = new Sprite(gradient1);

    gradient1Sprite.scale.set(0.5, 0.5);

    const gradient2 = GradientFactory.createRadialGradient(
        app.renderer,
        RenderTexture.create({ width: 800, height: 600 }),
        {
            x0: 400,
            y0: 300,
            r0: 10,
            x1: 400,
            y1: 300,
            r1: 400,
            colorStops: [
                { color: 0xFF0000, offset: 0 },
                { color: 0x00FF00, offset: 0.5 },
                { color: 0x0000FF, offset: 1 },
            ],
        },
    );
    const gradient2Sprite = new Sprite(gradient2);

    gradient2Sprite.position.set(400, 0);
    gradient2Sprite.scale.set(0.5, 0.5);

    app.stage.addChild(gradient1Sprite, gradient2Sprite);

    requestAnimationFrame(() =>
    {
        app.render();
    });
}, {
    width: 800,
    height: 300,
});
