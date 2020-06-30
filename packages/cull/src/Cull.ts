import type { DisplayObject } from 'pixi.js';
import { Rectangle } from 'pixi.js';

const tempRect = new Rectangle();

interface ICullOptions
{
    toggle: 'visible' | 'renderable';
}

/**
 * WIP: Better culling than pixi-cull
 */
export class Cull
{
    private _toggle: 'visible' | 'renderable';

    private _targetList: Set<DisplayObject>;

    constructor(options: Partial<ICullOptions> = {})
    {
        this._toggle = options.toggle || 'visible';
        this._targetList = new Set<DisplayObject>();
    }

    add(target: DisplayObject): void
    {
        this._targetList.add(target);
    }

    addAll(targets: DisplayObject[]): void
    {
        for (let i = 0, j = targets.length; i < j; i++)
        {
            this._targetList.add(targets[i]);
        }
    }

    remove(target: DisplayObject): void
    {
        this._targetList.delete(target);
    }

    removeAll(targets: DisplayObject[]): void
    {
        for (let i = 0, j = targets.length; i < j; i++)
        {
            this._targetList.delete(targets[i]);
        }
    }

    clear(): void
    {
        this._targetList.clear();
    }

    /**
     * @param rect - the rectangle outside of which display-objects should be culled
     * @param skipUpdate - whether to skip transform update
     */
    cull(rect: Rectangle, skipUpdate = false): void
    {
        this._targetList.forEach((target) =>
        {
            if (!skipUpdate)
            {
                const parent = target.parent;

                // TODO: pixi.js 5.3.0 use enableTempParent()
                if (!target.parent)
                {
                    target.parent = target._tempDisplayObjectParent;
                }

                target.updateTransform();
                target.parent = parent;
            }

            this.cullRecursive(rect, target);
        });
    }

    protected cullRecursive(rect: Rectangle, displayObject: DisplayObject): void
    {
        // NOTE: getBounds can skipUpdate because updateTransform is invoked before culling.
        const bounds = displayObject.getBounds(true, tempRect);

        displayObject[this._toggle] = bounds.right > rect.left
            && bounds.left < rect.right
            && bounds.bottom > rect.top
            && bounds.top < rect.bottom;

        // Only cull children if this display-object is visible. It is expected that the bounds
        // of children lie inside of its own.
        if (displayObject[this._toggle])
        {
            this.cullRecursive(rect, displayObject);
        }
    }
}
