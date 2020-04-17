/*!
 * @pixi-essentials/object-pool - v0.0.1-alpha.2
 * Compiled Fri, 17 Apr 2020 21:52:50 UTC
 *
 * @pixi-essentials/object-pool is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 */
import { Ticker, UPDATE_PRIORITY } from '@pixi/ticker';

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
        if (options === void 0) { options = {}; }
        /**
         * Supply pool of objects that can be used to immediately lend.
         *
         * @template T
         * @member {Array<T>}
         * @protected
         */
        this._pool = [];
        /**
         * Number of objects in the pool. This is less than or equal to `_pool.length`.
         *
         * @member {number}
         * @protected
         */
        this._poolSize = 0;
        /**
         * Rate at which objects are flowing out of the pool.
         *
         * @member {number}
         */
        this._flowRate = 0;
        /**
         * Averaged flow rate, i.e. the demand of objects from this pool.
         *
         * @member {number}
         */
        this._currentDemand = 0;
        /**
         * Ratio to which pool capacity is grown when it becomes full. For example, if pool capacity
         * is 100 and full, then its length will be set to 200 (if ratio = 2).
         *
         * @member {number}
         */
        this.capacityRatio = options.capacityRatio || 2;
        /**
         * Ratio used to exponentially average the flow rate. It should be between .95 and 1.
         *
         * @member {number}
         */
        this.decayRatio = options.decayRatio || 0.99;
        if (!options.noInstall) {
            this.install();
        }
    }
    // TODO: Support object destruction. It might not be so good for perf tho.
    // /**
    // * Destroys the object before discarding it.
    // *
    // * @param {T} object
    //  */
    // abstract destroyObject(object: T): void;
    /**
     * Obtains an instance from this pool.
     *
     * @returns {T}
     */
    ObjectPool.prototype.borrowObject = function () {
        ++this._flowRate;
        if (this._poolSize > 0) {
            return this._pool[--this._poolSize];
        }
        return this.createObject();
    };
    /**
     * Returns the object to the pool.
     *
     * @param {T} object
     */
    ObjectPool.prototype.returnObject = function (object) {
        --this._flowRate;
        if (this._poolSize === this._pool.length) {
            this._pool.length *= this.capacityRatio;
        }
        this._pool[this._poolSize] = object;
        ++this._poolSize;
    };
    /**
     * Install the object pool callback on the shared ticker.
     *
     * @param {Ticker}[ticker=Ticker.shared]
     */
    ObjectPool.prototype.install = function (ticker) {
        var _this = this;
        if (ticker === void 0) { ticker = Ticker.shared; }
        ticker.add(function () {
            _this._currentDemand *= _this.decayRatio;
            _this._currentDemand += (1 - _this.decayRatio) * _this._flowRate;
            _this._flowRate = 0;
            var poolSize = _this._poolSize;
            var poolCapacity = _this._pool.length;
            // If the pool is small enough, it shouldn't really matter
            if (poolSize < 128 && _this._currentDemand < 128 && poolCapacity < 128) {
                return;
            }
            var currentDemand = _this._currentDemand < 0 ? 0 : _this._currentDemand;
            if (poolSize >= currentDemand * 2) {
                // Current demand is +ve, hence pool overflow unlikely
                _this._pool.length = currentDemand;
                _this._poolSize = _this._pool.length;
            }
        }, null, UPDATE_PRIORITY.UTILITY);
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
    ObjectPoolFactory.prototype.build = function (Type) {
        var pool = poolMap.get(Type);
        if (pool) {
            return pool;
        }
        pool = new (/** @class */ (function (_super) {
            __extends(DefaultObjectPool, _super);
            function DefaultObjectPool() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            DefaultObjectPool.prototype.createObject = function () {
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
