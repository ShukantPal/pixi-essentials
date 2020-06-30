import { BVHNode } from './BVHNode';
import { BVHObject } from './BVHObject';
import { BVHTree } from './BVHTree';
import { ObjectPoolFactory } from '@pixi-essentials/object-pool';
import { BVHObjectInfo } from './BVHObjectInfo';

const nodePool = ObjectPoolFactory.build(BVHNode as unknown as ObjectConstructor);
const objectInfoPool = ObjectPoolFactory.build(BVHObjectInfo as unknown as ObjectConstructor);
const rectPool = ObjectPoolFactory.build(Rectangle as unknown as ObjectConstructor);

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
        const objectInfos = objectInfoPool.allocateArray(objects.length);

        for (let i = 0, j = objectInfos.length; i < j; i++)
        {
            objectInfos[i].set(objects[i]);
        }
    }

    protected static buildRecursive(
        objectInfos: BVHObjectInfo[],
        start: number,
        end: number,
        nodeCount: { totalNodes: number },
        orderedObjects: BVHObject[]): void
    {
        const node = nodePool.allocate();
        const bounds = node.bounds;

        ++nodeCount.totalNodes;

        bounds.copyFrom(objectInfos[start].bounds);

        for (let i = start + 1; i < end; i++)
        {
            bounds.enlarge(objectInfos[i].bounds);
        }

        const objectCount = end - start;

        if (objectCount === 1)
        {

        }
        else
        {

        }
    }
}
