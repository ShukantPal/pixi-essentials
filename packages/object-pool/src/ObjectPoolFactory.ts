import { ObjectPool } from './ObjectPool';

const poolMap: Map<typeof Object, ObjectPool<any>> = new Map();

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
     * @param {Class} Type
     */
    static build(Type: typeof Object): ObjectPool<any>
    {
        let pool = poolMap.get(Type);

        if (pool)
        {
            return pool;
        }

        pool = new (class DefaultObjectPool extends ObjectPool<any>
        {
            createObject(): any
            {
                return new Type();
            }
        })();

        poolMap.set(Type, pool);

        return pool;
    }
}
