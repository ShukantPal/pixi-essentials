/* eslint-disable */
 
/*!
 * @pixi-essentials/ooo-renderer - v0.0.2
 * Compiled Sat, 22 Aug 2020 23:15:48 UTC
 *
 * @pixi-essentials/ooo-renderer is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 * 
 * Copyright 2019-2020, Shukant Pal <shukantpal@outlook.com>, All Rights Reserved
 */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var pixi_js = require('pixi.js');
var pixiSpatialHash = require('pixi-spatial-hash');
var objectPool = require('@pixi-essentials/object-pool');

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise */

var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
    return extendStatics(d, b);
};

function __extends(d, b) {
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

var OooElement = /** @class */ (function () {
    function OooElement() {
    }
    OooElement.prototype.getBounds = function () {
        return this.displayObject.getBounds(true);
    };
    return OooElement;
}());

var elementPool = objectPool.ObjectPoolFactory.build(OooElement);
/**
 * The out-of-order rendering pipeline
 *
 * @public
 */
var OooRenderer = /** @class */ (function (_super) {
    __extends(OooRenderer, _super);
    function OooRenderer(renderer, options) {
        if (options === void 0) { options = {}; }
        var _this = _super.call(this, renderer) || this;
        /**
         * 2D spatial hash of the buffered display-objects. This updated on each render call on this object-renderer.
         */
        _this.spatialHash = new pixiSpatialHash.SpatialHash(options.blockSize || 256);
        /**
         * Provides the pipeline used to render an object. By default, the ooo-renderer will use the `pluginName` property
         * to determine the pipeline.
         */
        _this.pluginProvider = options.pluginProvider || (function (displayObject) { return displayObject.pluginName; });
        /**
         * The list of batches created for the buffered objects
         */
        _this.batchList = [];
        return _this;
    }
    OooRenderer.prototype.start = function () {
        this.spatialHash.clear();
        this.batchList = [];
    };
    /**
     * @override
     */
    OooRenderer.prototype.render = function (displayObject) {
        var element = elementPool.allocate();
        var elementBounds = displayObject.getBounds(true);
        var zDependencies = this.spatialHash.search(elementBounds);
        element.displayObject = displayObject;
        element.pluginName = this.pluginProvider(displayObject);
        element.zIndex = zDependencies.length
            ? zDependencies.reduce(function (maxIndex, zDep) { return Math.max(maxIndex, zDep.zIndex); }, 0)
            : 0;
        element.zDependencies = zDependencies;
        this.spatialHash.put(element, elementBounds);
        // The minimum batch index needed to ensure this display-object is rendered after its z-dependencies. This
        // is always less than the length of the batchList.
        var minBatchIndex = zDependencies.length
            ? zDependencies.reduce(function (minBatchIndex, zDep) { return Math.max(minBatchIndex, zDep.batchIndex); }, 0)
            : 0;
        // Search for a batch for this display-object after minBatchIndex
        for (var i = minBatchIndex, j = this.batchList.length; i < j; i++) {
            var batch_1 = this.batchList[i];
            var pluginName = batch_1.pluginName;
            if (pluginName === element.pluginName) {
                batch_1.displayObjects.push(displayObject);
                return;
            }
        }
        var batch = {
            pluginName: element.pluginName,
            displayObjects: [displayObject],
        };
        this.batchList.push(batch);
    };
    /**
     * @override
     */
    OooRenderer.prototype.flush = function () {
        var rendererPlugins = this.renderer.plugins;
        for (var i = 0, j = this.batchList.length; i < j; i++) {
            var batch = this.batchList[i];
            var displayObjects = batch.displayObjects;
            var pluginRenderer = rendererPlugins[batch.pluginName];
            pluginRenderer.start();
            for (var u = 0, v = displayObjects.length; u < v; u++) {
                pluginRenderer.render(displayObjects[u]);
            }
            pluginRenderer.stop();
        }
    };
    return OooRenderer;
}(pixi_js.ObjectRenderer));

/**
 * Plugin factory for the out-of-order pipeline
 */
var OooRendererPluginFactory = /** @class */ (function () {
    function OooRendererPluginFactory() {
    }
    OooRendererPluginFactory.from = function (options) {
        return /** @class */ (function (_super) {
            __extends(class_1, _super);
            function class_1(renderer) {
                return _super.call(this, renderer, options) || this;
            }
            return class_1;
        }(OooRenderer));
    };
    return OooRendererPluginFactory;
}());

exports.OooRenderer = OooRenderer;
exports.OooRendererPluginFactory = OooRendererPluginFactory;
//# sourceMappingURL=pixi-ooo-renderer.js.map
