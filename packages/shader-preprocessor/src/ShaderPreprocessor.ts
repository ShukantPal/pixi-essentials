import { MacroData, ProgramTemplate } from './ProgramTemplate';
import { Shader } from '@pixi/core';

/**
 * Provides a high-level API to manage program template and generate shaders by passing macro data
 * for the shader templates.
 *
 * @public
 */
export class ShaderPreprocessor
{
    /**
     * @param vertexTemplateSrc - the vertex shader template source
     * @param fragmentTemplateSrc  - the fragment shader template source
     * @param name - custom name of the shader, if desired
     */
    static generateShader(vertexTemplateSrc: string,
        fragmentTemplateSrc: string,
        uniforms: Record<string, any>,
        data: MacroData, name?: string): Shader
    {
        const programTemplate = ShaderPreprocessor.from(vertexTemplateSrc, fragmentTemplateSrc, name);
        const program = programTemplate.generateProgram(data, name);

        return new Shader(program, uniforms);
    }

    /**
     * Creates a program template for given shader template sources. It will return a memoized instance if
     * the same sources are used together twice.
     *
     * @param vertexTemplateSrc - vertex template source
     * @param fragmentTemplateSrc - fragment template source
     * @param name - the name of the template
     */
    static from(vertexTemplateSrc: string, fragmentTemplateSrc: string, name?: string): ProgramTemplate
    {
        const key = vertexTemplateSrc + fragmentTemplateSrc;
        let template = ShaderPreprocessor.managedTemplates[key];

        if (!template)
        {
            template
                = ShaderPreprocessor.managedTemplates[key]
                = new ProgramTemplate(vertexTemplateSrc, fragmentTemplateSrc, name);
        }

        return template;
    }

    static managedTemplates: { [id: string]: ProgramTemplate } = {};
}
