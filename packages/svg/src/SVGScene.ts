import { DisplayObject, Container } from '@pixi/display';
import { InheritedPaintProvider } from './paint/InheritedPaintProvider';
import { LINE_CAP, LINE_JOIN } from '@pixi/graphics';
import { Matrix } from '@pixi/math';
import { PaintProvider } from './paint/PaintProvider';
import { PaintServer } from './paint/PaintServer';
import { RenderTexture, Texture } from '@pixi/core';
import { SVGGraphicsNode } from './SVGGraphicsNode';
import { SVGImageNode } from './SVGImageNode';
import { SVGPathNode } from './SVGPathNode';
import { SVGUseNode } from './SVGUseNode';

import type { Paint } from './paint/Paint';
import type { Renderer } from '@pixi/core';

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

    protected createNode(element: SVGElement): Container
    {
        let renderNode = null;

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
            case 'use':
                renderNode = new SVGUseNode();
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

            return new InheritedPaintProvider(useTargetPaint, paintProvider);
        }

        return paintProvider;
    }

    /**
     * Creates a lazy paint texture for the paint server.
     *
     * @param paintServer - The paint server to be rendered.
     */
    protected createPaintServer(paintServer: SVGGradientElement): Texture
    {
        const renderTexture = RenderTexture.create({
            width: 128,
            height: 128,
        });

        return new PaintServer(paintServer, renderTexture);
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

    /**
     * Embeds a content `element` into the rendering `node`.
     *
     * @param node - The node in this scene that will render the `element`.
     * @param element - The content `element` to be rendered. This must be an element of the SVG document
     *  fragment under `this.content`.
     * @param paint - A paint object to use instead of the paint from the element's attributes.
     */
    protected drawIntoNode(node: Container, element: SVGGraphicsElement, paint?: Paint): void
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
        } = paint || this.queryPaint(element);

        // Transform
        const transform = element.transform.baseVal.consolidate();
        const transformMatrix = transform ? transform.matrix : tempMatrix.identity();

        if (node instanceof SVGGraphicsNode)
        {
            if (fill === 'none')
            {
                node.beginFill(0, 0);
            }
            else if (typeof fill === 'number')
            {
                node.beginFill(fill, opacity === null ? 1 : opacity);
            }
            else if (!fill)
            {
                node.beginFill(0);
            }
            else
            {
                const ref = fill
                    .replace('url(', '')
                    .slice(1, -2);// Remove single quotes + the ending ')' parenthesis
                const paintElement = this.content.querySelector(ref);

                if (paintElement && paintElement instanceof SVGGradientElement)
                {
                    const paintServer = this.createPaintServer(paintElement);
                    const paintTexture = paintServer.paintTexture;

                    node.paintServers.push(paintServer);
                    node.beginTextureFill({
                        texture: paintTexture,
                        alpha: opacity === null ? 1 : opacity,
                    });
                }
            }

            let strokeTexture: Texture;

            if (typeof stroke === 'string' && stroke.startsWith('url'))
            {
                const ref = stroke
                    .replace('url(', '')
                    .slice(1, -2);// Remove single quotes + the ending ')' parenthesis
                const paintElement = this.content.querySelector(ref);

                if (paintElement && paintElement instanceof SVGGradientElement)
                {
                    const paintServer = this.createPaintServer(paintElement);
                    const paintTexture = paintServer.paintTexture;

                    node.paintServers.push(paintServer);
                    strokeTexture = paintTexture;
                }
            }

            node.lineTextureStyle({
                /* eslint-disable no-nested-ternary */
                color: stroke === null ? 0 : (typeof stroke === 'number' ? stroke : 0xffffff),
                cap: strokeLineCap === null ? LINE_CAP.SQUARE : strokeLineCap as unknown as LINE_CAP,
                dashArray: strokeDashArray,
                dashOffset: strokeDashOffset === null ? strokeDashOffset : 0,
                join: strokeLineJoin === null ? LINE_JOIN.MITER : strokeLineJoin as unknown as LINE_JOIN,
                miterLimit: strokeMiterLimit === null ? 150 : strokeMiterLimit,
                texture: strokeTexture || Texture.WHITE,
                width: strokeWidth === null ? (stroke ? 1 : 0) : strokeWidth,
                /* eslint-enable no-nested-ternary */
            });
        }

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
            case 'use': {
                const useElement = element as SVGUseElement;
                const useTargetURL = useElement.getAttribute('href') || useElement.getAttribute('xlink:href');
                const useTarget = this.content.querySelector(useTargetURL);
                const usePaint = this.queryPaint(useElement);

                const refNode = this.createNode(useTarget as SVGGraphicsElement) as SVGGraphicsNode;

                (node as SVGUseNode).ref = refNode;
                this.drawIntoNode(refNode, useTarget as SVGGraphicsElement, usePaint);
                refNode.transform.setFromMatrix(Matrix.IDENTITY);// clear transform

                (node as SVGUseNode).embedUse(useElement);

                return;
            }
        }

        node.transform.setFromMatrix(tempMatrix.set(
            transformMatrix.a,
            transformMatrix.b,
            transformMatrix.c,
            transformMatrix.d,
            transformMatrix instanceof Matrix ? transformMatrix.tx : transformMatrix.e,
            transformMatrix instanceof Matrix ? transformMatrix.ty : transformMatrix.f,
        ));

        // TODO: paint server textures need to be resized
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
