import { DisplayObject } from 'pixi.js';
import { Rectangle } from 'pixi.js';

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
     * @param skipUpdate - whether to skip transform update
     * @return this
     */
    cull(rect: Rectangle, skipUpdate?: boolean): this;
    /**
     * Sets all display-objects to the unculled state.
     *
     * @return this
     */
    uncull(): this;
    protected cullRecursive(rect: Rectangle, displayObject: DisplayObject): void;
    protected uncullRecursive(displayObject: DisplayObject): void;
}

/**
 * @internal
 */
declare interface ICullOptions {
    recursive: boolean;
    toggle: 'visible' | 'renderable';
}

export { }
