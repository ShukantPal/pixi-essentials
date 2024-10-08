import { Application } from 'pixi.js';

import type { ApplicationOptions } from 'pixi.js';

const useWebGPU = new URLSearchParams(window.location.search).get('webgpu') === 'true';

export function main(callback: (app: Application) => void, options?: Partial<ApplicationOptions>): void
{
    document.addEventListener('DOMContentLoaded', async function onDOMContentLoaded()
    {
        const app = new Application();

        Object.assign(window, { app });

        await app.init({
            antialias: true,
            autoStart: false,
            autoDensity: true,
            canvas: document.getElementById('view') as HTMLCanvasElement,
            height: 600,
            preference: useWebGPU ? 'webgpu' : 'webgl',
            resolution: devicePixelRatio,
            width: 800,
            ...options,
        });

        callback(app);

        Object.assign(window, {
            app,
            stage: app.stage,
        });
    });
}
