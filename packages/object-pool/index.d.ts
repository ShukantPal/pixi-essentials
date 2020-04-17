import { Ticker } from '@pixi/ticker';

/**
 * @interface
 * @public
 */
export declare interface IObjectPoolOptions {
    capacityRatio?: number;
    decayRatio?: number;
    noInstall?: boolean;
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
    capacityRatio: number;
    decayRatio: number;
    protected _pool: Array<T>;
    protected _poolSize: number;
    protected _borrowRate: number;
    protected _returnRate: number;
    protected _flowRate: number;
    protected _history: number;
    protected _currentDemand: number;
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
    abstract createObject(): T;
    /**
     * Obtains an instance from this pool.
     *
     * @returns {T}
     */
    borrowObject(): T;
    /**
     * Returns the object to the pool.
     *
     * @param {T} object
     */
    returnObject(object: T): void;
    /**
     * Install the object pool callback on the shared ticker.
     *
     * @param {Ticker}[ticker=Ticker.shared]
     */
    install(ticker?: Ticker): void;
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
