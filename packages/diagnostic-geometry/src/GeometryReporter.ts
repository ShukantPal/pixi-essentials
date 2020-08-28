import type { DisplayObject } from '@pixi/display';
import type { Renderer } from '@pixi/core';

type GeometryOutput = {
    vertices: number;
    indices: number;
    displayObjects: number;
}

type GeometrySources = {
    [id: string]: GeometryOutput;
}

export class GeometryReporter {
    geometrySources: GeometrySources;
    geometrySourceHistory: GeometrySources[];

    renderer: Renderer;

    constructor(renderer: Renderer) {
        this.geometrySources = {};
        this.geometrySourceHistory = [];
        this.renderer = renderer;

        this.renderer.on('postrender', this.postrender, this);
    }

    postrender() {
        this.geometrySourceHistory.push(this.geometrySources);

        if (this.geometrySourceHistory.length > 100) {
            this.geometrySourceHistory.shift();
        }

        this.geometrySources = {};
    }
}