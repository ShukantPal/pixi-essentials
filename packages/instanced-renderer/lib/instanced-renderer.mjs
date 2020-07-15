/*!
 * @pixi-essentials/instanced-renderer - v0.0.1-alpha.1
 * Compiled Wed, 15 Jul 2020 15:46:05 UTC
 *
 * @pixi-essentials/instanced-renderer is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 */
import { ViewableBuffer, Buffer, Geometry, State, ObjectRenderer } from '@pixi/core';
import { DRAW_MODES, TYPES } from '@pixi/constants';
import { nextPow2, log2 } from '@pixi/utils';

/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */
/* global Reflect, Promise */

var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return extendStatics(d, b);
};

function __extends(d, b) {
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

var _instanceRendererID = 0;
/**
 * {@code InstancedRenderer} is an object-renderer for drawing meshes/shapes/display-objects
 * that have a common geometry and some "instanced" attributes.
 *
 * @class
 * @extends PIXI.ObjectRenderer
 */
var InstancedRenderer = /** @class */ (function (_super) {
    __extends(InstancedRenderer, _super);
    /**
     * @param {PIXI.Renderer} renderer - the WebGL renderer to attach to
     * @param {PIXI.IInstancedRendererOptions} options - the pipeline description
     */
    function InstancedRenderer(renderer, options) {
        var _this = _super.call(this, renderer) || this;
        _this._aBuffers = [];
        /**
         * Unique ID for this instance renderer.
         *
         * @protected
         * @readonly
         * @member {number}
         */
        _this.instanceRendererID = "instanceRenderer-" + _instanceRendererID++ + "-ID";
        /**
         * Maps display-object property names holding instanced attribute data to their attribute
         * names.
         *
         * @protected
         * @member {Object<string, string>}
         */
        _this._instanceBuilder = options.instanceBuilder;
        /**
         * The reference geometry specifying the "attribute style".
         *
         * @protected
         * @member {PIXI.Geometry}
         */
        _this._geometry = options.geometry;
        /**
         * The shader used to draw all instances.
         *
         * @member {PIXI.Shader}
         */
        _this._shader = options.shader;
        /**
         * The WebGL state required for using the shader.
         *
         * @default PIXI.State.for2d()
         * @member {PIXI.State}
         */
        _this._state = options.state || State.for2d();
        /**
         * Object mapping (instanced) attribute IDs to their sizes in bytes.
         *
         * @protected
         * @readonly
         * @member {Object<string, number>}
         */
        _this._instanceAttribSizes = {};
        /**
         * Object mapping (instanced) attribute IDs to their data type views (i.e. `uint32View`,
         * `float32View`, `uint8View`, etc. in `PIXI.ViewableBuffer`).
         *
         * @protected
         * @readonly
         * @member {Object<string, string>}
         */
        _this._instanceAttribViews = {};
        /**
         * The bytes used per instance/display-object.
         *
         * @protected
         * @readonly
         * @member {number}
         */
        _this._instanceSize = _this._calculateInstanceSizesAndViews();
        /**
         * Buffered display-objects
         *
         * @protected
         * @member {PIXI.DisplayObject[]}
         */
        _this._objectBuffer = [];
        /**
         * The number of display-objects buffered. This is different from the buffer's capacity
         * {@code this._objectBuffer.length}.
         *
         * @protected
         * @member {number}
         */
        _this._objectCount = 0;
        // NOTE: _initInstanceBuffer() also clones this._geometry and replaces it.
        _this._initInstanceBuffer();
        return _this;
    }
    /**
     * @override
     */
    InstancedRenderer.prototype.start = function () {
        this._objectCount = 0;
    };
    /**
     * @override
     * @param {PIXI.DisplayObject} displayObject
     */
    InstancedRenderer.prototype.render = function (displayObject) {
        this._objectBuffer[this._objectCount] = displayObject;
        ++this._objectCount;
    };
    /**
     * Flushes/draws all pending display-objects.
     *
     * @override
     */
    InstancedRenderer.prototype.flush = function () {
        var instanceBuilder = this._instanceBuilder;
        var instanceSize = this._instanceSize;
        var instanceBuffer = this._getBuffer(this._objectCount * this._instanceSize);
        // TODO: Optimize this by compiling a function that doesn't loop through each attribute
        // by rolling the loop
        for (var i = 0; i < this._objectCount; i++) {
            var rsize = 0;
            var object = this._objectBuffer[i];
            for (var attribID in this._instanceBuilder) {
                var attribute = this._geometry.attributes[attribID];
                if (!attribute.instance) {
                    continue;
                }
                var attribSize = attribute.size;
                var view = instanceBuffer[this._instanceAttribViews[attribID]];
                var size = this._instanceAttribSizes[attribID];
                var index = (i * instanceSize + rsize) / size;
                var prop = instanceBuilder[attribID];
                if (attribSize === 1) {
                    view[index] = object[prop];
                }
                else {
                    for (var j = 0; j < attribSize; j++) {
                        view[index + j] = object[prop][j];
                    }
                }
                rsize += size;
            }
        }
        this._instanceBuffer.update(instanceBuffer.rawBinaryData);
        var renderer = this.renderer;
        renderer.shader.bind(this._shader);
        renderer.geometry.bind(this._geometry);
        renderer.state.set(this._state);
        renderer.geometry.draw(DRAW_MODES.TRIANGLES, undefined, undefined, this._objectCount);
        this._objectCount = 0;
    };
    /**
     * Returns a (cached) buffer that can hold {@code size} bytes.
     *
     * @param {number} size - required capacity in bytes
     * @return {ViewableBuffer} - buffer than can hold atleast `size` floats
     * @private
     */
    InstancedRenderer.prototype._getBuffer = function (size) {
        var roundedP2 = nextPow2(Math.ceil(size));
        var roundedSizeIndex = log2(roundedP2);
        var roundedSize = roundedP2;
        if (this._aBuffers.length <= roundedSizeIndex) {
            this._aBuffers.length = roundedSizeIndex + 1;
        }
        var buffer = this._aBuffers[roundedSize];
        if (!buffer) {
            this._aBuffers[roundedSize] = buffer = new ViewableBuffer(roundedSize);
        }
        return buffer;
    };
    /**
     * Returns the no. of bytes used for each instance.
     *
     * @private
     * @returns {number}
     */
    InstancedRenderer.prototype._calculateInstanceSizesAndViews = function () {
        var totalSize = 0;
        for (var attribID in this._geometry.attributes) {
            var attribute = this._geometry.attributes[attribID];
            if (!attribute.instance) {
                continue;
            }
            var typeSize = 0;
            var view = void 0;
            switch (attribute.type) {
                case TYPES.UNSIGNED_BYTE:
                    typeSize = 1;
                    view = 'uint8View';
                    break;
                case TYPES.UNSIGNED_SHORT:
                case TYPES.UNSIGNED_SHORT_5_6_5:
                case TYPES.UNSIGNED_SHORT_4_4_4_4:
                case TYPES.UNSIGNED_SHORT_5_5_5_1:
                case TYPES.HALF_FLOAT:
                    typeSize = 2;
                    view = 'uint16View'; // TODO: HALF_FLOAT will not work
                    break;
                case TYPES.FLOAT:
                    typeSize = 4;
                    view = 'float32View';
                    break;
            }
            var byteSize = attribute.size * typeSize;
            this._instanceAttribViews[attribID] = view;
            this._instanceAttribSizes[attribID] = byteSize;
            totalSize += byteSize;
        }
        return totalSize;
    };
    /**
     * Replaces {@code this._geometry} with a new geometry such that each instanced attribute
     * points to the same buffer. Uninstanced attributes refer to their original buffers.
     */
    InstancedRenderer.prototype._initInstanceBuffer = function () {
        /**
         * The instance buffer holds all instanced attributes in an interleaved fashion.
         *
         * @member {PIXI.Buffer}
         */
        this._instanceBuffer = new Buffer();
        var clonedGeometry = new Geometry();
        for (var attribID in this._geometry.attributes) {
            var attribute = this._geometry.attributes[attribID];
            var instance = attribute.instance;
            console.log(attribID);
            console.log(this._geometry.buffers[attribute.buffer]);
            clonedGeometry.addAttribute(attribID, instance ? this._instanceBuffer : this._geometry.buffers[attribute.buffer], attribute.size, attribute.normalized, attribute.type, instance ? attribute.start : undefined, instance ? attribute.stride : undefined, attribute.instance);
        }
        this._geometry = clonedGeometry;
    };
    return InstancedRenderer;
}(ObjectRenderer));
/**
 * This options define how display-objects are rendered by the instanced renderer.
 *
 * NOTE:
 *
 * + Make sure your instanceBuilder is in the order you want attributes to be packed
 * in the same buffer. Also, make sure that floats are aligned at 4-byte boundaries and
 * shorts are aligned at 2-byte boundaries.
 *
 * + PixiJS Bug: Make sure the first attribute is **not** instanced.
 *
 * @memberof PIXI
 * @interface IInstancedRendererOptions
 * @property {Object<string, string>} instanceBuilder - an object mapping display-object
 *      properties holding "instance attributes" from their attribute name.
 * @property {Geometry} geometry - the geometry style used to render the display-objects
 * @property {Shader} shader - the shader used to render display-objects
 * @property {State}[state] - the WebGL state used to run the shader
 * @example
 * {
 *     instanceBuilder: {
 *         aVertexPosition: '_vertexData'
 *     },
 *     geometry: new PIXI.Geometry()
 *              .addAttribute('aVertexPosition', null, 2, false, TYPES.FLOAT, 0, 0, false)
 *              .addAttribute('aWorldTransform', null, 2, false, TYPES.FLOAT, 0, 0, true)
 *     shader: new PIXI.Shader(<vertexShaderSrc>, <fragmentShaderSrc>, <uniformData>),
 *     state: PIXI.State.for2d() // that's the default
 * }
 */

/**
 * @class
 * @example
 * import { InstancedRendererPluginFactory } from '[at]pixi-essentials/instanced-renderer';
 * import { Renderer, Shader, Geometry, TYPES } from 'pixi.js';
 *
 * const spriteRenderer = InstancedRendererPluginFactory.from({
 *     instanceBuilder: {
 *         aVertexPosition: "_vertexData"
 *     },
 *     geometry: new Geometry().
 *         addAttribute("aVertexPosition", new Float32Array(
 *             0, 0,
 *             100, 0,
 *             100, 100,
 *             100, 100,
 *             0, 100,
 *             0, 0
 *         ), 2, false, TYPES.FLOAT, 0, 0, true),
 *     shader: new Shader(
 *       `
 * attribute vec2 aVertexPosition;
 * uniform mat3 projectionMatrix;
 *
 * void main(void)
 * {
 *     gl_Position = vec4((projectionMatrix * vec3(aVertexPosition.xy, 1)).xy, 0, 1);
 * }
 * `,
 * `
 * void main(void)
 * {
 *     gl_FragColor = vec4(.5, 1, .2, 1);// some random color
 * }
 * `,
 * {} // you can add uniforms
 *     )
 * });
 */
var InstancedRendererPluginFactory = /** @class */ (function () {
    function InstancedRendererPluginFactory() {
    }
    /**
     * Returns a plugin wrapping an instanced renderer that can be registered.
     *
     * @param {IInstancedRendererOptions} options
     * @returns {PIXI.PluginConstructor}
     */
    InstancedRendererPluginFactory.from = function (options) {
        return /** @class */ (function (_super) {
            __extends(class_1, _super);
            function class_1(renderer) {
                return _super.call(this, renderer, options) || this;
            }
            return class_1;
        }(InstancedRenderer));
    };
    return InstancedRendererPluginFactory;
}());

export { InstancedRenderer, InstancedRendererPluginFactory };
//# sourceMappingURL=instanced-renderer.mjs.map
