import { CanvasTextureAllocator } from '@pixi-essentials/texture-allocator';
import { Cull } from '@pixi-essentials/cull';
import { InheritedPaintProvider } from './paint/InheritedPaintProvider';
import { MaskServer } from './mask/MaskServer';
import * as Loader from './loader';
import { NODE_TRANSFORM_DIRTY, TRANSFORM_DIRTY } from './const';
import { PaintProvider } from './paint/PaintProvider';
import { PaintServer } from './paint/PaintServer';
import { Bounds, Container, Matrix, Rectangle, Renderer, RenderTexture, Texture } from 'pixi.js';
import { SVGGraphicsNode } from './SVGGraphicsNode';
import { SVGImageNode } from './SVGImageNode';
import { SVGPathNode } from './SVGPathNode';
import { SVGTextNode } from './SVGTextNode';
import { SVGUseNode } from './SVGUseNode';

import type { LineCap, LineJoin } from 'pixi.js';
import type { Paint } from './paint/Paint';
import type { SVGSceneContext } from './SVGSceneContext';

const tempMatrix = new Matrix();
const tempRect = new Rectangle();
const tempBounds = new Bounds();

/**
 * {@link SVGScene} can be used to build an interactive viewer for scalable vector graphics images. You must specify the size
 * of the svg viewer.
 *
 * ## SVG Scene Graph
 *
 * SVGScene has an internal, disconnected scene graph that is optimized for lazy updates. It will listen to the following
 * events fired by a node:
 *
 * * `nodetransformdirty`: This will invalidate the transform calculations.
 *
 * @public
 */
export class SVGScene extends Container
{
    /**
     * The SVG image content being rendered by the scene.
     */
    public content: SVGSVGElement;

    /**
     * Display objects that don't render to the screen, but are required to update before the rendering
     * nodes, e.g. mask sprites.
     */
    public renderServers: Container;

    /**
     * The scene context
     */
    protected _context: SVGSceneContext;

    /**
     * The width of the rendered scene in local space.
     */
    protected _width: number;

    /**
     * The height of the rendered scene in local space.
     */
    protected _height: number;

    /**
     * This is used to cull the SVG scene graph before rendering.
     */
    protected _cull: Cull;

    /**
     * Maps content elements to their paint. These paints do not inherit from their parent element. You must
     * compose an {@link InheritedPaintProvider} manually.
     */
    private _elementToPaint: Map<SVGElement, Paint>;

    /**
     * Maps `SVGMaskElement` elements to their nodes. These are not added to the scene graph directly and are
     * only referenced as a `mask`.
     */
    private _elementToMask: Map<SVGElement, MaskServer>;

    private _elementToRenderNode: Map<SVGElement, Container>;

    /**
     * Flags whether any transform is dirty in the SVG scene graph.
     */
    protected _transformDirty: boolean;

    sortDirty = false;

    /**
     * @param content - The SVG node to render
     * @param context - This can be used to configure the scene
     */
    constructor(content: SVGSVGElement, context?: Partial<SVGSceneContext>)
    {
        super({
            isRenderGroup: true,
        });

        this.content = content;

        this.initContext(context);
        this._width = content.viewBox.baseVal.width;
        this._height = content.viewBox.baseVal.height;

        this._elementToPaint = new Map();
        this._elementToMask = new Map();
        this._elementToRenderNode = new Map();
        this._transformDirty = true;

        this.renderServers = new Container();

        this.boundsArea = new Rectangle(0, 0, this.content.viewBox.baseVal.width, this.content.viewBox.baseVal.height);

        if (!context || !context.disableRootPopulation)
        {
            this.populateScene();
        }
    }

    initContext(context?: Partial<SVGSceneContext>): void
    {
        context = context || {};
        context.atlas = context.atlas || new CanvasTextureAllocator(2048, 2048);
        context.disableHrefSVGLoading = typeof context.disableHrefSVGLoading === 'undefined'
            ? false : context.disableHrefSVGLoading;

        this._context = context as SVGSceneContext;
    }

    /**
     * Draw the paints required to render the elements in this SVG scene. If not called, gradients
     * and special effects may not render.
     *
     * @param renderer
     */
    drawPaints(renderer: Renderer): void {
        for (const node of this._elementToRenderNode.values()) {
            const paintServers = ((node as any)?.paintServers ?? []) as PaintServer[];

            for (const paintServer of paintServers) {
                paintServer.resolvePaint(renderer);
            }
        }
    }

    /**
     * Creates a display object that implements the corresponding `embed*` method for the given node.
     *
     * @param element - The element to be embedded in a display object.
     */
    protected createNode(element: SVGElement): Container
    {
        let renderNode: Container;

        switch (element.nodeName.toLowerCase())
        {
            case 'circle':
            case 'ellipse':
            case 'g':
            case 'line':
            case 'polyline':
            case 'polygon':
            case 'rect':
                renderNode = new SVGGraphicsNode(this._context);
                break;
            case 'image':
                renderNode = new SVGImageNode(this._context);
                break;
            case 'mask':
            case 'svg':
                renderNode = new Container();
                break;
            case 'path':
                renderNode = new SVGPathNode(this._context);
                break;
            case 'text':
                renderNode = new SVGTextNode();
                break;
            case 'use':
                renderNode = new SVGUseNode();
                break;
            default:
                renderNode = null;
                break;
        }

        this._elementToRenderNode.set(element, renderNode);

        return renderNode;
    }

    /**
     * Creates a `Paint` object for the given element. This should only be used when sharing the `Paint`
     * is not desired; otherwise, use {@link SVGScene.queryPaint}.
     *
     * This will return `null` if the passed element is not an instance of `SVGElement`.
     *
     * @alpha
     * @param element
     */
    protected createPaint(element: SVGElement): Paint
    {
        if (!(element instanceof SVGElement))
        {
            return null;
        }

        return new PaintProvider(element);
    }

    /**
     * Creates a lazy paint texture for the paint server.
     *
     * @alpha
     * @param paintServer - The paint server to be rendered.
     */
    protected createPaintServer(paintServer: SVGGradientElement): PaintServer
    {
        const renderTexture = RenderTexture.create({
            width: 128,
            height: 128,
        }) as RenderTexture;

        return new PaintServer(paintServer, renderTexture);
    }

    /**
     * Creates a lazy luminance mask for the `SVGMaskElement` or its rendering node.
     *
     * @param ref - The `SVGMaskElement` or its rendering node, if already generated.
     */
    protected createMask(ref: SVGMaskElement | Container): MaskServer
    {
        if (ref instanceof SVGElement)
        {
            ref = this.populateSceneRecursive(ref, {
                basePaint: this.queryInheritedPaint(ref),
            });
        }

        const localBounds = ref.getLocalBounds();

        ref.getBounds();

        const maskTexture = RenderTexture.create({
            width: localBounds.width,
            height: localBounds.height,
        }) as RenderTexture;

        const maskSprite = new MaskServer(maskTexture);

        // Lazily render mask when needed.
        maskSprite.addChild(ref);

        return maskSprite;
    }

    /**
     * Returns the rendering node for a mask.
     *
     * @alpha
     * @param ref - The mask element whose rendering node is needed.
     */
    protected queryMask(ref: SVGMaskElement): MaskServer
    {
        let queryHit = this._elementToMask.get(ref);

        if (!queryHit)
        {
            queryHit = this.createMask(ref);

            this._elementToMask.set(ref, queryHit);
        }

        return queryHit;
    }

    /**
     * Returns the cached paint of a content element. The returned paint will not account for any paint
     * attributes inherited from ancestor elements.
     *
     * @alpha
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
     * Returns an (uncached) inherited paint of a content element.
     *
     * @alpha
     * @param ref
     */
    protected queryInheritedPaint(ref: SVGElement): Paint
    {
        const paint = this.queryPaint(ref);
        const parentPaint = ref.parentElement && this.queryPaint(ref.parentElement as unknown as SVGElement);

        if (!parentPaint)
        {
            return paint;
        }

        return new InheritedPaintProvider(parentPaint, paint);
    }

    /**
     * Parses the internal URL reference into a selector (that can be used to find the
     * referenced element using `this.content.querySelector`).
     *
     * @param url - The reference string, e.g. "url(#id)", "url('#id')", "#id"
     */
    protected parseReference(url: string): string
    {
        if (url.startsWith('url'))
        {
            let contents = url.slice(4, -1);

            if (contents.startsWith('\'') && contents.endsWith('\''))
            {
                contents = contents.slice(1, -1);
            }

            return contents;
        }

        return url;
    }

    /**
     * Embeds a content `element` into the rendering `node`.
     *
     * This is **not** a stable API.
     *
     * @alpha
     * @param node - The node in this scene that will render the `element`.
     * @param element - The content `element` to be rendered. This must be an element of the SVG document
     *  fragment under `this.content`.
     * @param options - Additional options
     * @param {Paint} [options.basePaint] - The base paint that the element's paint should inherit from
     * @return The base attributes of the element, like paint.
     */
    protected embedIntoNode(
        node: Container,
        element: SVGGraphicsElement | SVGMaskElement,
        options: {
            basePaint?: Paint;
        } = {},
    ): {
        paint: Paint;
    }
    {
        const {
            basePaint,
        } = options;

        // Paint
        const paint = basePaint ? new InheritedPaintProvider(basePaint, this.queryPaint(element)) : this.queryPaint(element);
        const {
            fill,
            opacity,
            stroke,
            // strokeDashArray,
            // strokeDashOffset,
            strokeLineCap,
            strokeLineJoin,
            strokeMiterLimit,
            strokeWidth,
        } = paint;

        // Transform
        const transform = element instanceof SVGGraphicsElement ? element.transform.baseVal.consolidate() : null;
        const transformMatrix = transform ? transform.matrix : tempMatrix.identity();

        switch (element.nodeName.toLowerCase())
        {
            case 'circle':
                (node as SVGGraphicsNode).embedCircle(element as SVGCircleElement);
                break;
            case 'ellipse':
                (node as SVGGraphicsNode).embedEllipse(element as SVGEllipseElement);
                break;
            case 'image':
                (node as SVGImageNode).embedImage(element as SVGImageElement);
                break;
            case 'line':
                (node as SVGGraphicsNode).embedLine(element as SVGLineElement);
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
            case 'text':
                (node as SVGTextNode).embedText(element as SVGTextElement);
                break;
            case 'use': {
                const useElement = element as SVGUseElement;
                const useTargetURL = useElement.getAttribute('href') || useElement.getAttribute('xlink:href');
                const usePaint = this.queryPaint(useElement);

                (node as SVGUseNode).embedUse(useElement);

                if (useTargetURL.startsWith('#'))
                {
                    const useTarget = this.content.querySelector(useTargetURL);
                    const contentNode = this.populateSceneRecursive(useTarget as SVGGraphicsElement, {
                        basePaint: usePaint,
                    }) as SVGGraphicsNode;

                    (node as SVGUseNode).ref = contentNode;
                    contentNode.setFromMatrix(Matrix.IDENTITY);// clear transform
                }
                else if (!this._context.disableHrefSVGLoading)
                {
                    (node as SVGUseNode).isRefExternal = true;

                    Loader._load(useTargetURL)
                        .then((svgDocument) => [
                            new SVGScene(svgDocument, {
                                ...this._context,
                                disableRootPopulation: true,
                            }),
                            svgDocument.querySelector('#' + useTargetURL.split('#')[1])
                        ] as [SVGScene, SVGElement])
                        .then(([shellScene, useTarget]) =>
                        {
                            if (!useTarget)
                            {
                                console.error(`SVGScene failed to resolve ${useTargetURL} and SVGUseNode is empty!`);
                            }

                            const contentNode = shellScene.populateSceneRecursive(useTarget as SVGGraphicsElement, {
                                basePaint: usePaint,
                            }) as SVGGraphicsNode;

                            (node as SVGUseNode).ref = contentNode;
                            contentNode.setFromMatrix(Matrix.IDENTITY);// clear transform

                            this._transformDirty = true;

                            shellScene.on(TRANSFORM_DIRTY, () => {
                                this._transformDirty = true;
                            });
                        });
                }
            }
        }

        if (node instanceof SVGGraphicsNode && !(node instanceof SVGImageNode))
        {
            if (fill === 'none')
            {
                node.fill({
                    color: 0,
                    alpha: 0,
                });
            }
            else if (typeof fill === 'number')
            {
                node.fill({
                    color: fill,
                    alpha: opacity === null ? 1 : opacity,
                });
            }
            else if (!fill)
            {
                node.fill({
                    color: 0,
                });
            }
            else
            {
                const ref = this.parseReference(fill);
                const paintElement = this.content.querySelector(ref);

                if (paintElement && paintElement instanceof SVGGradientElement)
                {
                    const paintServer = this.createPaintServer(paintElement);
                    const paintTexture = paintServer.paintTexture;

                    node.paintServers.push(paintServer);
                    node.fill({
                        texture: paintTexture,
                        alpha: opacity === null ? 1 : opacity,
                        matrix: new Matrix(),
                    });
                }
            }

            let strokeTexture: Texture;

            if (typeof stroke === 'string' && stroke.startsWith('url'))
            {
                const ref = this.parseReference(stroke);
                const paintElement = this.content.querySelector(ref);

                if (paintElement && paintElement instanceof SVGGradientElement)
                {
                    const paintServer = this.createPaintServer(paintElement);
                    const paintTexture = paintServer.paintTexture;

                    node.paintServers.push(paintServer);
                    strokeTexture = paintTexture;
                }
            }

            node.stroke({
                /* eslint-disable no-nested-ternary */
                color: stroke === null ? 0 : (typeof stroke === 'number' ? stroke : 0xffffff),
                cap: strokeLineCap === null ? 'square' : strokeLineCap as unknown as LineCap,
                // TODO: Support dashed strokes.
                // dashArray: strokeDashArray,
                // dashOffset: strokeDashOffset === null ? strokeDashOffset : 0,
                join: strokeLineJoin === null ? 'miter' :  strokeLineJoin as unknown as LineJoin,
                matrix: new Matrix(),
                miterLimit: strokeMiterLimit === null ? 150 : strokeMiterLimit,
                texture: strokeTexture || Texture.WHITE,
                width: strokeWidth === null ? (typeof stroke === 'number' ? 1 : 0) : strokeWidth,
                /* eslint-enable no-nested-ternary */
            });
        }

        node.setFromMatrix(tempMatrix.set(
            transformMatrix.a,
            transformMatrix.b,
            transformMatrix.c,
            transformMatrix.d,
            transformMatrix instanceof Matrix ? transformMatrix.tx : transformMatrix.e,
            transformMatrix instanceof Matrix ? transformMatrix.ty : transformMatrix.f,
        ));

        if (element instanceof SVGMaskElement)
        {
            this._elementToMask.set(element, this.createMask(node));
        }

        const maskURL = element.getAttribute('mask');

        if (maskURL)
        {
            const maskElement: SVGMaskElement = this.content.querySelector(this.parseReference(maskURL));

            if (maskElement)
            {
                const maskServer = this.queryMask(maskElement);
                const maskSprite = maskServer.createMask(node);

                this.renderServers.addChild(maskServer);
                node.mask = maskSprite as Container;
                node.addChild(maskSprite);
            }
        }

        return {
            paint,
        };
    }

    /**
     * Recursively populates a subscene graph that embeds {@code element}. The root of the subscene is returned.
     *
     * @param element - The SVGElement to be embedded.
     * @param options - Inherited attributes from the element's parent, if any.
     * @return The display object that embeds the element for rendering.
     */
    protected populateSceneRecursive(
        element: SVGElement,
        options?: {
            basePaint?: Paint;
        },
    ): Container
    {
        const node = this.createNode(element);

        if (!node)
        {
            return null;
        }

        node.on(NODE_TRANSFORM_DIRTY, this.onNodeTransformDirty);

        let paint: Paint;

        if (element instanceof SVGGraphicsElement || element instanceof SVGMaskElement)
        {
            const opts = this.embedIntoNode(node, element, options);

            paint = opts.paint;
        }

        for (let i = 0, j = element.children.length; i < j; i++)
        {
            // eslint-disable-next-line
            // @ts-ignore
            const childNode = this.populateSceneRecursive(element.children[i], {
                basePaint: paint,
            });

            if (childNode)
            {
                node.addChild(childNode);
            }
        }

        if (node instanceof SVGGraphicsNode)
        {
            tempBounds.clear();

            const bbox = node.getLocalBounds(tempBounds);
            const paintServers = node.paintServers;
            const { x, y, width: bwidth, height: bheight } = bbox;

            node.paintServers.forEach((paintServer) =>
            {
                paintServer.resolvePaintDimensions(bbox.rectangle);
            });

            const geometry = node.geometry;
            const graphicsData = (geometry as any)?.graphicsData;

            console.log(node.context.instructions)

            if (graphicsData)
            {
                graphicsData.forEach((data) =>
                {
                    const fillStyle = data.fillStyle;
                    const lineStyle = data.lineStyle;

                    if (fillStyle.texture && paintServers.find((server) => server.paintTexture === fillStyle.texture))
                    {
                        const width = fillStyle.texture.width;
                        const height = fillStyle.texture.height;

                        data.fillStyle.matrix
                            .invert()
                            .scale(bwidth / width, bheight / height)
                            .invert();
                    }
                    if (fillStyle.matrix)
                    {
                        fillStyle.matrix
                            .invert()
                            .translate(x, y)
                            .invert();
                    }

                    if (lineStyle.texture && paintServers.find((server) => server.paintTexture === lineStyle.texture))
                    {
                        const width = lineStyle.texture.width;
                        const height = lineStyle.texture.height;

                        data.lineStyle.matrix
                            .invert()
                            .scale(bwidth / width, bheight / height)
                            .invert();
                    }
                    if (lineStyle.matrix)
                    {
                        lineStyle.matrix
                            .invert()
                            .translate(x, y)
                            .invert();
                    }
                });

                geometry.updateBatches();
            }
        }

        if (element instanceof SVGMaskElement)
        {
            // Mask elements are *not* a part of the scene graph.
            return null;
        }

        return node;
    }

    /**
     * Populates the entire SVG scene. This should only be called once after the {@link SVGScene.content} has been set.
     */
    protected populateScene(): void
    {
        this.addChild(this.populateSceneRecursive(this.content));
    }

    /**
     * Handles `nodetransformdirty` events fired by nodes. It will set {@link SVGScene._transformDirty} to true.
     *
     * This will also emit `transformdirty`.
     */
    private onNodeTransformDirty = (): void =>
    {
        this._transformDirty = true;
        this.emit(TRANSFORM_DIRTY, this);
    };

    /**
     * The width at which the SVG scene is being rendered. By default, this is the viewbox width specified by
     * the root element.
     */
    get width(): number
    {
        return this._width;
    }
    set width(value: number)
    {
        this._width = value;
        this.scale.x = this._width / this.content.viewBox.baseVal.width;
    }

    /**
     * The height at which the SVG scene is being rendered. By default, this is the viewbox height specified by
     * the root element.
     */
    get height(): number
    {
        return this._height;
    }
    set height(value: number)
    {
        this._height = value;
        this.scale.y = this._height / this.content.viewBox.baseVal.height;
    }

    /**
     * Load the SVG document and create a {@link SVGScene} asynchronously.
     *
     * A cache is used for loaded SVG documents.
     *
     * @param url
     * @param context
     * @returns
     */
    static async from(url: string, context?: SVGSceneContext): Promise<SVGScene> {
        return new SVGScene(await Loader._load(url), context);
    }
}
