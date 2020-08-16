/* eslint-disable */
 
/*!
 * @pixi-essentials/ooo-renderer - v0.0.2
 * Compiled Sun, 16 Aug 2020 16:31:07 UTC
 *
 * @pixi-essentials/ooo-renderer is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 * 
 * Copyright 2019-2020, Shukant K. Pal, All Rights Reserved
 */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var pixi_js = require('pixi.js');
var pixiSpatialHash = require('pixi-spatial-hash');
var objectPool = require('@pixi-essentials/object-pool');

class OooElement {
    getBounds() {
        return this.displayObject.getBounds(true);
    }
}

const elementPool = objectPool.ObjectPoolFactory.build(OooElement);
/**
 * The out-of-order rendering pipeline
 *
 * @public
 */
class OooRenderer extends pixi_js.ObjectRenderer {
    constructor(renderer, options = {}) {
        super(renderer);
        /**
         * 2D spatial hash of the buffered display-objects. This updated on each render call on this object-renderer.
         */
        this.spatialHash = new pixiSpatialHash.SpatialHash(options.blockSize || 256);
        /**
         * Provides the pipeline used to render an object. By default, the ooo-renderer will use the `pluginName` property
         * to determine the pipeline.
         */
        this.pluginProvider = options.pluginProvider || ((displayObject) => displayObject.pluginName);
        /**
         * The list of batches created for the buffered objects
         */
        this.batchList = [];
    }
    start() {
        this.spatialHash.clear();
        this.batchList = [];
    }
    /**
     * @override
     */
    render(displayObject) {
        const element = elementPool.allocate();
        const elementBounds = displayObject.getBounds(true);
        const zDependencies = this.spatialHash.search(elementBounds);
        element.displayObject = displayObject;
        element.pluginName = this.pluginProvider(displayObject);
        element.zIndex = zDependencies.length
            ? zDependencies.reduce((maxIndex, zDep) => Math.max(maxIndex, zDep.zIndex), 0)
            : 0;
        element.zDependencies = zDependencies;
        this.spatialHash.put(element, elementBounds);
        // The minimum batch index needed to ensure this display-object is rendered after its z-dependencies. This
        // is always less than the length of the batchList.
        const minBatchIndex = zDependencies.length
            ? zDependencies.reduce((minBatchIndex, zDep) => Math.max(minBatchIndex, zDep.batchIndex), 0)
            : 0;
        // Search for a batch for this display-object after minBatchIndex
        for (let i = minBatchIndex, j = this.batchList.length; i < j; i++) {
            const batch = this.batchList[i];
            const pluginName = batch.pluginName;
            if (pluginName === element.pluginName) {
                batch.displayObjects.push(displayObject);
                return;
            }
        }
        const batch = {
            pluginName: element.pluginName,
            displayObjects: [displayObject],
        };
        this.batchList.push(batch);
    }
    /**
     * @override
     */
    flush() {
        const rendererPlugins = this.renderer.plugins;
        for (let i = 0, j = this.batchList.length; i < j; i++) {
            const batch = this.batchList[i];
            const displayObjects = batch.displayObjects;
            const pluginRenderer = rendererPlugins[batch.pluginName];
            pluginRenderer.start();
            for (let u = 0, v = displayObjects.length; u < v; u++) {
                pluginRenderer.render(displayObjects[u]);
            }
            pluginRenderer.stop();
        }
    }
}

/**
 * Plugin factory for the out-of-order pipeline
 */
class OooRendererPluginFactory {
    static from(options) {
        return class extends OooRenderer {
            constructor(renderer) {
                super(renderer, options);
            }
        };
    }
}

exports.OooRenderer = OooRenderer;
exports.OooRendererPluginFactory = OooRendererPluginFactory;
//# sourceMappingURL=pixi-ooo-renderer.js.map
