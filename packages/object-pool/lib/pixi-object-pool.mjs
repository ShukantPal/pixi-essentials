/*!
 * @pixi-essentials/object-pool - v0.0.2
 * Compiled Sat, 18 Jul 2020 22:18:12 UTC
 *
 * @pixi-essentials/object-pool is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 */
import { Ticker, UPDATE_PRIORITY } from '@pixi/ticker';

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
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return extendStatics(d, b);
};

function __extends(d, b) {
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

/**
 * Provides the exponential moving average of a sequence.
 *
 * Ignored because not directly exposed.
 *
 * @internal
 * @ignore
 * @class
 */
var AverageProvider = /** @class */ (function () {
    /**
     * @ignore
     * @param {number} windowSize - no. of inputs used to calculate window
     * @param {number} decayRatio - quantifies the weight of previous values (b/w 0 and 1)
     */
    function AverageProvider(windowSize, decayRatio) {
        this._history = new Array(windowSize);
        this._decayRatio = decayRatio;
        this._currentIndex = 0;
        for (var i = 0; i < windowSize; i++) {
            this._history[i] = 0;
        }
    }
    /**
     * @ignore
     * @param {number} input - the next value in the sequence
     * @returns {number} - the moving average
     */
    AverageProvider.prototype.next = function (input) {
        var _a = this, history = _a._history, decayRatio = _a._decayRatio;
        var historyLength = history.length;
        this._currentIndex = this._currentIndex < historyLength - 1 ? this._currentIndex + 1 : 0;
        history[this._currentIndex] = input;
        var weightedSum = 0;
        var weight = 0;
        for (var i = this._currentIndex + 1; i < historyLength; i++) {
            weightedSum = (weightedSum + history[i]) * decayRatio;
            weight = (weight + 1) * decayRatio;
        }
        for (var i = 0; i <= this._currentIndex; i++) {
            weightedSum = (weightedSum + history[i]) * decayRatio;
            weight = (weight + 1) * decayRatio;
        }
        this._average = weightedSum / weight;
        return this._average;
    };
    AverageProvider.prototype.absDev = function () {
        var errSum = 0;
        for (var i = 0, j = this._history.length; i < j; i++) {
            errSum += Math.abs(this._history[i] - this._average);
        }
        return errSum / this._history.length;
    };
    return AverageProvider;
}());

/**
 * `ObjectPool` provides the framework necessary for pooling minus the object instantiation
 * method. You can use `ObjectPoolFactory` for objects that can be created using a default
 * constructor.
 *
 * @template T
 * @class
 * @public
 */
var ObjectPool = /** @class */ (function () {
    /**
     * @param {IObjectPoolOptions} options
     */
    function ObjectPool(options) {
        var _this = this;
        if (options === void 0) { options = {}; }
        this._gcTick = function () {
            _this._borrowRateAverage = _this._borrowRateAverageProvider.next(_this._borrowRate);
            _this._marginAverage = _this._marginAverageProvider.next(_this._freeCount - _this._borrowRate);
            var absDev = _this._borrowRateAverageProvider.absDev();
            _this._flowRate = 0;
            _this._borrowRate = 0;
            _this._returnRate = 0;
            var poolSize = _this._freeCount;
            var poolCapacity = _this._freeList.length;
            // If the pool is small enough, it shouldn't really matter
            if (poolSize < 128 && _this._borrowRateAverage < 128 && poolCapacity < 128) {
                return;
            }
            // If pool is say, 2x, larger than borrowing rate on average (adjusted for variance/abs-dev), then downsize.
            var threshold = Math.max(_this._borrowRateAverage * (_this._capacityRatio - 1), _this._reserveCount);
            if (_this._freeCount > threshold + absDev) {
                var newCap = threshold + absDev;
                _this.capacity = Math.min(_this._freeList.length, Math.ceil(newCap));
                _this._freeCount = _this._freeList.length;
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
    Object.defineProperty(ObjectPool.prototype, "capacity", {
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
        get: function () {
            return this._freeList.length;
        },
        set: function (cp) {
            this._freeList.length = Math.ceil(cp);
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Obtains an instance from this pool.
     *
     * @returns {T}
     */
    ObjectPool.prototype.allocate = function () {
        ++this._borrowRate;
        ++this._flowRate;
        if (this._freeCount > 0) {
            return this._freeList[--this._freeCount];
        }
        return this.create();
    };
    /**
     * Obtains an array of instances from this pool. This is faster than allocating multiple objects
     * separately from this pool.
     *
     * @param {number | T[]} lengthOrArray - no. of objects to allocate OR the array itself into which
     *      objects are inserted. The amount to allocate is inferred from the array's length.
     * @returns {T[]} array of allocated objects
     */
    ObjectPool.prototype.allocateArray = function (lengthOrArray) {
        var array;
        var length;
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
        var filled = 0;
        // Allocate as many objects from the existing pool
        if (this._freeCount > 0) {
            var pool = this._freeList;
            var poolFilled = Math.min(this._freeCount, length);
            var poolSize = this._freeCount;
            for (var i = 0; i < poolFilled; i++) {
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
    };
    /**
     * Returns the object to the pool.
     *
     * @param {T} object
     */
    ObjectPool.prototype.release = function (object) {
        ++this._returnRate;
        --this._flowRate;
        if (this._freeCount === this.capacity) {
            this.capacity *= this._capacityRatio;
        }
        this._freeList[this._freeCount] = object;
        ++this._freeCount;
    };
    /**
     * Releases all of the objects in the passed array. These need not be allocated using `allocateArray`, however.
     *
     * @param {T[]} array
     */
    ObjectPool.prototype.releaseArray = function (array) {
        this._returnRate += array.length;
        this._flowRate -= array.length;
        if (this._freeCount + array.length > this.capacity) {
            // Ensure we have enough capacity to insert the release objects
            this.capacity = Math.max(this.capacity * this._capacityRatio, this._freeCount + array.length);
        }
        // Place objects into pool list
        for (var i = 0, j = array.length; i < j; i++) {
            this._freeList[this._freeCount] = array[i];
            ++this._freeCount;
        }
    };
    /**
     * Preallocates objects so that the pool size is at least `count`.
     *
     * @param {number} count
     */
    ObjectPool.prototype.reserve = function (count) {
        this._reserveCount = count;
        if (this._freeCount < count) {
            var diff = this._freeCount - count;
            for (var i = 0; i < diff; i++) {
                this._freeList[this._freeCount] = this.create();
                ++this._freeCount;
            }
        }
    };
    /**
     * Dereferences objects for the GC to collect and brings the pool size down to `count`.
     *
     * @param {number} count
     */
    ObjectPool.prototype.limit = function (count) {
        if (this._freeCount > count) {
            var oldCapacity = this.capacity;
            if (oldCapacity > count * this._capacityRatio) {
                this.capacity = count * this._capacityRatio;
            }
            var excessBound = Math.min(this._freeCount, this.capacity);
            for (var i = count; i < excessBound; i++) {
                this._freeList[i] = null;
            }
        }
    };
    /**
     * Install the GC on the shared ticker.
     *
     * @param {Ticker}[ticker=Ticker.shared]
     */
    ObjectPool.prototype.startGC = function (ticker) {
        if (ticker === void 0) { ticker = Ticker.shared; }
        ticker.add(this._gcTick, null, UPDATE_PRIORITY.UTILITY);
    };
    /**
     * Stops running the GC on the pool.
     *
     * @param {Ticker}[ticker=Ticker.shared]
     */
    ObjectPool.prototype.stopGC = function (ticker) {
        if (ticker === void 0) { ticker = Ticker.shared; }
        ticker.remove(this._gcTick);
    };
    return ObjectPool;
}());

var poolMap = new Map();
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
var ObjectPoolFactory = /** @class */ (function () {
    function ObjectPoolFactory() {
    }
    /**
     * @param {Class} Type
     */
    ObjectPoolFactory.build = function (Type) {
        var pool = poolMap.get(Type);
        if (pool) {
            return pool;
        }
        pool = new (/** @class */ (function (_super) {
            __extends(DefaultObjectPool, _super);
            function DefaultObjectPool() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            DefaultObjectPool.prototype.create = function () {
                return new Type();
            };
            return DefaultObjectPool;
        }(ObjectPool)))();
        poolMap.set(Type, pool);
        return pool;
    };
    return ObjectPoolFactory;
}());

export { ObjectPool, ObjectPoolFactory };
//# sourceMappingURL=pixi-object-pool.mjs.map
