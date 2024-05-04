import { CanvasSource, ICanvasRenderingContext2D, Sprite, Texture, Text } from 'pixi.js';
import { CanvasTextureAllocator } from '@pixi-essentials/texture-allocator';
import { main } from '../../../src/main';

main((app) =>
{
    const allocator = new CanvasTextureAllocator(500, 1000);
    const textures = new Array<Texture>(8);
    const colors = [
        '#66545e',
        '#a39193',
        '#aa6f73',
        '#eea990',
        '#f6e0b5',
    ];

    let ctx: ICanvasRenderingContext2D | null = null;

    for (let i = 0; i < textures.length; i++)
    {
        const texture = textures[i] = allocator.allocate(250, 250, 0);
        const { x, y, width, height } = texture.frame;

        ctx = ctx || (texture.source as CanvasSource).resource.getContext('2d');
        ctx.fillStyle = colors[i % colors.length];
        ctx.fillRect(x, y, width, height);
    }

    app.stage.addChild(new Sprite(new Texture(textures[0].source)));
    app.stage.addChild(new Text({
        resolution: devicePixelRatio,
        text: 'Left half - The canvas atlas\nRight half - The individual textures',
    }));

    for (const texture of textures)
    {
        app.stage.addChild(new Sprite(texture))
            .position.set(texture.frame.x + 500, texture.frame.y);
    }

    requestAnimationFrame(() =>
    {
        app.render();
    });
},
{
    backgroundColor: 0xffffff,
    height: 1000,
    width: 1000,
});
