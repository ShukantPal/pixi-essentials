import { DisplayObject } from '@pixi/display';
import { Rectangle } from '@pixi/math';

/**
 * Provides a simple, configurable mechanism for culling a subtree of your scene graph.
 *
 * If your scene graph is not static, culling needs to be done before rendering. You
 * can run it on the `prerender` event fired by the renderer.
 *
 * @public
 */
export declare class Cull {
    private _recursive;
    private _toggle;
    private _targetList;
    /**
     * @param options
     * @param [options.recursive] - whether culling should be recursive
     * @param [options.toggle='renderable'] - which property of display-object was be set to indicate
     *      its culling state. It should be one of `renderable`, `visible`.
     */
    constructor(options?: Partial<ICullOptions>);
    /**
     * Adds a display-object to the culling list
     *
     * @param target - the display-object to be culled
     * @return this
     */
    add(target: DisplayObject): this;
    /**
     * Adds all the display-objects to the culling list
     *
     * @param targets - the display-objects to be culled
     * @return this
     */
    addAll(targets: DisplayObject[]): this;
    /**
     * Removes the display-object from the culling list
     *
     * @param target - the display-object to be removed
     * @return this
     */
    remove(target: DisplayObject): this;
    /**
     * Removes all the passed display-objects from the culling list
     *
     * @param targets - the display-objects to be removed
     * @return this
     */
    removeAll(targets: DisplayObject[]): this;
    /**
     * Clears the culling list
     *
     * @return this
     */
    clear(): this;
    /**
     * @param rect - the rectangle outside of which display-objects should be culled
     * @param skipUpdate - whether to skip unculling, transform update, bounds calculation. It is
     *  highly recommended you enable this by calling _this.uncull()_ and _root.getBounds(false)_ manually
     *  before your render loop.
     * @return this
     */
    cull(rect: Rectangle, skipUpdate?: boolean): this;
    /**
     * Sets all display-objects to the unculled state.
     *
     * This happens regardless of whether the culling toggle was set by {@code this.cull} or manually. This
     * is why it is recommended to one of `visible` or `renderable` for normal use and the other for culling.
     *
     * @return this
     */
    uncull(): this;
    /**
     * Recursively culls the subtree of {@code displayObject}.
     *
     * @param rect - the visiblity rectangle
     * @param displayObject - the root of the subtree to cull
     * @param skipUpdate - whether to skip bounds calculation. However, transforms are expected to be updated by the caller.
     */
    protected cullRecursive(rect: Rectangle, displayObject: DisplayObject, skipUpdate?: boolean): void;
    /**
     * Recursively unculls the subtree of {@code displayObject}.
     *
     * @param displayObject
     */
    protected uncullRecursive(displayObject: DisplayObject): void;
}

/**
 * The culling options for {@code Cull}.
 *
 * @ignore
 * @public
 */
export declare interface ICullOptions {
    recursive: boolean;
    toggle: 'visible' | 'renderable';
}

export { }
