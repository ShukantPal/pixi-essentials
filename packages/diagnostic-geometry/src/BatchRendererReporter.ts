import type { BatchRenderer } from 'pixi-batch-renderer';
import type { DisplayObject } from '@pixi/display';
import { GeometryReporter } from './GeometryReporter';

export class BatchRendererReport extends GeometryReporter {
    host: BatchRenderer;
    hostProps: {
        render(displayObject: DisplayObject): void;
    };

    constructor(host: BatchRenderer) {
        super(host.renderer);

        this.host = host;

        this.hostProps = {
            render: host.render
        };

        host.render = this.render;
    }

    render = (displayObject: DisplayObject): void => {
        const verticesBefore = this.host._bufferedVertices;
        const indiciesBefore = this.host._bufferedIndices;

        this.hostProps.render.apply(this.host, [displayObject]);

        const verticesAfter = this.host._bufferedVertices;
        const indiciesAfter = this.host._bufferedIndicies;

        const type = displayObject.constructor.name;

        if (!this.geometrySources[type]) {
            this.geometrySources[type] = {
                vertices: 0,
                indices: 0,
                displayObjects: 0
            };
        }

        this.geometrySources[type].vertices += verticesAfter - verticesBefore;
        this.geometrySources[type].indices += indiciesAfter - indiciesBefore;
        this.geometrySources[type].displayObjects++;
    }
}