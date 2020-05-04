import { InstancedRenderer, IInstancedRendererOptions } from './InstancedRenderer';
import { Renderer } from '@pixi/core';

/**
 * @class
 * @example
 * import { InstancedRendererPluginFactory } from '[at]pixi-essentials/instanced-renderer';
 * import { Renderer, Shader, Geometry, TYPES } from 'pixi.js';
 *
 * const spriteRenderer = InstancedRendererPluginFactory.from({
 *     instanceBuilder: {
 *         aVertexPosition: "_vertexData"
 *     },
 *     geometry: new Geometry().
 *         addAttribute("aVertexPosition", new Float32Array(
 *             0, 0,
 *             100, 0,
 *             100, 100,
 *             100, 100,
 *             0, 100,
 *             0, 0
 *         ), 2, false, TYPES.FLOAT, 0, 0, true),
 *     shader: new Shader(
 *       `
 * attribute vec2 aVertexPosition;
 * uniform mat3 projectionMatrix;
 *
 * void main(void)
 * {
 *     gl_Position = vec4((projectionMatrix * vec3(aVertexPosition.xy, 1)).xy, 0, 1);
 * }
 * `,
 * `
 * void main(void)
 * {
 *     gl_FragColor = vec4(.5, 1, .2, 1);// some random color
 * }
 * `,
 * {} // you can add uniforms
 *     )
 * });
 */
export class InstancedRendererPluginFactory
{
    /**
     * Returns a plugin wrapping an instanced renderer that can be registered.
     *
     * @param {IInstancedRendererOptions} options
     * @returns {PIXI.PluginConstructor}
     */
    public static from(options: IInstancedRendererOptions): typeof InstancedRenderer
    {
        return class extends InstancedRenderer
        {
            constructor(renderer: Renderer)
            {
                super(renderer, options);
            }
        };
    }
}
