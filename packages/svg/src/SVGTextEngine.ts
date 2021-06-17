import type { IPointData, Matrix } from '@pixi/math';
import type { TextStyle } from '@pixi/text';

/**
 * The `SVGTextEngine` interface is used to layout text content authored in SVG files. The @pixi-essentials/svg
 * package provides {@link SVGTextEngineImpl} as a default implementation for users.
 *
 * Text engines are allowed to have async behaviour so that fonts can be loaded before text metrics are measured.
 *
 * It is expected an implementation inherits from {@link PIXI.DisplayObject}.
 *
 * @public
 * @see SVGTextEngineImpl
 */
export interface SVGTextEngine
{
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
