import { Ticker, UPDATE_PRIORITY } from '@pixi/ticker';

/**
 * @interface
 * @public
 */
export interface IObjectPoolOptions
{
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
export abstract class ObjectPool<T extends typeof Object>
{
    public capacityRatio: number;
    public decayRatio: number;

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
    constructor(options: IObjectPoolOptions = {})
    {
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
         * Rate at which object is borrowed.
         *
         * @member {number}
         * @protected
         */
        this._borrowRate = 0;

        /**
         * Rate at which object is returned.
         *
         * @member {number}
         * @protected
         */
        this._returnRate = 0;

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

        this._history = 0;

        if (!options.noInstall)
        {
            this.install();
        }
    }

    /**
     * Instantiates a new object of type `T`.
     *
     * @abstract
     * @returns {T}
     */
    abstract createObject(): T;

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
    borrowObject(): T
    {
        ++this._borrowRate;
        ++this._flowRate;

        if (this._poolSize > 0)
        {
            return this._pool[--this._poolSize];
        }

        return this.createObject();
    }

    /**
     * Returns the object to the pool.
     *
     * @param {T} object
     */
    returnObject(object: T): void
    {
        ++this._returnRate;
        --this._flowRate;

        if (this._poolSize === this._pool.length)
        {
            this._pool.length *= this.capacityRatio;
        }

        this._pool[this._poolSize] = object;
        ++this._poolSize;
    }

    /**
     * Install the object pool callback on the shared ticker.
     *
     * @param {Ticker}[ticker=Ticker.shared]
     */
    install(ticker: Ticker = Ticker.shared): void
    {
        ticker.add(() =>
        {
            this._currentDemand *= this.decayRatio;
            this._currentDemand += (1 - this.decayRatio) * this._borrowRate;

            if (this._history === 0)
            {
                this._currentDemand = this._borrowRate;
            }
            ++this._history;

            this._currentDemand = Math.ceil(this._currentDemand);

            this._flowRate = 0;
            this._borrowRate = 0;
            this._returnRate = 0;

            const poolSize = this._poolSize;
            const poolCapacity = this._pool.length;

            // If the pool is small enough, it shouldn't really matter
            if (poolSize < 128 && this._currentDemand < 128 && poolCapacity < 128)
            {
                return;
            }

            const currentDemand = this._currentDemand < 0 ? 0 : this._currentDemand;

            if (poolSize >= currentDemand * 2)
            {
                // Current demand is +ve, hence pool overflow unlikely
                this._pool.length = currentDemand;
                this._poolSize = this._pool.length;
            }
        },
        null,
        UPDATE_PRIORITY.UTILITY);
    }
}
