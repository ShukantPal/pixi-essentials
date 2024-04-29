import {Application, RenderTexture, Sprite} from "pixi.js";
import {GradientFactory} from "@pixi-essentials/gradients";


document.addEventListener('DOMContentLoaded', async () => {
    const app = new Application();
    Object.assign(window, { app });

    await app.init({
        autoStart: false,
        height: 600,
        view: document.getElementById('view') as HTMLCanvasElement,
        width: 800,
    });

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

    app.stage.addChild(gradient1Sprite);

    requestAnimationFrame(() => {
        app.render()
    });
});

