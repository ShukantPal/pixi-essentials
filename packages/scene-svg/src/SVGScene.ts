import { DisplayObject, Container } from '@pixi/display';
import { Matrix } from '@pixi/math';
import { SVGGraphicsNode } from './SVGGraphicsNode';
import { SVGImageNode } from './SVGImageNode';
import { SVGPathNode } from './SVGPathNode';
import color from 'tinycolor2';

import type { Renderer } from '@pixi/core';
import { LINE_CAP, LINE_JOIN } from '@pixi/graphics';

type SVGDisplayNode =
    SVGGraphicsNode |
    SVGPathNode |
    SVGImageNode;

const tempMatrix = new Matrix();

/**
 * {@link SVGScene} can be used to build an interactive viewer for scalable vector graphics images. You must specify the size
 * of the svg viewer.
 */
export class SVGScene extends DisplayObject
{
    /**
     * The SVG image content being rendered by the scene.
     */
    public content: SVGSVGElement;

    /**
     * The root display object of the scene.
     */
    public root: Container;

    protected _width: number;

    protected _height: number;

    /**
     * @param content - the SVG node to render
     */
    constructor(content: SVGSVGElement)
    {
        super();

        this.content = content;
        this.root = new Container();
        this._width = 0;
        this._height = 0;

        this.populateScene(this.root, content);
    }

    calculateBounds(): void
    {
        this._bounds.addFrameMatrix(this.worldTransform, 0, 0, this.width, this.height);
    }

    render(renderer: Renderer): void
    {
        this.root.render(renderer);
    }

    updateTransform(): void
    {
        super.updateTransform();

        this.root.enableTempParent();
        this.root.transform.setFromMatrix(this.worldTransform);
        this.root.updateTransform();
        this.root.disableTempParent(null);
    }

    protected createNode(element: SVGElement): SVGGraphicsNode
    {
        switch (element.nodeName.toLowerCase())
        {
            case 'circle':
            case 'polyline':
            case 'polygon':
            case 'rect':
                return new SVGGraphicsNode();
            case 'image':
                return new SVGImageNode();
            case 'path':
                return new SVGPathNode();
            default:
                return null;
        }
    }

    protected _hexToUint(hex: string): number
    {
        if (!hex)
        {
            return 0;
        }

        if (hex[0] === '#')
        {
            // Remove the hash
            hex = hex.substr(1);

            // Convert shortcolors fc9 to ffcc99
            if (hex.length === 3)
            {
                hex = hex.replace(/([a-f0-9])/ig, '$1$1');
            }

            return parseInt(hex, 16);
        }

        const { r, g, b } = color(hex).toRgb();

        return (r << 16) + (g << 8) + b;
    }

    protected drawIntoNode(node: SVGGraphicsNode, element: SVGGraphicsElement): void
    {
        const fill = element.getAttribute('fill');
        const opacity = element.getAttribute('opacity');
        const stroke = element.getAttribute('stroke');
        const strokeWidth = element.getAttribute('stroke-width') || (stroke ? '1' : '0');
        const strokeLineCap = element.getAttribute('stroke-linecap');
        const strokeLineJoin = element.getAttribute('stroke-linejoin');
        const strokeMiterLimit = element.getAttribute('stroke-miterlimit');
        const transform = element.transform.baseVal.consolidate();
        const transformMatrix = transform ? transform.matrix : tempMatrix.identity();

        if (fill === 'none')
        {
            node.beginFill(0, 0);
        }
        else if (fill !== null)
        {
            node.beginFill(this._hexToUint(fill), opacity !== null ? parseFloat(opacity) : 1);
        }
        else
        {
            node.beginFill(0);
        }

        node.lineTextureStyle({
            width: parseFloat(strokeWidth),
            color: stroke === null ? 0 : this._hexToUint(stroke),
            cap: strokeLineCap === null ? LINE_CAP.SQUARE : strokeLineCap as unknown as LINE_CAP,
            join: strokeLineJoin === null ? LINE_JOIN.MITER : strokeLineJoin as unknown as LINE_JOIN,
            miterLimit: strokeMiterLimit === null ? 150 : parseFloat(strokeMiterLimit),
        });

        switch (element.nodeName.toLowerCase())
        {
            case 'circle':
                (node as SVGGraphicsNode).drawSVGCircleElement(element as SVGCircleElement);
                break;
            case 'image':
                (node as SVGImageNode).drawSVGImageElement(element as SVGImageElement);
                break;
            case 'path':
                (node as SVGPathNode).drawSVGPathElement(element as SVGPathElement);
                break;
            case 'polyline':
                (node as SVGGraphicsNode).drawSVGPolylineElement(element as SVGPolylineElement);
                break;
            case 'polygon':
                (node as SVGGraphicsNode).drawSVGPolygonElement(element as SVGPolygonElement);
                break;
            case 'rect':
                (node as SVGGraphicsNode).drawSVGRectElement(element as SVGRectElement);
                break;
        }

        node.transform.setFromMatrix(tempMatrix.set(
            transformMatrix.a,
            transformMatrix.b,
            transformMatrix.c,
            transformMatrix.d,
            transformMatrix instanceof Matrix ? transformMatrix.tx : transformMatrix.e,
            transformMatrix instanceof Matrix ? transformMatrix.ty : transformMatrix.f,
        ));
    }

    protected populateScene(root: Container, element: SVGElement): void
    {
        if (element.nodeName.toLowerCase() === 'svg')
        {
            for (let i = 0, j = element.children.length; i < j; i++)
            {
                // eslint-disable-next-line
                // @ts-ignore
                this.populateScene(root, element.children[i]);
            }

            return;
        }

        const node = this.createNode(element);

        if (!node)
        {
            return;
        }

        if (element instanceof SVGGraphicsElement)
        {
            this.drawIntoNode(node, element);
        }

        for (let i = 0, j = element.children.length; i < j; i++)
        {
            // eslint-disable-next-line
            // @ts-ignore
            this.populateScene(node, element.children[i]);
        }

        // eslint-disable-next-line
        // @ts-ignore
        root.addChild(node);
    }

    get width(): number
    {
        return this._width;
    }

    set width(value: number)
    {
        this._width = value;
        this.scale.x = this._width / this.content.viewBox.baseVal.width;
    }

    get height(): number
    {
        return this._height;
    }

    set height(value: number)
    {
        this._height = value;
        this.scale.y = this._height / this.content.viewBox.baseVal.height;
    }
}
