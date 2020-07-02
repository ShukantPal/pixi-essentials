import type { DisplayObject, Container, Rectangle } from 'pixi.js';

const tempRect = new Rectangle();

/**
 * @internal
 */
export interface ICullOptions
{
    recursive: boolean;
    toggle: 'visible' | 'renderable';
}

/**
 * Provides a simple, configurable mechanism for culling a subtree of your scene graph.
 *
 * If your scene graph is not static, culling needs to be done before rendering. You
 * can run it on the `prerender` event fired by the renderer.
 */
export class Cull
{
    private _recursive: boolean;
    private _toggle: 'visible' | 'renderable';
    private _targetList: Set<DisplayObject>;

    /**
     * @param options
     * @param [options.recursive] - whether culling should be recursive
     * @param [options.toggle='renderable'] - which property of display-object was be set to indicate
     *      its culling state. It should be one of `renderable`, `visible`.
     */
    constructor(options: Partial<ICullOptions> = {})
    {
        this._recursive = typeof options.recursive === 'boolean' ? options.recursive : true;
        this._toggle = options.toggle || 'visible';
        this._targetList = new Set<DisplayObject>();
    }

    /**
     * Adds a display-object to the culling list
     *
     * @param target - the display-object to be culled
     * @return this
     */
    add(target: DisplayObject): this
    {
        this._targetList.add(target);

        return this;
    }

    /**
     * Adds all the display-objects to the culling list
     *
     * @param targets - the display-objects to be culled
     * @return this
     */
    addAll(targets: DisplayObject[]): this
    {
        for (let i = 0, j = targets.length; i < j; i++)
        {
            this._targetList.add(targets[i]);
        }

        return this;
    }

    /**
     * Removes the display-object from the culling list
     *
     * @param target - the display-object to be removed
     * @return this
     */
    remove(target: DisplayObject): this
    {
        this._targetList.delete(target);

        return this;
    }

    /**
     * Removes all the passed display-objects from the culling list
     *
     * @param targets - the display-objects to be removed
     * @return this
     */
    removeAll(targets: DisplayObject[]): this
    {
        for (let i = 0, j = targets.length; i < j; i++)
        {
            this._targetList.delete(targets[i]);
        }

        return this;
    }

    /**
     * Clears the culling list
     *
     * @return this
     */
    clear(): this
    {
        this._targetList.clear();

        return this;
    }

    /**
     * @param rect - the rectangle outside of which display-objects should be culled
     * @param skipUpdate - whether to skip transform update
     * @return this
     */
    cull(rect: Rectangle, skipUpdate = false): this
    {
        this._targetList.forEach((target) =>
        {
            if (!skipUpdate)
            {
                // Update the transforms of display-objects in this target's subtree
                target.getBounds(false, tempRect);
            }

            if (this._recursive)
            {
                this.cullRecursive(rect, target);
            }
            else
            {
                // NOTE: If skip-update is false, then tempRect already contains the bounds of the target
                if (skipUpdate)
                {
                    target.getBounds(true, tempRect);
                }

                target[this._toggle] = tempRect.right > rect.left
                    && tempRect.left < rect.right
                    && tempRect.bottom > rect.top
                    && tempRect.top < rect.bottom;
            }
        });

        return this;
    }

    /**
     * Sets all display-objects to the unculled state.
     *
     * @return this
     */
    uncull(): this
    {
        this._targetList.forEach((target) =>
        {
            if (this._recursive)
            {
                this.uncullRecursive(target);
            }
            else
            {
                target[this._toggle] = false;
            }
        });

        return this;
    }

    protected cullRecursive(rect: Rectangle, displayObject: DisplayObject): void
    {
        // NOTE: getBounds can skipUpdate because updateTransform is invoked before culling.
        const bounds = displayObject.getBounds(true, tempRect);

        displayObject[this._toggle] = bounds.right > rect.left
            && bounds.left < rect.right
            && bounds.bottom > rect.top
            && bounds.top < rect.bottom;

        // Only cull children if this display-object is unculled. It is expected that the bounds
        // of children lie inside of its own.
        if (displayObject[this._toggle]
                && (displayObject as Container).children
                && (displayObject as Container).children.length)
        {
            const children = (displayObject as Container).children;

            for (let i = 0, j = children.length; i < j; i++)
            {
                this.cullRecursive(rect, children[i]);
            }
        }
    }

    protected uncullRecursive(displayObject: DisplayObject): void
    {
        displayObject[this._toggle] = true;

        if ((displayObject as Container).children && (displayObject as Container).children.length)
        {
            const children = (displayObject as Container).children;

            for (let i = 0, j = children.length; i < j; i++)
            {
                this.uncullRecursive(children[i]);
            }
        }
    }
}
