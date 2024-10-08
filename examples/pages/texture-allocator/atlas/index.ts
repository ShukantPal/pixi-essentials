import { main } from '../../../src/main';
import { AtlasAllocator } from '@pixi-essentials/texture-allocator';
import { Sprite, Ticker } from 'pixi.js';

main((app) =>
{
    app.render = app.render.bind(app);

    const allocator = new AtlasAllocator(app.renderer);
    const textures = [
        'https://fastly.picsum.photos/id/977/200/200.jpg?hmac=bhLVu-kBB_plx-DkWXz4gYn-ViPAhDjTtGFwu143FiA',
        'https://fastly.picsum.photos/id/971/200/200.jpg?hmac=xcJY-VNIH_UD01lMlLi4mADmQrLTgoEE2_NYEhL3VQA',
        'https://fastly.picsum.photos/id/427/200/200.jpg?hmac=s_shz8jLgIAiRoZ7FP0MA88RuD5sS0xJIGNmuTZLvs8',
    ].map((url) =>
    {
        const image = document.createElement('img');

        image.crossOrigin = 'anonymous';
        image.src = url;

        return allocator.allocate(200, 200, image);
    });

    for (let i = 0; i < textures.length; i++)
    {
        app.stage.addChild(new Sprite(textures[i]))
            .position.set(200 * i, 0);

        textures[i].on('update', () =>
        {
            // eslint-disable-next-line no-console
            console.log(`Loaded texture ${i}`);
            Ticker.shared.addOnce(app.render);
        });
    }

    Ticker.shared.addOnce(app.render);
}, {
    backgroundColor: 0xffffff,
    height: 200,
    width: 600,
});
