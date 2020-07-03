import { Program } from '@pixi/core';

type TemplateMacro = {
    id: string;
    loc: number[];
    type: 'field' | 'function';
};

type TemplateFunctionMacro = TemplateMacro & {
    parameters: string[];
    type: 'function';
};

const MACRO_PATTERN = /%([\w$])+(\(([\w$, ])*\))?%/g;

/**
 * Helper class to create a shader template.
 */
export class ProgramTemplate
{
    public vertexTemplateSrc: string;
    public fragmentTemplateSrc: string;
    public name: string;

    protected programCache: Map<string, Program>;
    protected vertexMacroData: Record<string, TemplateMacro>;
    protected fragmentMacroData: Record<string, TemplateMacro>;

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
     * Extracts the macros used in the template source.
     *
     * @param templateSrc - the shader template source
     */
    protected extractData(templateSrc: string): Record<string, TemplateMacro>
    {
        const data = {};
        const pattern = new RegExp(MACRO_PATTERN);

        return data;
    }
}
