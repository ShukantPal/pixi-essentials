import { Renderer, Geometry, ViewableBuffer } from '@pixi/core';
import { nextPow2, log2 } from '@pixi/utils';
import { TYPES } from '@pixi/constants';

// eslint-disable-next-line @typescript-eslint/class-name-casing
interface ArrayBufferView_ extends ArrayBufferView
{
    gAutoManaged?: boolean;
    length: number;
}

/**
 * Plugin class for `renderer.plugins.g`. This API provides utilties for managing PixiJS geometries
 * and their data. This includes:
 *
 * + Comparing & merging geometries
 * + Manipulating data based on the data-type
 * + Factory for typed-array buffers.
 *
 * @class
 */
export class G
{
    private _freeBuffers: Record<number, ViewableBuffer[]>;

    /**
     * Compares the geometry styles of two {@code PIXI.Geometry} objects. The style comprises of
     * attributes (not their buffers) and instancing flags.
     *
     * @param {PIXI.Geometry} g0
     * @param {PIXI.Geometry} g1
     */
    compareStyle(g0: Geometry, g1: Geometry): boolean
    {
        if (g0.instanced !== g1.instanced)
        {
            return false;
        }

        for (const attribID in g0.attributes)
        {
            if (!g1.attributes)
            {
                return false;
            }

            const attrib0 = g0.attributes[attribID];
            const attrib1 = g1.attributes[attribID];

            if (attrib0.size !== attrib1.size
                    || attrib0.normalized !== attrib1.normalized
                    || attrib0.type !== attrib1.type
                    || attrib0.instance !== attrib1.instance)
            {
                return false;
            }
        }

        return true;
    }

    /**
     * Copies {@code geom} into the geometry {@code into}.
     *
     * @param {PIXI.Geometry} into
     * @param {PIXI.Geometry} geom
     * @param {number}[startVertex=0] - the vertex at which to start writing "geom" into "into"'s
     *      buffer. By default, this is zero and will overwrite "geom".
     * @param {boolean}[swap=false] - whether the geometry's buffers can be swapped with a
     *      larger capacity. If false, then an error will be thrown if "into" does not contain
     *      enough capacity.
     * @param {boolean}[validateStyle=false] - validates whether the style of "geom" is the same
     *      as "into". If not, then no modifications are done and it is returend as-is.
     */
    copyData(into: Geometry, geom: Geometry, startVertex = 0, swap = false, validateStyle = false): Geometry
    {
        if (validateStyle && !this.compareStyle(into, geom))
        {
            return into;
        }

        for (const attribID in into.attributes)
        {
            const srcAttrib = geom.attributes[attribID];
            const srcBuffer = geom.buffers[srcAttrib.buffer];
            const dstAttrib = into.attributes[attribID];
            const dstBuffer = into.buffers[dstAttrib.buffer];

            const type = dstAttrib.type;
            const typeSize = this.sizeOf(type);

            const attribStart = dstAttrib.start;
            const attribSize = dstAttrib.size;

            const dstOffset = (attribStart / typeSize) + (dstAttrib.stride
                ? startVertex * (dstAttrib.stride / typeSize)
                : startVertex * attribSize);

            const src = this.viewOf(type, srcBuffer.data);
            let dst = this.viewOf(type, dstBuffer.data);

            if (dstOffset + src.length >= dst.length)
            {
                if (swap)
                {
                    const newDst = this.allocateBuffer((dstOffset + src.length) * typeSize);

                    this.copyBuffer(dst, newDst);

                    if (dst.gAutoManaged)
                    {
                        this.returnBuffer(dst);
                    }

                    dst = newDst;
                }
                else
                {
                    console.error(`[Plugin 'g']: Destination buffer does not have enough capacity to merge `
                        + `geom's ${attribID} buffer. Consider setting swap to true.`);
                }
            }

            this.copyBuffer(src, dst, src.length, dstOffset);
        }

        return into;
    }

    /**
     * Returns the size of the {@code PIXI.TYPES} data type in bytes.
     *
     * @param {PIXI.TYPES} dataType
     * @return {number}
     */
    sizeOf(dataType: TYPES): number
    {
        switch (dataType)
        {
            case TYPES.UNSIGNED_BYTE:
                return 1;
            case TYPES.UNSIGNED_SHORT:
            case TYPES.UNSIGNED_SHORT_5_6_5:
            case TYPES.UNSIGNED_SHORT_4_4_4_4:
            case TYPES.UNSIGNED_SHORT_5_5_5_1:
            case TYPES.HALF_FLOAT:
                return 2;
            case TYPES.FLOAT:
                return 4;
        }

        throw new Error(`Unknown data type ${dataType}`);
    }

    /**
     * Returns the array-buffer view for the given type.
     *
     * @param {PIXI.TYPES} dataType
     * @param {ArrayBuffer | ArrayBufferView} buffer
     * @example
     * renderer.g.viewOf(PIXI.TYPES.FLOAT, buffer); // converts buffer to Float32Array
     */
    viewOf(dataType: TYPES, buffer: ArrayBuffer | ArrayBufferView): ArrayBufferView_
    {
        const rawBuffer: ArrayBuffer = buffer instanceof ArrayBuffer ? buffer : buffer.buffer;

        switch (dataType)
        {
            case TYPES.UNSIGNED_BYTE:
                return buffer instanceof Uint8Array ? buffer : new Uint8Array(rawBuffer);
            case TYPES.UNSIGNED_SHORT:
            case TYPES.UNSIGNED_SHORT_5_6_5:
            case TYPES.UNSIGNED_SHORT_4_4_4_4:
            case TYPES.UNSIGNED_SHORT_5_5_5_1:
            case TYPES.HALF_FLOAT:
                return buffer instanceof Uint16Array ? buffer : new Uint16Array(rawBuffer);
            case TYPES.FLOAT:
                return buffer instanceof Float32Array ? buffer : new Uint32Array(rawBuffer);
        }

        throw new Error(`Unknown data type ${dataType}`);
    }

    /**
     * Returns a buffer with that can hold {@code byteCapacity} bytes. This uses a shared cache
     * of buffers with power-of-two capacities.
     *
     * @param {number} byteCapacity - minimum capacity required
     * @return {ViewableBuffer} - buffer than can hold atleast `size` floats
     * @private
     */
    allocateBuffer(byteCapacity: number): ViewableBuffer
    {
        const roundedP2 = nextPow2(byteCapacity);
        const roundedSizeIndex = log2(roundedP2);
        const roundedSize = roundedP2;

        let bufferSlot = this._freeBuffers[roundedSizeIndex];

        if (!bufferSlot)
        {
            this._freeBuffers[roundedSizeIndex] = bufferSlot = [];
        }

        let buffer = bufferSlot.pop();

        if (!buffer)
        {
            buffer = new ViewableBuffer(roundedSize);
            buffer.gAutoManaged = true;
        }

        return buffer;
    }

    /**
     * Copies the elements in {@code src} into {@code dst}.
     *
     * @param {ArrayBufferView} src - the source buffer
     * @param {ArrayBufferView} dst - the destination buffer
     * @param {number}[len=src.length] - the number of elements to copy
     * @param {number}[offset=0] - the offset in {@code dst} to start writing into
     */
    copyBuffer(src: ArrayBufferView_, dst: ArrayBufferView_, len = src.length, offset = 0): void
    {
        for (let in_ = 0, out = offset; in_ < len; in_++, out++)
        {
            dst[out] = src[in_];
        }
    }

    /**
     * Frees the buffer previously allocated using {@code allocateBuffer}.
     *
     * @param {PIXI.ViewableBuffer} buffer
     */
    returnBuffer(buffer: ViewableBuffer): void
    {
        if (!buffer.gAutoManaged)
        {
            throw new Error('Buffer is not managed by plugin-g');
        }

        const size = buffer.rawBinaryData.byteLength;
        const index = log2(size);

        this._freeBuffers[index].push(buffer);
    }
}

Renderer.registerPlugin('g', G);
