/// <reference path="./types.d.ts" />

import { Graphics } from '@pixi/graphics';
import { Point } from '@pixi/math';

import { InteractionEvent } from '@pixi/interaction';

/**
 * @ignore
 */
export interface ITransformerHandleStyle
{
    color: number;
    outlineColor: number;
    outlineThickness: number;
    radius: number;
    shape: string;
}

/**
 * The default transformer handle style.
 *
 * @ignore
 */
const DEFAULT_HANDLE_STYLE = {
    color: 0xffffff,
    outlineColor: 0x000000,
    outlineThickness: 1,
    radius: 8,
    shape: 'square',
};

const tempPoint = new Point();
const tempDelta = new Point();

/**
 * The transfomer handle base implementation.
 */
export class TransformerHandle extends Graphics
{
    onHandleDelta: (origin: Point, delta: Point) => void;

    protected _style: ITransformerHandleStyle;

    private _pointerDown: boolean;
    private _pointerDragging: boolean;
    private _pointerPosition: Point;

    constructor(styleOpts: Partial<ITransformerHandleStyle> = {},
        handler?: (origin: Point, delta: Point) => void, cursor?: string)
    {
        super();

        const style: ITransformerHandleStyle = Object.assign({}, DEFAULT_HANDLE_STYLE, styleOpts);

        this._style = style;
        this.cursor = cursor || 'move';
        this.onHandleDelta = handler;

        this.lineStyle(style.outlineThickness, style.outlineColor)
            .beginFill(style.color);

        if (style.shape === 'square')
        {
            this.drawRect(-style.radius / 2, -style.radius / 2, style.radius, style.radius);
        }
        else
        {
            this.drawCircle(0, 0, style.radius);
        }

        this.endFill();

        this._pointerDown = false;
        this._pointerDragging = false;
        this._pointerPosition = new Point();

        this.interactive = true;

        this.on('mousedown', this.onPointerDown, this);
        this.on('mousemove', this.onPointerMove, this);
        this.on('mouseup', this.onPointerUp, this);
        this.on('mouseupoutside', this.onPointerUp, this);
    }

    get style(): Partial<ITransformerHandleStyle>
    {
        return this._style;
    }
    set style(value: Partial<ITransformerHandleStyle>)
    {
        this._style = Object.assign({}, DEFAULT_HANDLE_STYLE, value);
    }

    protected onPointerDown(): void
    {
        this._pointerDown = true;
        this._pointerDragging = false;
    }

    protected onPointerMove(e: InteractionEvent): void
    {
        if (!this._pointerDown)
        {
            return;
        }

        if (this._pointerDragging)
        {
            this.onDrag(e);
        }
        else
        {
            this.onDragStart(e);
        }
    }

    protected onPointerUp(e: InteractionEvent): void
    {
        if (this._pointerDragging)
        {
            this.onDragEnd(e);
        }

        this._pointerDown = false;
    }

    protected onDragStart(e: InteractionEvent): void
    {
        e.data.getLocalPosition(this.parent, this._pointerPosition);

        this._pointerDragging = true;
    }

    protected onDrag(e: InteractionEvent): void
    {
        const lastPosition = this._pointerPosition;
        const currentPosition = e.data.getLocalPosition(this.parent, tempPoint);

        // Callback handles the rest!
        if (this.onHandleDelta)
        {
            tempDelta.x = currentPosition.x - lastPosition.x;
            tempDelta.y = currentPosition.y - lastPosition.y;

            this.onHandleDelta(lastPosition, tempDelta);
        }

        this._pointerPosition.copyFrom(tempPoint);
    }

    protected onDragEnd(_: InteractionEvent): void
    {
        this._pointerDragging = false;
    }
}
