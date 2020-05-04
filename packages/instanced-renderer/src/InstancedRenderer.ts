import { Buffer, ObjectRenderer, Renderer, Geometry, Shader, State, ViewableBuffer } from '@pixi/core';
import { TYPES, DRAW_MODES } from '@pixi/constants';
import { log2, nextPow2 } from '@pixi/utils';

const _instanceID = 0;
let _instanceRendererID = 0;

/**
 * {@code InstancedRenderer} is an object-renderer for drawing meshes/shapes/display-objects
 * that have a common geometry and some "instanced" attributes.
 *
 * @class
 * @extends PIXI.ObjectRenderer
 */
export class InstancedRenderer extends ObjectRenderer
{
    public renderer: Renderer;// @pixi/core doesn't have types yet :<
    public readonly instanceRendererID: string;

    protected _instanceBuilder: Record<string, string>;
    protected _geometry: Geometry;
    protected _shader: Shader;
    protected _state: State;

    protected _objectBuffer: Array<{[id: string]: string}>;
    protected _objectCount: number;

    protected _instanceBuffer: Buffer;
    protected _instanceBufferHash: number;

    protected readonly _instanceAttribSizes: Record<string, number>;
    protected readonly _instanceSize: number;
    private _aBuffers: ViewableBuffer[] = [];
    private _instanceAttribViews: Record<string, string> ;

    /**
     * @param {PIXI.Renderer} renderer - the WebGL renderer to attach to
     * @param {PIXI.IInstancedRendererOptions} options - the pipeline description
     */
    constructor(renderer: Renderer, options: IInstancedRendererOptions)
    {
        super(renderer);

        /**
         * Unique ID for this instance renderer.
         *
         * @protected
         * @readonly
         * @member {number}
         */
        this.instanceRendererID = `instanceRenderer-${_instanceRendererID++}-ID`;

        /**
         * Maps display-object property names holding instanced attribute data to their attribute
         * names.
         *
         * @protected
         * @member {Object<string, string>}
         */
        this._instanceBuilder = options.instanceBuilder;

        /**
         * The reference geometry specifying the "attribute style".
         *
         * @protected
         * @member {PIXI.Geometry}
         */
        this._geometry = options.geometry;

        /**
         * The shader used to draw all instances.
         *
         * @member {PIXI.Shader}
         */
        this._shader = options.shader;

        /**
         * The WebGL state required for using the shader.
         *
         * @default PIXI.State.for2d()
         * @member {PIXI.State}
         */
        this._state = options.state || State.for2d();

        /**
         * Object mapping (instanced) attribute IDs to their sizes in bytes.
         *
         * @protected
         * @readonly
         * @member {Object<string, number>}
         */
        this._instanceAttribSizes = {};

        /**
         * Object mapping (instanced) attribute IDs to their data type views (i.e. `uint32View`,
         * `float32View`, `uint8View`, etc. in `PIXI.ViewableBuffer`).
         *
         * @protected
         * @readonly
         * @member {Object<string, string>}
         */
        this._instanceAttribViews = {};

        /**
         * The bytes used per instance/display-object.
         *
         * @protected
         * @readonly
         * @member {number}
         */
        this._instanceSize = this._calculateInstanceSizesAndViews();

        /**
         * Buffered display-objects
         *
         * @protected
         * @member {PIXI.DisplayObject[]}
         */
        this._objectBuffer = [];

        /**
         * The number of display-objects buffered. This is different from the buffer's capacity
         * {@code this._objectBuffer.length}.
         *
         * @protected
         * @member {number}
         */
        this._objectCount = 0;

        // NOTE: _initInstanceBuffer() also clones this._geometry and replaces it.
        this._initInstanceBuffer();
    }

    /**
     * @override
     */
    start()
    {
        this._objectCount = 0;
    }

    /**
     * @override
     * @param {PIXI.DisplayObject} displayObject
     */
    render(displayObject: { [id: string]: string }): void
    {
        this._objectBuffer[this._objectCount] = displayObject;
        ++this._objectCount;
    }

    /**
     * Flushes/draws all pending display-objects.
     *
     * @override
     */
    flush(): void
    {
        const instanceBuilder = this._instanceBuilder;
        const instanceSize = this._instanceSize;
        const instanceBuffer = this._getBuffer(this._objectCount * this._instanceSize);

        // TODO: Optimize this by compiling a function that doesn't loop through each attribute
        // by rolling the loop
        for (let i = 0; i < this._objectCount; i++)
        {
            let rsize = 0;
            const object = this._objectBuffer[i];

            for (const attribID in this._instanceBuilder)
            {
                const attribute = this._geometry.attributes[attribID];

                if (!attribute.instance)
                {
                    continue;
                }

                const attribSize = attribute.size;
                const view = instanceBuffer[this._instanceAttribViews[attribID]];
                const size = this._instanceAttribSizes[attribID];

                const index = (i * instanceSize + rsize) / size;
                const prop = instanceBuilder[attribID];

                if (attribSize === 1)
                {
                    view[index] = object[prop];
                }
                else
                {
                    for (let j = 0; j < attribSize; j++)
                    {
                        view[index + j] = object[prop][j];
                    }
                }

                rsize += size;
            }
        }

        this._instanceBuffer.update(instanceBuffer.rawBinaryData);

        const renderer = this.renderer;

        renderer.shader.bind(this._shader);
        renderer.geometry.bind(this._geometry);
        renderer.state.set(this._state);

        renderer.geometry.draw(DRAW_MODES.TRIANGLES, undefined, undefined, this._objectCount);

        this._objectCount = 0;
    }

    /**
     * Returns a (cached) buffer that can hold {@code size} bytes.
     *
     * @param {number} size - required capacity in bytes
     * @return {ViewableBuffer} - buffer than can hold atleast `size` floats
     * @private
     */
    protected _getBuffer(size: number): ViewableBuffer
    {
        const roundedP2 = nextPow2(Math.ceil(size));
        const roundedSizeIndex = log2(roundedP2);
        const roundedSize = roundedP2;

        if (this._aBuffers.length <= roundedSizeIndex)
        {
            this._aBuffers.length = roundedSizeIndex + 1;
        }

        let buffer = this._aBuffers[roundedSize];

        if (!buffer)
        {
            this._aBuffers[roundedSize] = buffer = new ViewableBuffer(roundedSize);
        }

        return buffer;
    }

    /**
     * Returns the no. of bytes used for each instance.
     *
     * @private
     * @returns {number}
     */
    private _calculateInstanceSizesAndViews(): number
    {
        let totalSize = 0;

        for (const attribID in this._geometry.attributes)
        {
            const attribute = this._geometry.attributes[attribID];

            if (!attribute.instance)
            {
                continue;
            }

            let typeSize = 0;
            let view;

            switch (attribute.type)
            {
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
                    view = 'uint16View';// TODO: HALF_FLOAT will not work
                    break;
                case TYPES.FLOAT:
                    typeSize = 4;
                    view = 'float32View';
                    break;
            }

            const byteSize = attribute.size * typeSize;

            this._instanceAttribViews[attribID] = view;
            this._instanceAttribSizes[attribID] = byteSize;
            totalSize += byteSize;
        }

        return totalSize;
    }

    /**
     * Replaces {@code this._geometry} with a new geometry such that each instanced attribute
     * points to the same buffer. Uninstanced attributes refer to their original buffers.
     */
    private _initInstanceBuffer(): void
    {
        /**
         * The instance buffer holds all instanced attributes in an interleaved fashion.
         *
         * @member {PIXI.Buffer}
         */
        this._instanceBuffer = new Buffer();

        const clonedGeometry = new Geometry();

        for (const attribID in this._geometry.attributes)
        {
            const attribute = this._geometry.attributes[attribID];
            const instance = attribute.instance;

            console.log(attribID);
            console.log(this._geometry.buffers[attribute.buffer]);

            clonedGeometry.addAttribute(
                attribID,
                instance ? this._instanceBuffer : this._geometry.buffers[attribute.buffer],
                attribute.size,
                attribute.normalized,
                attribute.type,
                instance ? attribute.start : undefined,
                instance ? attribute.stride : undefined,
                attribute.instance,
            );
        }

        this._geometry = clonedGeometry;
    }
}

export interface IInstancedRendererOptions
{
    instanceBuilder: Record<string, string>;
    geometry: Geometry;
    shader: Shader;
    state?: State;
}

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
