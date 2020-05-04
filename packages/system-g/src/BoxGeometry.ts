import { Rectangle } from '@pixi/math';
import { BoundedBufferGeometry } from './BoundedBufferGeometry';

/**
 * {@code BoxGeometry} represents a quad with a fixed width and height.
 *
 * @class
 * @extends BoundedBufferGeometry
 */
export class BoxGeometry extends BoundedBufferGeometry
{
    protected _width: number;
    protected _height: number;

    constructor(width = 1, height: 1)
    {
        super();

        this._width = width;
        this._height = height;

        this._bounds = new Rectangle(0, 0, width, height);
    }
}
