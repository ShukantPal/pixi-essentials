import { BoundedGeometry } from './BoundedGeometry';
import { Rectangle, Point } from '@pixi/math';

/**
 * {@code BoundedBufferGeometry} calculates its bounds on lazily via the {@code updateBounds}
 * method.
 *
 * @class
 * @extends BoundedGeometry
 */
export class BoundedBufferGeometry extends BoundedGeometry
{
    /**
     * The calculated bounds for this geometry.
     *
     * @member {PIXI.Rectangle}
     * @protected
     */
    protected _bounds: Rectangle;

    /**
     * @override
     */
    getBounds(rect?: Rectangle): Rectangle
    {
        if (!rect)
        {
            rect = new Rectangle();
        }

        if (!this._bounds)
        {
            rect.x = 0;
            rect.y = 0;
            rect.width = 0;
            rect.height = 0;

            return rect;
        }

        rect.copyFrom(this._bounds);

        return rect;
    }

    /**
     * Updates the bounds accordingly to include the given point.
     *
     * @param {PIXI.Point | number} x
     * @parma {number}[y]
     */
    updateBounds(x: Point | number, y?: number): void
    {
        if (x instanceof Point)
        {
            y = x.y;
            x = x.x;
        }
        else
        {
            y = y || x;
        }

        if (!this._bounds)
        {
            this._bounds = new Rectangle(x, y, 0, 0);

            return;
        }

        let minX = this._bounds.left;
        let minY = this._bounds.top;
        let maxX = this._bounds.right;
        let maxY = this._bounds.bottom;

        minX = minX < x ? minX : x;
        minY = minY < y ? minY : y;
        maxX = maxX > x ? maxX : x;
        maxY = maxY > y ? maxY : y;

        this._bounds.x = minX;
        this._bounds.y = minY;
        this._bounds.width = maxX - minX;
        this._bounds.height = maxY - minY;
    }

    /**
     * Resets the bounds so that they become "unknown".
     */
    resetBounds(): void
    {
        this._bounds = null;
    }
}
