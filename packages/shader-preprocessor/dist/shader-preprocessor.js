/* eslint-disable */
 
/*!
 * @pixi-essentials/shader-preprocessor - v1.0.1
 * Compiled Sat, 22 Aug 2020 21:46:45 UTC
 *
 * @pixi-essentials/shader-preprocessor is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 * 
 * Copyright 2019-2020, Shukant Pal <shukantpal@outlook.com>, All Rights Reserved
 */
this.PIXI = this.PIXI || {};
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@pixi/core')) :
    typeof define === 'function' && define.amd ? define(['exports', '@pixi/core'], factory) :
    (global = global || self, factory(global._pixi_essentials_shader_preprocessor = {}, global.PIXI));
}(this, (function (exports, core) { 'use strict';

    const MACRO_PATTERN = /%([\w$]+)(\([\w$, ]*\))?%/g;
    /**
     * Helper class to create and manage a program template.
     *
     * @public
     */
    class ProgramTemplate {
        /**
         * @param vertexTemplateSrc - vertex shader template
         * @param fragmentTemplateSrc - fragment shader template
         * @param name - name of the shader template. This is used to generate the names for generated programs.
         */
        constructor(vertexTemplateSrc, fragmentTemplateSrc, name = 'pixi-shader-template') {
            /**
             * The vertex shader template
             */
            this.vertexTemplateSrc = vertexTemplateSrc || core.Program.defaultVertexSrc;
            /**
             * The fragment shader template
             */
            this.fragmentTemplateSrc = fragmentTemplateSrc || core.Program.defaultFragmentSrc;
            /**
             * The name for generated programs
             */
            this.name = name;
            /**
             * The cache of generated programs for each passed macro value.
             */
            this.programCache = new Map();
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
        generateProgram(data, name) {
            const vertexSrc = this.processData(this.vertexTemplateSrc, this.vertexMacroData, data);
            const fragmentSrc = this.processData(this.fragmentTemplateSrc, this.fragmentMacroData, data);
            const key = vertexSrc + fragmentSrc;
            const memo = this.programCache.get(key);
            if (memo) {
                return memo;
            }
            const program = new core.Program(vertexSrc, fragmentSrc, name || this.name || 'pixi-processed-shader');
            this.programCache.set(key, program);
            return program;
        }
        /**
         * Extracts the macros used in the template source.
         *
         * @param templateSrc - the shader template source
         */
        extractData(templateSrc) {
            const data = [];
            const pattern = new RegExp(MACRO_PATTERN);
            let macroMatch;
            while ((macroMatch = pattern.exec(templateSrc)) !== null) {
                const id = macroMatch[1];
                let args = macroMatch[2];
                if (args) {
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
        processData(templateSrc, macros, data) {
            let generatedSrc = templateSrc;
            // Process the last macros first so that positions of the unevaluated macros don't change
            for (let i = macros.length - 1; i >= 0; i--) {
                const macro = macros[i];
                const id = macro.id;
                const value = data[id];
                let macroValue = '';
                if (typeof value === 'function') {
                    macroValue = value(...macro.args);
                }
                else {
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

    /**
     * Provides a high-level API to manage program template and generate shaders by passing macro data
     * for the shader templates.
     *
     * @public
     */
    class ShaderPreprocessor {
        /**
         * @param vertexTemplateSrc - the vertex shader template source
         * @param fragmentTemplateSrc  - the fragment shader template source
         * @param name - custom name of the shader, if desired
         */
        static generateShader(vertexTemplateSrc, fragmentTemplateSrc, uniforms, data, name) {
            const programTemplate = ShaderPreprocessor.from(vertexTemplateSrc, fragmentTemplateSrc, name);
            const program = programTemplate.generateProgram(data, name);
            return new core.Shader(program, uniforms);
        }
        /**
         * Creates a program template for given shader template sources. It will return a memoized instance if
         * the same sources are used together twice.
         *
         * @param vertexTemplateSrc - vertex template source
         * @param fragmentTemplateSrc - fragment template source
         * @param name - the name of the template
         */
        static from(vertexTemplateSrc, fragmentTemplateSrc, name) {
            const key = vertexTemplateSrc + fragmentTemplateSrc;
            let template = ShaderPreprocessor.managedTemplates[key];
            if (!template) {
                template
                    = ShaderPreprocessor.managedTemplates[key]
                        = new ProgramTemplate(vertexTemplateSrc, fragmentTemplateSrc, name);
            }
            return template;
        }
    }
    ShaderPreprocessor.managedTemplates = {};

    exports.ProgramTemplate = ProgramTemplate;
    exports.ShaderPreprocessor = ShaderPreprocessor;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
Object.assign(this.PIXI, _pixi_essentials_shader_preprocessor);
//# sourceMappingURL=shader-preprocessor.js.map
