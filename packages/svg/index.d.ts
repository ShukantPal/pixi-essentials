import type { CanvasTextureAllocator } from '@pixi-essentials/texture-allocator';
import { Container } from '@pixi/display';
import { Cull } from '@pixi-essentials/cull';
import { DisplayObject } from '@pixi/display';
import { Graphics } from '@pixi/graphics';
import type { GraphicsData } from '@pixi/graphics';
import { GraphicsGeometry } from '@pixi/graphics';
import type { IPointData } from '@pixi/math';
import { LINE_CAP } from '@pixi/graphics';
import { LINE_JOIN } from '@pixi/graphics';
import { Matrix } from '@pixi/math';
import type { Rectangle } from '@pixi/math';
import type { Renderer } from '@pixi/core';
import type { RenderTexture } from '@pixi/core';
import { Sprite } from '@pixi/sprite';
import { TextStyle } from '@pixi/text';
import { Texture } from '@pixi/core';

declare interface ILineStyleOptions {
    color?: number;
    alpha?: number;
    texture?: Texture;
    matrix?: Matrix;
    width?: number;
    alignment?: number;
    native?: boolean;
    cap?: LINE_CAP;
    join?: LINE_JOIN;
    miterLimit?: number;
    dashArray?: number[];
    dashOffset?: number;
}

/**
 * Inherited paint, used for &lt;use /&gt; elements. The properties used on the inherited paint do not
 * override those on the parent.
 */
export declare class InheritedPaintProvider implements Paint {
    parent: Paint;
    provider: Paint;
    /**
     * Composes a `Paint` that will inherit properties from the `parent` if the `provider` does not
     * define them.
     *
     * @param parent
     * @param provider
     */
    constructor(parent: Paint, provider: Paint);
    get dirtyId(): number;
    get fill(): number | string;
    get opacity(): number;
    get stroke(): number | string;
    get strokeDashArray(): number[];
    get strokeDashOffset(): number;
    get strokeLineCap(): LINE_CAP;
    get strokeLineJoin(): LINE_JOIN;
    get strokeMiterLimit(): number;
    get strokeWidth(): number;
}

/**
 * A `MaskServer` will lazily render its content's luminance into its render-texture's alpha
 * channel using the luminance-alpha filter. The `dirtyId` flag can be used to make it re-render its
 * contents. It is intended to be used as a sprite-mask, where black pixels are invisible and white
 * pixels are visible (i.e. black pixels are filtered to alpha = 0, while white pixels are filtered
 * to alpha = 1. The rest are filtered to an alpha such that 0 < alpha < 1.). This is in compliance
 * with [CSS Masking Module Level 1](https://www.w3.org/TR/css-masking-1/#MaskElement).
 *
 * @ignore
 */
declare class MaskServer extends Sprite {
    /**
     * Flags when re-renders are required due to content updates.
     */
    dirtyId: number;
    /**
     * Flags when the content is re-rendered and should be equal to `this.dirtyId` when the texture
     * is update-to-date.
     */
    updateId: number;
    /**
     * @param texture - The render-texture that will cache the contents.
     */
    constructor(texture: RenderTexture);
    /**
     * @override
     */
    render(renderer: Renderer): void;
    /**
     * Create a mask that will overlay on top of the given display-object using the texture of this
     * mask server.
     *
     * @param displayObject - The mask target.
     */
    createMask(_: Container): MaskSprite;
}

/**
 * A sprite that does not render anything. It can be used as a mask whose bounds can be updated by adding it
 * as a child of the mask-target.
 *
 * @see MaskServer.createMask
 * @ignore
 */
declare class MaskSprite extends Sprite {
    render(_: Renderer): void;
}

/**
 * Internal, parsed form of painting attributes. If a paint attribute was not defined, it **must** be
 * `null` (not `undefined`).
 *
 * @see https://www.w3.org/TR/SVG2/painting.html#Introduction
 */
export declare interface Paint {
    /**
     * The interior paint for the shape.
     */
    readonly fill: number | string;
    /**
     * The opacity of the fill.
     */
    readonly opacity: number;
    /**
     * The color of the stroke outline applied on the shape.
     */
    readonly stroke: number | string;
    /**
     * The dash pattern for stroking the shape.
     */
    readonly strokeDashArray: number[];
    /**
     * The distance into the dash pattern at which the stroking is started.
     */
    readonly strokeDashOffset: number;
    /**
     * The line caps applied at the end of the stroke. This is not applied for closed shapes.
     */
    readonly strokeLineCap: LINE_CAP;
    /**
     * The line join applied at the joint to line segments.
     */
    readonly strokeLineJoin: LINE_JOIN;
    /**
     * The maximum miter distance.
     */
    readonly strokeMiterLimit: number;
    /**
     * The width of the stroke outline applied on the shape.
     */
    readonly strokeWidth: number;
    /**
     * Flags when the paint is updated.
     */
    readonly dirtyId: number;
}

/**
 * Provides the `Paint` for an `SVGElement`. It will also respond to changes in the attributes of the element
 * (not implemented).
 */
export declare class PaintProvider implements Paint {
    element: SVGElement;
    fill: number | string;
    opacity: number;
    stroke: number | string;
    strokeDashArray: number[];
    strokeDashOffset: number;
    strokeLineCap: LINE_CAP;
    strokeLineJoin: LINE_JOIN;
    strokeMiterLimit: number;
    strokeWidth: number;
    dirtyId: number;
    /**
     * @param element - The element whose paint is to be provided.
     */
    constructor(element: SVGElement);
    /**
     * Parses the color attribute into an RGBA hexadecimal equivalent, if encoded. If the `colorString` is `none` or
     * is a `url(#id)` reference, it is returned as is.
     *
     * @param colorString
     * @see https://github.com/bigtimebuddy/pixi-svg/blob/89e4ab834fa4ef05b64741596516c732eae34daa/src/SVG.js#L106
     */
    static parseColor(colorString: string): number | string;
}

/**
 * [Paint Servers]{@link https://svgwg.org/svg-next/pservers.html} are implemented as textures. This class is a lazy
 * wrapper around paint textures, which can only be generated using the `renderer` drawing to the screen.
 */
export declare class PaintServer {
    paintServer: SVGGradientElement | SVGPatternElement;
    paintTexture: RenderTexture;
    paintContexts: {
        [id: number]: number;
    };
    dirtyId: number;
    /**
     * Creates a `PaintServer` wrapper.
     *
     * @param paintServer
     * @param paintTexture
     */
    constructor(paintServer: SVGGradientElement | SVGPatternElement, paintTexture: RenderTexture);
    /**
     * Ensures the paint texture is updated for the renderer's WebGL context. This should be called before using the
     * paint texture to render anything.
     *
     * @param renderer - The renderer that will use the paint texture.
     */
    resolvePaint(renderer: Renderer): void;
    /**
     * Calculates the optimal texture dimensions for the paint texture, given the bounding box of the
     * object applying it. The paint texture is resized accordingly.
     *
     * If the paint texture is sized smaller than the bounding box, then it is expected that it will
     * be scaled up to fit it.
     *
     * @param bbox - The bounding box of the object applying the paint texture.
     */
    resolvePaintDimensions(bbox: Rectangle): void;
    /**
     * Renders the paint texture using the renderer immediately.
     *
     * @param renderer - The renderer to use for rendering to the paint texture.
     */
    updatePaint(renderer: Renderer): void;
    /**
     * Renders `this.paintServer` as a `SVGLinearGradientElement`.
     *
     * @param renderer - The renderer being used to render the paint texture.
     */
    private linearGradient;
    /**
     * Renders `this.paintServer` as a `SVGRadialGradientElement`.
     *
     * @param renderer - The renderer being used to render the paint texture.
     */
    private radialGradient;
    /**
     * Extracts the color-stops from the children of a `SVGGradientElement`.
     *
     * @param stopElements - The children of a `SVGGradientElement`. You can get it via `element.children`.
     * @return The color stops that can be fed into {@link GradientFactory}.
     */
    private createColorStops;
}

export declare class SVGGraphicsGeometry extends GraphicsGeometry {
    processLine(data: GraphicsData): void;
    processPathLine(data: GraphicsData): void;
    protected calculateBounds(): void;
}

/**
 * This node can be used to directly embed the following elements:
 *
 * | Interface           | Element            |
 * | ------------------- | ------------------ |
 * | SVGGElement         | &lt;g /&gt;        |
 * | SVGCircleElement    | &lt;circle /&gt;   |
 * | SVGLineElement      | &lt;line /&gt;     |
 * | SVGPolylineElement  | &lt;polyline /&gt; |
 * | SVGPolygonElement   | &lt;polygon /&gt;  |
 * | SVGRectElement      | &lt;rect /&gt;     |
 *
 * It also provides an implementation for dashed stroking, by adding the `dashArray` and `dashOffset` properties
 * to `LineStyle`.
 */
export declare class SVGGraphicsNode extends Graphics {
    paintServers: PaintServer[];
    protected context: SVGSceneContext;
    constructor(context: SVGSceneContext);
    lineTextureStyle(options: ILineStyleOptions): this;
    /**
     * Draws an elliptical arc.
     *
     * @param cx - The x-coordinate of the center of the ellipse.
     * @param cy - The y-coordinate of the center of the ellipse.
     * @param rx - The radius along the x-axis.
     * @param ry - The radius along the y-axis.
     * @param startAngle - The starting eccentric angle, in radians (0 is at the 3 o'clock position of the arc's circle).
     * @param endAngle - The ending eccentric angle, in radians.
     * @param xAxisRotation - The angle of the whole ellipse w.r.t. x-axis.
     * @param anticlockwise - Specifies whether the drawing should be counterclockwise or clockwise.
     * @return This Graphics object. Good for chaining method calls.
     */
    ellipticArc(cx: number, cy: number, rx: number, ry: number, startAngle: number, endAngle: number, xAxisRotation?: number, anticlockwise?: boolean): this;
    /**
     * Draws an elliptical arc to the specified point.
     *
     * If rx = 0 or ry = 0, then a line is drawn. If the radii provided are too small to draw the arc, then
     * they are scaled up appropriately.
     *
     * @param endX - the x-coordinate of the ending point.
     * @param endY - the y-coordinate of the ending point.
     * @param rx - The radius along the x-axis.
     * @param ry - The radius along the y-axis.
     * @param xAxisRotation - The angle of the ellipse as a whole w.r.t/ x-axis.
     * @param anticlockwise - Specifies whether the arc should be drawn counterclockwise or clockwise.
     * @param largeArc - Specifies whether the larger arc of two possible should be choosen.
     * @return This Graphics object. Good for chaining method calls.
     * @see https://svgwg.org/svg2-draft/paths.html#PathDataEllipticalArcCommands
     * @see https://www.w3.org/TR/SVG2/implnote.html#ArcImplementationNotes
     */
    ellipticArcTo(endX: number, endY: number, rx: number, ry: number, xAxisRotation?: number, anticlockwise?: boolean, largeArc?: boolean): this;
    /**
     * Embeds the `SVGCircleElement` into this node.
     *
     * @param element - The circle element to draw.
     */
    embedCircle(element: SVGCircleElement): void;
    /**
     * Embeds the `SVGEllipseElement` into this node.
     *
     * @param element - The ellipse element to draw.
     */
    embedEllipse(element: SVGEllipseElement): void;
    /**
     * Embeds the `SVGLineElement` into this node.
     *
     * @param element - The line element to draw.
     */
    embedLine(element: SVGLineElement): void;
    /**
     * Embeds the `SVGRectElement` into this node.
     *
     * @param element - The rectangle element to draw.
     */
    embedRect(element: SVGRectElement): void;
    /**
     * Embeds the `SVGPolygonElement` element into this node.
     *
     * @param element - The polygon element to draw.
     */
    embedPolygon(element: SVGPolygonElement): void;
    /**
     * Embeds the `SVGPolylineElement` element into this node.
     *
     * @param element - The polyline element to draw.
     */
    embedPolyline(element: SVGPolylineElement): void;
    /**
     * @override
     */
    render(renderer: Renderer): void;
}

/**
 * Draws SVG &lt;image /&gt; elements.
 */
export declare class SVGImageNode extends SVGGraphicsNode {
    /**
     * The canvas used into which the `SVGImageElement` is drawn. This is because WebGL does not support
     * using `SVGImageElement` as an `ImageSource` for textures.
     */
    protected _canvas: HTMLCanvasElement;
    /**
     * The Canvas 2D context for `this._canvas`.
     */
    protected _context: CanvasRenderingContext2D;
    /**
     * A texture backed by `this._canvas`.
     */
    protected _texture: Texture;
    /**
     * Embeds the given SVG image element into this node.
     *
     * @param element - The SVG image element to embed.
     */
    embedImage(element: SVGImageElement): void;
    /**
     * Initializes {@code this._texture} by allocating it from the atlas. It is expected the texture size requested
     * is less than the atlas's slab dimensions.
     *
     * @param width
     * @param height
     */
    private initTexture;
    /**
     * Draws the image into this node's texture.
     *
     * @param image - The image element holding the image.
     */
    private drawTexture;
}

/**
 * Draws SVG &lt;path /&gt; elements.
 */
export declare class SVGPathNode extends SVGGraphicsNode {
    private currentPath2;
    private startPath;
    private finishPath;
    get currentPath(): any;
    set currentPath(nothing: any);
    closePath(): any;
    checkPath(): void;
    startPoly: () => void;
    finishPoly: () => void;
    /**
     * Embeds the `SVGPathElement` into this node.
     *
     * @param element - the path to draw
     */
    embedPath(element: SVGPathElement): this;
}

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
 */
export declare class SVGScene extends DisplayObject {
    /**
     * The SVG image content being rendered by the scene.
     */
    content: SVGSVGElement;
    /**
     * The root display object of the scene.
     */
    root: Container;
    /**
     * Display objects that don't render to the screen, but are required to update before the rendering
     * nodes, e.g. mask sprites.
     */
    renderServers: Container;
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
    private _elementToPaint;
    /**
     * Maps `SVGMaskElement` elements to their nodes. These are not added to the scene graph directly and are
     * only referenced as a `mask`.
     */
    private _elementToMask;
    /**
     * Flags whether any transform is dirty in the SVG scene graph.
     */
    protected _transformDirty: boolean;
    sortDirty: boolean;
    /**
     * @param content - The SVG node to render
     * @param context - This can be used to configure the scene
     */
    constructor(content: SVGSVGElement, context?: Partial<SVGSceneContext>);
    initContext(context?: Partial<SVGSceneContext>): void;
    /**
     * Calculates the bounds of this scene, which is defined by the set `width` and `height`. The contents
     * of this scene are scaled to fit these bounds, and don't affect them whatsoever.
     *
     * @override
     */
    calculateBounds(): void;
    removeChild(): void;
    /**
     * @override
     */
    render(renderer: Renderer): void;
    /**
     * @override
     */
    updateTransform(): void;
    /**
     * Creates a display object that implements the corresponding `embed*` method for the given node.
     *
     * @param element - The element to be embedded in a display object.
     */
    protected createNode(element: SVGElement): Container;
    /**
     * Creates a `Paint` object for the given element. This should only be used when sharing the `Paint`
     * is not desired; otherwise, use {@link SVGScene.queryPaint}.
     *
     * This will return `null` if the passed element is not an instance of `SVGElement`.
     *
     * @alpha
     * @param element
     */
    protected createPaint(element: SVGElement): Paint;
    /**
     * Creates a lazy paint texture for the paint server.
     *
     * @alpha
     * @param paintServer - The paint server to be rendered.
     */
    protected createPaintServer(paintServer: SVGGradientElement): PaintServer;
    /**
     * Creates a lazy luminance mask for the `SVGMaskElement` or its rendering node.
     *
     * @param ref - The `SVGMaskElement` or its rendering node, if already generated.
     */
    protected createMask(ref: SVGMaskElement | Container): MaskServer;
    /**
     * Returns the rendering node for a mask.
     *
     * @alpha
     * @param ref - The mask element whose rendering node is needed.
     */
    protected queryMask(ref: SVGMaskElement): MaskServer;
    /**
     * Returns the cached paint of a content element. The returned paint will not account for any paint
     * attributes inherited from ancestor elements.
     *
     * @alpha
     * @param ref - A reference to the content element.
     */
    protected queryPaint(ref: SVGElement): Paint;
    /**
     * Returns an (uncached) inherited paint of a content element.
     *
     * @alpha
     * @param ref
     */
    protected queryInheritedPaint(ref: SVGElement): Paint;
    /**
     * Parses the internal URL reference into a selector (that can be used to find the
     * referenced element using `this.content.querySelector`).
     *
     * @param url - The reference string, e.g. "url(#id)", "url('#id')", "#id"
     */
    protected parseReference(url: string): string;
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
    protected embedIntoNode(node: Container, element: SVGGraphicsElement | SVGMaskElement, options?: {
        basePaint?: Paint;
    }): {
        paint: Paint;
    };
    /**
     * Recursively populates a subscene graph that embeds {@code element}. The root of the subscene is returned.
     *
     * @param element - The SVGElement to be embedded.
     * @param options - Inherited attributes from the element's parent, if any.
     * @return The display object that embeds the element for rendering.
     */
    protected populateSceneRecursive(element: SVGElement, options?: {
        basePaint?: Paint;
    }): Container;
    /**
     * Populates the entire SVG scene. This should only be called once after the {@link this.content} has been set.
     */
    protected populateScene(): void;
    /**
     * Handles `nodetransformdirty` events fired by nodes. It will set {@link this._transformDirty} to true.
     *
     * This will also emit `transformdirty`.
     */
    private onNodeTransformDirty;
    /**
     * The width at which the SVG scene is being rendered. By default, this is the viewbox width specified by
     * the root element.
     */
    get width(): number;
    set width(value: number);
    /**
     * The height at which the SVG scene is being rendered. By default, this is the viewbox height specified by
     * the root element.
     */
    get height(): number;
    set height(value: number);
}

/**
 * Options to manage the SVG scene
 */
declare interface SVGSceneContext {
    atlas: CanvasTextureAllocator;
}

/**
 * The `SVGTextEngine` interface is used to layout text content authored in SVG files. The @pixi-essentials/svg
 * package provides {@link SVGTextEngineImpl} as a default implementation for users.
 *
 * Text engines are allowed to have async behaviour so that fonts can be loaded before text metrics are measured.
 *
 * It is expected an implementation inherits from {@link PIXI.DisplayObject}.
 *
 * @see SVGTextEngineImpl
 */
export declare interface SVGTextEngine {
    /**
     * Clears the text content laid out already. This should reset the state of the engine to before any calls
     * to {@link SVGTextEngine.put} were made.
     */
    clear(): Promise<void>;
    /**
     * Puts the text {@code content} into the local space of the engine at {@code position}. {@code matrix} can
     * be used to transform the glyphs, although it is as optional feature for implementations.
     *
     * @param id - A locally unique ID that can be used to modify the added block of text later.
     * @param position - The position of the text in the engine's local space.
     * @param content - The text to add.
     * @param style - The text styling applied.
     * @param matrix
     */
    put(id: any, position: IPointData, content: string, style: Partial<TextStyle>, matrix?: Matrix): Promise<IPointData>;
}

/**
 * `SVGTextEngineImpl` is the default implementation for {@link SVGTextEngine}. It is inspired by {@link PIXI.Text} that
 * is provided by @pixi/text. It uses a &lt;canvas /&gt; to draw and cache the text. This may cause blurring issues when
 * the SVG is viewed at highly zoomed-in scales because it is rasterized.
 */
export declare class SVGTextEngineImpl extends Sprite implements SVGTextEngine {
    protected canvas: HTMLCanvasElement;
    protected context: CanvasRenderingContext2D;
    protected contentList: Map<any, {
        position: IPointData;
        content: string;
        style: Partial<TextStyle>;
        matrix?: Matrix;
    }>;
    protected dirtyId: number;
    protected updateId: number;
    constructor();
    clear(): Promise<void>;
    put(id: any, position: IPointData, content: string, style: Partial<TextStyle>, matrix?: Matrix): Promise<IPointData>;
    updateText(): void;
    render(renderer: Renderer): void;
}

/**
 * Draws SVG &lt;text /&gt; elements.
 */
export declare class SVGTextNode extends Container {
    /**
     * The SVG text rendering engine to be used by default in `SVGTextNode`. This API is not stable and
     * can change anytime.
     *
     * @alpha
     */
    static defaultEngine: {
        new (): SVGTextEngine & DisplayObject;
    };
    /**
     * An instance of a SVG text engine used to layout and render text.
     */
    protected engine: SVGTextEngine & DisplayObject;
    /**
     * The current text position, where the next glyph will be placed.
     */
    protected currentTextPosition: IPointData;
    constructor();
    /**
     * Embeds a `SVGTextElement` in this node.
     *
     * @param {SVGTextElement} element - The `SVGTextElement` to embed.
     */
    embedText(element: SVGTextElement | SVGTSpanElement, style?: Partial<TextStyle>): Promise<void>;
}

/**
 * Container for rendering SVG &lt;use /&gt; elements.
 */
export declare class SVGUseNode extends Container {
    private _ref;
    embedUse(element: SVGUseElement): void;
    /**
     * The node that renders the element referenced by a &lt;element /&gt; element.
     */
    get ref(): SVGGraphicsNode;
    set ref(value: SVGGraphicsNode);
}

export { }
