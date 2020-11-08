import { ObjectPool } from './ObjectPool';

/**
 * This stores existing object pools created for class-constructed objects.
 *
 * @ignore
 */
const poolMap: Map<{ new(): any }, ObjectPool<any>> = new Map();

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
export class ObjectPoolFactory
{
    /**
     * Builds an object-pool for objects constructed from the given class with a default constructor. If an
     * object pool for that class was already created, an existing instance is returned.
     *
     * @param classConstructor
     */
    static build<T>(Type: { new(): T }): ObjectPool<T>
    {
        let pool = poolMap.get(Type);

        if (pool)
        {
            return pool;
        }

        pool = new (class DefaultObjectPool extends ObjectPool<any>
        {
            create(): any
            {
                return new Type();
            }
        })();

        poolMap.set(Type, pool);

        return pool;
    }

    /**
     * Builds an object-pool for objects built using a factory function. The factory function's context will be the
     * object-pool.
     *
     * These types of pools are not cached and should only be used on internal data structures.
     *
     * @param factoryFunction
     */
    static buildFunctional<T>(factoryFunction: () => T): ObjectPool<T>
    {
        return new (class DefaultObjectPool extends ObjectPool<T>
        {
            create = factoryFunction;
        })();
    }
}
