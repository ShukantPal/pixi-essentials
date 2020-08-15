/* eslint-disable */
 
/*!
 * @pixi-essentials/object-pool - v0.0.4
 * Compiled Sat, 15 Aug 2020 19:41:52 UTC
 *
 * @pixi-essentials/object-pool is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 * 
 * Copyright 2019-2020, Shukant K. Pal, All Rights Reserved
 */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var ticker = require('@pixi/ticker');

/**
 * Provides the exponential moving average of a sequence.
 *
 * Ignored because not directly exposed.
 *
 * @internal
 * @ignore
 * @class
 */
class AverageProvider {
    /**
     * @ignore
     * @param {number} windowSize - no. of inputs used to calculate window
     * @param {number} decayRatio - quantifies the weight of previous values (b/w 0 and 1)
     */
    constructor(windowSize, decayRatio) {
        this._history = new Array(windowSize);
        this._decayRatio = decayRatio;
        this._currentIndex = 0;
        for (let i = 0; i < windowSize; i++) {
            this._history[i] = 0;
        }
    }
    /**
     * @ignore
     * @param {number} input - the next value in the sequence
     * @returns {number} - the moving average
     */
    next(input) {
        const { _history: history, _decayRatio: decayRatio } = this;
        const historyLength = history.length;
        this._currentIndex = this._currentIndex < historyLength - 1 ? this._currentIndex + 1 : 0;
        history[this._currentIndex] = input;
        let weightedSum = 0;
        let weight = 0;
        for (let i = this._currentIndex + 1; i < historyLength; i++) {
            weightedSum = (weightedSum + history[i]) * decayRatio;
            weight = (weight + 1) * decayRatio;
        }
        for (let i = 0; i <= this._currentIndex; i++) {
            weightedSum = (weightedSum + history[i]) * decayRatio;
            weight = (weight + 1) * decayRatio;
        }
        this._average = weightedSum / weight;
        return this._average;
    }
    absDev() {
        let errSum = 0;
        for (let i = 0, j = this._history.length; i < j; i++) {
            errSum += Math.abs(this._history[i] - this._average);
        }
        return errSum / this._history.length;
    }
}

/**
 * `ObjectPool` provides the framework necessary for pooling minus the object instantiation
 * method. You can use `ObjectPoolFactory` for objects that can be created using a default
 * constructor.
 *
 * @template T
 * @class
 * @public
 */
class ObjectPool {
    /**
     * @param {IObjectPoolOptions} options
     */
    constructor(options = {}) {
        this._gcTick = () => {
            this._borrowRateAverage = this._borrowRateAverageProvider.next(this._borrowRate);
            this._marginAverage = this._marginAverageProvider.next(this._freeCount - this._borrowRate);
            const absDev = this._borrowRateAverageProvider.absDev();
            this._flowRate = 0;
            this._borrowRate = 0;
            this._returnRate = 0;
            const poolSize = this._freeCount;
            const poolCapacity = this._freeList.length;
            // If the pool is small enough, it shouldn't really matter
            if (poolSize < 128 && this._borrowRateAverage < 128 && poolCapacity < 128) {
                return;
            }
            // If pool is say, 2x, larger than borrowing rate on average (adjusted for variance/abs-dev), then downsize.
            const threshold = Math.max(this._borrowRateAverage * (this._capacityRatio - 1), this._reserveCount);
            if (this._freeCount > threshold + absDev) {
                const newCap = threshold + absDev;
                this.capacity = Math.min(this._freeList.length, Math.ceil(newCap));
                this._freeCount = this._freeList.length;
            }
        };
        /**
         * Supply pool of objects that can be used to immediately lend.
         *
         * @member {Array<T>}
         * @protected
         */
        this._freeList = [];
        /**
         * Number of objects in the pool. This is less than or equal to `_pool.length`.
         *
         * @member {number}
         * @protected
         */
        this._freeCount = 0;
        this._borrowRate = 0;
        this._returnRate = 0;
        this._flowRate = 0;
        this._borrowRateAverage = 0;
        this._reserveCount = options.reserve || 0;
        this._capacityRatio = options.capacityRatio || 1.2;
        this._decayRatio = options.decayRatio || 0.67;
        this._marginAverage = 0;
        this._borrowRateAverageProvider = new AverageProvider(128, this._decayRatio);
        this._marginAverageProvider = new AverageProvider(128, this._decayRatio);
    }
    // TODO: Support object destruction. It might not be so good for perf tho.
    // /**
    // * Destroys the object before discarding it.
    // *
    // * @param {T} object
    //  */
    // abstract destroyObject(object: T): void;
    /**
     * The number of objects that can be stored in the pool without allocating more space.
     *
     * @member {number}
     */
    get capacity() {
        return this._freeList.length;
    }
    set capacity(cp) {
        this._freeList.length = Math.ceil(cp);
    }
    /**
     * Obtains an instance from this pool.
     *
     * @returns {T}
     */
    allocate() {
        ++this._borrowRate;
        ++this._flowRate;
        if (this._freeCount > 0) {
            return this._freeList[--this._freeCount];
        }
        return this.create();
    }
    /**
     * Obtains an array of instances from this pool. This is faster than allocating multiple objects
     * separately from this pool.
     *
     * @param {number | T[]} lengthOrArray - no. of objects to allocate OR the array itself into which
     *      objects are inserted. The amount to allocate is inferred from the array's length.
     * @returns {T[]} array of allocated objects
     */
    allocateArray(lengthOrArray) {
        let array;
        let length;
        if (Array.isArray(lengthOrArray)) {
            array = lengthOrArray;
            length = lengthOrArray.length;
        }
        else {
            length = lengthOrArray;
            array = new Array(length);
        }
        this._borrowRate += length;
        this._flowRate += length;
        let filled = 0;
        // Allocate as many objects from the existing pool
        if (this._freeCount > 0) {
            const pool = this._freeList;
            const poolFilled = Math.min(this._freeCount, length);
            let poolSize = this._freeCount;
            for (let i = 0; i < poolFilled; i++) {
                array[filled] = pool[poolSize - 1];
                ++filled;
                --poolSize;
            }
            this._freeCount = poolSize;
        }
        // Construct the rest of the allocation
        while (filled < length) {
            array[filled] = this.create();
            ++filled;
        }
        return array;
    }
    /**
     * Returns the object to the pool.
     *
     * @param {T} object
     */
    release(object) {
        ++this._returnRate;
        --this._flowRate;
        if (this._freeCount === this.capacity) {
            this.capacity *= this._capacityRatio;
        }
        this._freeList[this._freeCount] = object;
        ++this._freeCount;
    }
    /**
     * Releases all of the objects in the passed array. These need not be allocated using `allocateArray`, however.
     *
     * @param {T[]} array
     */
    releaseArray(array) {
        this._returnRate += array.length;
        this._flowRate -= array.length;
        if (this._freeCount + array.length > this.capacity) {
            // Ensure we have enough capacity to insert the release objects
            this.capacity = Math.max(this.capacity * this._capacityRatio, this._freeCount + array.length);
        }
        // Place objects into pool list
        for (let i = 0, j = array.length; i < j; i++) {
            this._freeList[this._freeCount] = array[i];
            ++this._freeCount;
        }
    }
    /**
     * Preallocates objects so that the pool size is at least `count`.
     *
     * @param {number} count
     */
    reserve(count) {
        this._reserveCount = count;
        if (this._freeCount < count) {
            const diff = this._freeCount - count;
            for (let i = 0; i < diff; i++) {
                this._freeList[this._freeCount] = this.create();
                ++this._freeCount;
            }
        }
    }
    /**
     * Dereferences objects for the GC to collect and brings the pool size down to `count`.
     *
     * @param {number} count
     */
    limit(count) {
        if (this._freeCount > count) {
            const oldCapacity = this.capacity;
            if (oldCapacity > count * this._capacityRatio) {
                this.capacity = count * this._capacityRatio;
            }
            const excessBound = Math.min(this._freeCount, this.capacity);
            for (let i = count; i < excessBound; i++) {
                this._freeList[i] = null;
            }
        }
    }
    /**
     * Install the GC on the shared ticker.
     *
     * @param {Ticker}[ticker=Ticker.shared]
     */
    startGC(ticker$1 = ticker.Ticker.shared) {
        ticker$1.add(this._gcTick, null, ticker.UPDATE_PRIORITY.UTILITY);
    }
    /**
     * Stops running the GC on the pool.
     *
     * @param {Ticker}[ticker=Ticker.shared]
     */
    stopGC(ticker$1 = ticker.Ticker.shared) {
        ticker$1.remove(this._gcTick);
    }
}

const poolMap = new Map();
/**
 * Factory for creating pools of objects with default constructors. It will store the pool of
 * a given type and reuse it on further builds.
 *
 * @class
 * @public
 * @example
 * ```js
 * import { ObjectPool, ObjectPoolFactory } from 'pixi-object-pool';
 *
 * class AABB {}
 *
 * const opool: ObjectPool<AABB> = ObjectPoolFactory.build(AABB) as ObjectPool<AABB>;
 *
 * const temp = opool.borrowObject();
 * // do something
 * opool.returnObject(temp);
 * ```
 */
class ObjectPoolFactory {
    /**
     * @param {Class} Type
     */
    static build(Type) {
        let pool = poolMap.get(Type);
        if (pool) {
            return pool;
        }
        pool = new (class DefaultObjectPool extends ObjectPool {
            create() {
                return new Type();
            }
        })();
        poolMap.set(Type, pool);
        return pool;
    }
}

exports.ObjectPool = ObjectPool;
exports.ObjectPoolFactory = ObjectPoolFactory;
//# sourceMappingURL=pixi-object-pool.js.map
