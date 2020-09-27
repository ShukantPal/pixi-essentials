import { DisplayObject, Container } from '@pixi/display';
import { LINE_CAP, LINE_JOIN } from '@pixi/graphics';
import { Matrix } from '@pixi/math';
import { PaintProvider } from './styles/PaintProvider';
import { SVGGraphicsNode } from './SVGGraphicsNode';
import { SVGImageNode } from './SVGImageNode';
import { SVGPathNode } from './SVGPathNode';
import color from 'tinycolor2';

import type { Paint } from './styles/Paint';
import type { Renderer } from '@pixi/core';
import type { SVGRenderNode } from './SVGRenderNode';
import { InheritedPaint } from './styles/InheritedPaint';

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

    /**
     * The width of the rendered scene in local space.
     */
    protected _width: number;

    /**
     * The height of the rendered scene in local space.
     */
    protected _height: number;

    /**
     * Maps content element to their paint.
     */
    private _elementToPaint: Map<SVGElement, Paint>;

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

        this._elementToPaint = new Map();

        this.populateScene(this.root, content);
    }

    /**
     * Calculates the bounds of this scene, which is defined by the set `width` and `height`. The contents
     * of this scene are scaled to fit these bounds, and don't affect them whatsoever.
     *
     * @override
     */
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

    protected createNode(element: SVGElement): SVGRenderNode
    {
        let renderNode: SVGRenderNode = null;

        switch (element.nodeName.toLowerCase())
        {
            case 'circle':
            case 'polyline':
            case 'polygon':
            case 'rect':
                renderNode = new SVGGraphicsNode();
                break;
            case 'image':
                renderNode = new SVGImageNode();
                break;
            case 'path':
                renderNode = new SVGPathNode();
                break;
            default:
                renderNode = null;
                break;
        }

        return renderNode;
    }

    /**
     * Creates a `Paint` object for the given element. This should only be used when sharing the `Paint`
     * is not desired; otherwise, use {@link SVGScene.queryPaint}.
     *
     * @param element
     */
    protected createPaint(element: SVGElement): Paint
    {
        const paintProvider = new PaintProvider(element);

        // Handle <use /> element that inherited Paint.
        if (element.tagName === 'use')
        {
            const useTargetURL = element.getAttribute('href') || element.getAttribute('xlink:href');

            if (!useTargetURL) return paintProvider;

            const useTarget = this.content.querySelector(useTargetURL);

            if (!useTarget || !(useTarget instanceof SVGElement)) return paintProvider;

            const useTargetPaint = this.queryPaint(useTarget);

            return new InheritedPaint(useTargetPaint, paintProvider);
        }

        return paintProvider;
    }

    /**
     * Returns the cached paint of a content element.
     *
     * @param ref - A reference to the content element.
     */
    protected queryPaint(ref: SVGElement): Paint
    {
        let queryHit = this._elementToPaint.get(ref);

        if (!queryHit)
        {
            queryHit = this.createPaint(ref);
            this._elementToPaint.set(ref, queryHit);
        }

        return queryHit;
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
        // Paint
        const {
            fill,
            opacity,
            stroke,
            strokeDashArray,
            strokeDashOffset,
            strokeLineCap,
            strokeLineJoin,
            strokeMiterLimit,
            strokeWidth,
        } = this.queryPaint(element);

        // Transform
        const transform = element.transform.baseVal.consolidate();
        const transformMatrix = transform ? transform.matrix : tempMatrix.identity();

        if (fill === 'none')
        {
            node.beginFill(0, 0);
        }
        else if (fill !== null)
        {
            node.beginFill(fill, opacity);
        }
        else
        {
            node.beginFill(0);
        }

        node.lineTextureStyle({
            color: stroke,
            cap: strokeLineCap === null ? LINE_CAP.SQUARE : strokeLineCap as unknown as LINE_CAP,
            dashArray: strokeDashArray,
            dashOffset: strokeDashOffset === null ? strokeDashOffset : 0,
            join: strokeLineJoin === null ? LINE_JOIN.MITER : strokeLineJoin as unknown as LINE_JOIN,
            miterLimit: strokeMiterLimit === null ? 150 : strokeMiterLimit,
            width: strokeWidth,
        });

        switch (element.nodeName.toLowerCase())
        {
            case 'circle':
                (node as SVGGraphicsNode).embedCircle(element as SVGCircleElement);
                break;
            case 'image':
                (node as SVGImageNode).embedImage(element as SVGImageElement);
                break;
            case 'path':
                (node as SVGPathNode).embedPath(element as SVGPathElement);
                break;
            case 'polyline':
                (node as SVGGraphicsNode).embedPolyline(element as SVGPolylineElement);
                break;
            case 'polygon':
                (node as SVGGraphicsNode).embedPolygon(element as SVGPolygonElement);
                break;
            case 'rect':
                (node as SVGGraphicsNode).embedRect(element as SVGRectElement);
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
            this.drawIntoNode(node as SVGGraphicsNode, element);
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
