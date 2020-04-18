import { Ticker } from '@pixi/ticker';

/**
 * @interface
 * @public
 */
export declare interface IObjectPoolOptions {
    capacityRatio?: number;
    decayRatio?: number;
    reserve?: number;
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
export declare abstract class ObjectPool<T extends typeof Object> {
    protected _freeList: Array<T>;
    protected _freeCount: number;
    protected _reserveCount: number;
    protected _borrowRate: number;
    protected _returnRate: number;
    protected _flowRate: number;
    protected _borrowRateAverage: number;
    protected _marginAverage: number;
    private _capacityRatio;
    private _decayRatio;
    private _borrowRateAverageProvider;
    private _marginAverageProvider;
    /**
     * @param {IObjectPoolOptions} options
     */
    constructor(options?: IObjectPoolOptions);
    /**
     * Instantiates a new object of type `T`.
     *
     * @abstract
     * @returns {T}
     */
    abstract create(): T;
    /**
     * The number of objects that can be stored in the pool without allocating more space.
     *
     * @member {number}
     */
    protected get capacity(): number;
    protected set capacity(cp: number);
    /**
     * Obtains an instance from this pool.
     *
     * @returns {T}
     */
    allocate(): T;
    /**
     * Returns the object to the pool.
     *
     * @param {T} object
     */
    release(object: T): void;
    /**
     * Preallocates objects so that the pool size is at least `count`.
     *
     * @param {number} count
     */
    reserve(count: number): void;
    /**
     * Dereferences objects for the GC to collect and brings the pool size down to `count`.
     *
     * @param {number} count
     */
    limit(count: number): void;
    /**
     * Install the GC on the shared ticker.
     *
     * @param {Ticker}[ticker=Ticker.shared]
     */
    startGC(ticker?: Ticker): void;
    /**
     * Stops running the GC on the pool.
     *
     * @param {Ticker}[ticker=Ticker.shared]
     */
    stopGC(ticker?: Ticker): void;
    private _gcTick;
}

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
export declare class ObjectPoolFactory {
    /**
     * @param {Class} Type
     */
    static build(Type: typeof Object): ObjectPool<any>;
}

export { }
