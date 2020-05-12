import { BVHNode } from './BVHNode';
import { BVHObject } from './BVHObject';
import { BVHTree } from './BVHTree';
import { ObjectPoolFactory } from '@pixi-essentials/object-pool';

const nodePool = ObjectPoolFactory.build(BVHNode as ObjectConstructor);

/**
 *
 * ```js
 * renderer.addSystem('bvh', BVHSystem)
 * ```
 *
 * @memberof PIXI
 * @class
 * @extends PIXI.System
 */
export class BVHTreeFactory
{
    public static build(objects: BVHObject[]): BVHTree
    {
        // const
    }
}
