/* eslint-disable */
 
/*!
 * @pixi-essentials/object-pool - v0.0.5
 * Compiled Sat, 22 Aug 2020 23:15:47 UTC
 *
 * @pixi-essentials/object-pool is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 * 
 * Copyright 2019-2020, Shukant Pal <shukantpal@outlook.com>, All Rights Reserved
 */
this.PIXI = this.PIXI || {};
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@pixi/ticker')) :
    typeof define === 'function' && define.amd ? define(['exports', '@pixi/ticker'], factory) :
    (global = global || self, factory(global._pixi_essentials_object_pool = {}, global.PIXI));
}(this, (function (exports, ticker) { 'use strict';

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

    var __assign = function() {
        __assign = Object.assign || function __assign(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };

    function __rest(s, e) {
        var t = {};
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
            t[p] = s[p];
        if (s != null && typeof Object.getOwnPropertySymbols === "function")
            for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
                if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                    t[p[i]] = s[p[i]];
            }
        return t;
    }

    function __decorate(decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    }

    function __param(paramIndex, decorator) {
        return function (target, key) { decorator(target, key, paramIndex); }
    }

    function __metadata(metadataKey, metadataValue) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(metadataKey, metadataValue);
    }

    function __awaiter(thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    }

    function __generator(thisArg, body) {
        var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
        return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
        function verb(n) { return function (v) { return step([n, v]); }; }
        function step(op) {
            if (f) throw new TypeError("Generator is already executing.");
            while (_) try {
                if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
                if (y = 0, t) op = [op[0] & 2, t.value];
                switch (op[0]) {
                    case 0: case 1: t = op; break;
                    case 4: _.label++; return { value: op[1], done: false };
                    case 5: _.label++; y = op[1]; op = [0]; continue;
                    case 7: op = _.ops.pop(); _.trys.pop(); continue;
                    default:
                        if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                        if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                        if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                        if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                        if (t[2]) _.ops.pop();
                        _.trys.pop(); continue;
                }
                op = body.call(thisArg, _);
            } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
            if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
        }
    }

    var __createBinding = Object.create ? (function(o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
    }) : (function(o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
    });

    function __exportStar(m, o) {
        for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(o, p)) __createBinding(o, m, p);
    }

    function __values(o) {
        var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
        if (m) return m.call(o);
        if (o && typeof o.length === "number") return {
            next: function () {
                if (o && i >= o.length) o = void 0;
                return { value: o && o[i++], done: !o };
            }
        };
        throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
    }

    function __read(o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m) return o;
        var i = m.call(o), r, ar = [], e;
        try {
            while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
        }
        catch (error) { e = { error: error }; }
        finally {
            try {
                if (r && !r.done && (m = i["return"])) m.call(i);
            }
            finally { if (e) throw e.error; }
        }
        return ar;
    }

    function __spread() {
        for (var ar = [], i = 0; i < arguments.length; i++)
            ar = ar.concat(__read(arguments[i]));
        return ar;
    }

    function __spreadArrays() {
        for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
        for (var r = Array(s), k = 0, i = 0; i < il; i++)
            for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
                r[k] = a[j];
        return r;
    };

    function __await(v) {
        return this instanceof __await ? (this.v = v, this) : new __await(v);
    }

    function __asyncGenerator(thisArg, _arguments, generator) {
        if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
        var g = generator.apply(thisArg, _arguments || []), i, q = [];
        return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
        function verb(n) { if (g[n]) i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
        function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
        function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
        function fulfill(value) { resume("next", value); }
        function reject(value) { resume("throw", value); }
        function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
    }

    function __asyncDelegator(o) {
        var i, p;
        return i = {}, verb("next"), verb("throw", function (e) { throw e; }), verb("return"), i[Symbol.iterator] = function () { return this; }, i;
        function verb(n, f) { i[n] = o[n] ? function (v) { return (p = !p) ? { value: __await(o[n](v)), done: n === "return" } : f ? f(v) : v; } : f; }
    }

    function __asyncValues(o) {
        if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
        var m = o[Symbol.asyncIterator], i;
        return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
        function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
        function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
    }

    function __makeTemplateObject(cooked, raw) {
        if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
        return cooked;
    };

    var __setModuleDefault = Object.create ? (function(o, v) {
        Object.defineProperty(o, "default", { enumerable: true, value: v });
    }) : function(o, v) {
        o["default"] = v;
    };

    function __importStar(mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
        __setModuleDefault(result, mod);
        return result;
    }

    function __importDefault(mod) {
        return (mod && mod.__esModule) ? mod : { default: mod };
    }

    function __classPrivateFieldGet(receiver, privateMap) {
        if (!privateMap.has(receiver)) {
            throw new TypeError("attempted to get private field on non-instance");
        }
        return privateMap.get(receiver);
    }

    function __classPrivateFieldSet(receiver, privateMap, value) {
        if (!privateMap.has(receiver)) {
            throw new TypeError("attempted to set private field on non-instance");
        }
        privateMap.set(receiver, value);
        return value;
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
        ObjectPool.prototype.startGC = function (ticker$1) {
            if (ticker$1 === void 0) { ticker$1 = ticker.Ticker.shared; }
            ticker$1.add(this._gcTick, null, ticker.UPDATE_PRIORITY.UTILITY);
        };
        /**
         * Stops running the GC on the pool.
         *
         * @param {Ticker}[ticker=Ticker.shared]
         */
        ObjectPool.prototype.stopGC = function (ticker$1) {
            if (ticker$1 === void 0) { ticker$1 = ticker.Ticker.shared; }
            ticker$1.remove(this._gcTick);
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

    exports.ObjectPool = ObjectPool;
    exports.ObjectPoolFactory = ObjectPoolFactory;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
Object.assign(this.PIXI, _pixi_essentials_object_pool);
//# sourceMappingURL=pixi-object-pool.js.map
