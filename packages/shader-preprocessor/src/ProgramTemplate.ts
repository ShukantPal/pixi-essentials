import { Program } from '@pixi/core';

type TemplateData = Array<{
    id: string;
    args: string[];
    position: { start: number; end: number };
    type: 'field' | 'function';
}>;

export type MacroData = {
    [id: string]: string | ((...args: string[]) => string);
};

const MACRO_PATTERN = /%([\w$]+)(\([\w$, ]*\))?%/g;

/**
 * Helper class to create and manage a program template.
 *
 * @public
 */
export class ProgramTemplate
{
    public vertexTemplateSrc: string;
    public fragmentTemplateSrc: string;
    public name: string;

    protected programCache: Map<string, Program>;
    protected vertexMacroData: TemplateData;
    protected fragmentMacroData: TemplateData;

    /**
     * @param vertexTemplateSrc - vertex shader template
     * @param fragmentTemplateSrc - fragment shader template
     * @param name - name of the shader template. This is used to generate the names for generated programs.
     */
    constructor(vertexTemplateSrc?: string, fragmentTemplateSrc?: string, name = 'pixi-shader-template')
    {
        /**
         * The vertex shader template
         */
        this.vertexTemplateSrc = vertexTemplateSrc || Program.defaultVertexSrc;

        /**
         * The fragment shader template
         */
        this.fragmentTemplateSrc = fragmentTemplateSrc || Program.defaultFragmentSrc;

        /**
         * The name for generated programs
         */
        this.name = name;

        /**
         * The cache of generated programs for each passed macro value.
         */
        this.programCache = new Map<string, Program>();

        /**
         * The macros used in the vertex shader
         */
        this.vertexMacroData = this.extractData(this.vertexTemplateSrc);

        /**
         * The macros used in the fragment shader
         */
        this.fragmentMacroData = this.extractData(this.fragmentTemplateSrc);
    }

    /**
     * Generates a shader program from this template and passed macro-data.
     *
     * @param data - data providing the values of the macros in the shader template
     * @param name - optional name, if another name is desired
     * @return the generated shader program
     */
    generateProgram(data: MacroData, name: string): Program
    {
        const vertexSrc = this.processData(this.vertexTemplateSrc, this.vertexMacroData, data);
        const fragmentSrc = this.processData(this.fragmentTemplateSrc, this.fragmentMacroData, data);
        const key = vertexSrc + fragmentSrc;
        const memo = this.programCache.get(key);

        if (memo)
        {
            return memo;
        }

        const program = new Program(vertexSrc, fragmentSrc, name || this.name || 'pixi-processed-shader');

        this.programCache.set(key, program);

        return program;
    }

    /**
     * Extracts the macros used in the template source.
     *
     * @param templateSrc - the shader template source
     */
    protected extractData(templateSrc: string): TemplateData
    {
        const data = [];
        const pattern = new RegExp(MACRO_PATTERN);

        let macroMatch;

        while ((macroMatch = pattern.exec(templateSrc)) !== null)
        {
            const id = macroMatch[1];
            let args = macroMatch[2];

            if (args)
            {
                args = args.slice(1, -1).split(',').map((arg) => arg.trim());
            }

            data.push({
                id,
                args,
                position: { start: macroMatch.index, end: macroMatch.index + macroMatch[0].length },
                type: args ? 'function' : 'field',
            });
        }

        return data;
    }

    /**
     * Evaluates the macros in the template and generates the shader's source.
     *
     * @param templateSrc - template source
     * @param macros - data defining the macros in the template source
     * @param data - data providing the values for the macros
     * @return the generated shader source
     */
    protected processData(templateSrc: string, macros: TemplateData, data: MacroData): string
    {
        let generatedSrc = templateSrc;

        // Process the last macros first so that positions of the unevaluated macros don't change
        for (let i = macros.length - 1; i >= 0; i--)
        {
            const macro = macros[i];
            const id = macro.id;
            const value = data[id];

            let macroValue = '';

            if (typeof value === 'function')
            {
                macroValue = value(...macro.args);
            }
            else
            {
                // Coerce the value to a string
                macroValue = `${value}`;
            }

            generatedSrc = generatedSrc.slice(0, macro.position.start)
                + macroValue
                + generatedSrc.slice(macro.position.end);
        }

        return generatedSrc;
    }
}
