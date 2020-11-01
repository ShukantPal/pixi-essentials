import { Ticker, UPDATE_PRIORITY } from '@pixi/ticker';
import { AverageProvider } from './AverageProvider';

/**
 * @interface
 * @public
 */
export interface IObjectPoolOptions
{
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
export abstract class ObjectPool<T>
{
    protected _freeList: Array<T>;
    protected _freeCount: number;
    protected _reserveCount: number;

    protected _borrowRate: number;
    protected _returnRate: number;
    protected _flowRate: number;
    protected _borrowRateAverage: number;
    protected _marginAverage: number;

    private _capacityRatio: number;
    private _decayRatio: number;
    private _borrowRateAverageProvider: AverageProvider;
    private _marginAverageProvider: AverageProvider;

    /**
     * @param {IObjectPoolOptions} options
     */
    constructor(options: IObjectPoolOptions = {})
    {
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

    /**
     * Instantiates a new object of type `T`.
     *
     * @abstract
     * @returns {T}
     */
    abstract create(): T;

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
    protected get capacity(): number
    {
        return this._freeList.length;
    }
    protected set capacity(cp: number)
    {
        this._freeList.length = Math.ceil(cp);
    }

    /**
     * Obtains an instance from this pool.
     *
     * @returns {T}
     */
    allocate(): T
    {
        ++this._borrowRate;

        ++this._flowRate;

        if (this._freeCount > 0)
        {
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
    allocateArray(lengthOrArray: number | T[]): T[]
    {
        let array: T[];
        let length: number;

        if (Array.isArray(lengthOrArray))
        {
            array = lengthOrArray;
            length = lengthOrArray.length;
        }
        else
        {
            length = lengthOrArray;
            array = new Array(length);
        }

        this._borrowRate += length;
        this._flowRate += length;

        let filled = 0;

        // Allocate as many objects from the existing pool
        if (this._freeCount > 0)
        {
            const pool = this._freeList;
            const poolFilled = Math.min(this._freeCount, length);
            let poolSize = this._freeCount;

            for (let i = 0; i < poolFilled; i++)
            {
                array[filled] = pool[poolSize - 1];
                ++filled;
                --poolSize;
            }

            this._freeCount = poolSize;
        }

        // Construct the rest of the allocation
        while (filled < length)
        {
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
    release(object: T): void
    {
        ++this._returnRate;
        --this._flowRate;

        if (this._freeCount === this.capacity)
        {
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
    releaseArray(array: T[]): void
    {
        this._returnRate += array.length;
        this._flowRate -= array.length;

        if (this._freeCount + array.length > this.capacity)
        {
            // Ensure we have enough capacity to insert the release objects
            this.capacity = Math.max(this.capacity * this._capacityRatio, this._freeCount + array.length);
        }

        // Place objects into pool list
        for (let i = 0, j = array.length; i < j; i++)
        {
            this._freeList[this._freeCount] = array[i];
            ++this._freeCount;
        }
    }

    /**
     * Preallocates objects so that the pool size is at least `count`.
     *
     * @param {number} count
     */
    reserve(count: number): void
    {
        this._reserveCount = count;

        if (this._freeCount < count)
        {
            const diff = this._freeCount - count;

            for (let i = 0; i < diff; i++)
            {
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
    limit(count: number): void
    {
        if (this._freeCount > count)
        {
            const oldCapacity = this.capacity;

            if (oldCapacity > count * this._capacityRatio)
            {
                this.capacity = count * this._capacityRatio;
            }

            const excessBound = Math.min(this._freeCount, this.capacity);

            for (let i = count; i < excessBound; i++)
            {
                this._freeList[i] = null;
            }
        }
    }

    /**
     * Install the GC on the shared ticker.
     *
     * @param {Ticker}[ticker=Ticker.shared]
     */
    startGC(ticker: Ticker = Ticker.shared): void
    {
        ticker.add(this._gcTick, null, UPDATE_PRIORITY.UTILITY);
    }

    /**
     * Stops running the GC on the pool.
     *
     * @param {Ticker}[ticker=Ticker.shared]
     */
    stopGC(ticker: Ticker = Ticker.shared): void
    {
        ticker.remove(this._gcTick);
    }

    private _gcTick = (): void =>
    {
        this._borrowRateAverage = this._borrowRateAverageProvider.next(this._borrowRate);
        this._marginAverage = this._marginAverageProvider.next(this._freeCount - this._borrowRate);

        const absDev = this._borrowRateAverageProvider.absDev();

        this._flowRate = 0;
        this._borrowRate = 0;
        this._returnRate = 0;

        const poolSize = this._freeCount;
        const poolCapacity = this._freeList.length;

        // If the pool is small enough, it shouldn't really matter
        if (poolSize < 128 && this._borrowRateAverage < 128 && poolCapacity < 128)
        {
            return;
        }

        // If pool is say, 2x, larger than borrowing rate on average (adjusted for variance/abs-dev), then downsize.
        const threshold = Math.max(this._borrowRateAverage * (this._capacityRatio - 1), this._reserveCount);

        if (this._freeCount > threshold + absDev)
        {
            const newCap = threshold + absDev;

            this.capacity = Math.min(this._freeList.length, Math.ceil(newCap));
            this._freeCount = this._freeList.length;
        }
    };
}
