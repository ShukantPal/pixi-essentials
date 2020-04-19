import { BatchableEntity, entityPool } from './BatchableEntity';

/**
 * Batch bucket that holds all the display-objects with a given batch-ID, sorted by their layer-ID.
 *
 * @internal
 * @class
 */
export class BatchBucket
{
    size: number;
    layers: Array<BatchableEntity>;

    /**
     * Put the entity into this bucket.
     *
     * @param {BatchableEntity} entity
     */
    put(entity: BatchableEntity): void
    {
        const { layerID } = entity;
        const nextEntity = this.layers[layerID];

        entity.next = nextEntity;

        if (nextEntity)
        {
            nextEntity.previous = entity;
        }

        this.layers[layerID] = entity;
        entity.previous = null;
    }

    /**
     * Resets this bucket and releases all held batchable-entities.
     */
    reset(): void
    {
        for (let i = 0, j = this.layers.length; i < j; i++)
        {
            let entity = this.layers[i];
            let nextEntity = null;

            while (entity)
            {
                nextEntity = entity.next;

                entityPool.release(entity);
                entity = nextEntity;
            }
        }

        this.layers.length = 0;
    }
}
