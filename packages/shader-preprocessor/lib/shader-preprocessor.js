/*!
 * @pixi-essentials/shader-preprocessor - v1.0.0
 * Compiled Mon, 20 Jul 2020 15:45:20 UTC
 *
 * @pixi-essentials/shader-preprocessor is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var core = require('@pixi/core');

var MACRO_PATTERN = /%([\w$]+)(\([\w$, ]*\))?%/g;
/**
 * Helper class to create and manage a program template.
 *
 * @public
 */
var ProgramTemplate = /** @class */ (function () {
    /**
     * @param vertexTemplateSrc - vertex shader template
     * @param fragmentTemplateSrc - fragment shader template
     * @param name - name of the shader template. This is used to generate the names for generated programs.
     */
    function ProgramTemplate(vertexTemplateSrc, fragmentTemplateSrc, name) {
        if (name === void 0) { name = 'pixi-shader-template'; }
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
    ProgramTemplate.prototype.generateProgram = function (data, name) {
        var vertexSrc = this.processData(this.vertexTemplateSrc, this.vertexMacroData, data);
        var fragmentSrc = this.processData(this.fragmentTemplateSrc, this.fragmentMacroData, data);
        var key = vertexSrc + fragmentSrc;
        var memo = this.programCache.get(key);
        if (memo) {
            return memo;
        }
        var program = new core.Program(vertexSrc, fragmentSrc, name || this.name || 'pixi-processed-shader');
        this.programCache.set(key, program);
        return program;
    };
    /**
     * Extracts the macros used in the template source.
     *
     * @param templateSrc - the shader template source
     */
    ProgramTemplate.prototype.extractData = function (templateSrc) {
        var data = [];
        var pattern = new RegExp(MACRO_PATTERN);
        var macroMatch;
        while ((macroMatch = pattern.exec(templateSrc)) !== null) {
            var id = macroMatch[1];
            var args = macroMatch[2];
            if (args) {
                args = args.slice(1, -1).split(',').map(function (arg) { return arg.trim(); });
            }
            data.push({
                id: id,
                args: args,
                position: { start: macroMatch.index, end: macroMatch.index + macroMatch[0].length },
                type: args ? 'function' : 'field',
            });
        }
        return data;
    };
    /**
     * Evaluates the macros in the template and generates the shader's source.
     *
     * @param templateSrc - template source
     * @param macros - data defining the macros in the template source
     * @param data - data providing the values for the macros
     * @return the generated shader source
     */
    ProgramTemplate.prototype.processData = function (templateSrc, macros, data) {
        var generatedSrc = templateSrc;
        // Process the last macros first so that positions of the unevaluated macros don't change
        for (var i = macros.length - 1; i >= 0; i--) {
            var macro = macros[i];
            var id = macro.id;
            var value = data[id];
            var macroValue = '';
            if (typeof value === 'function') {
                macroValue = value.apply(void 0, macro.args);
            }
            else {
                // Coerce the value to a string
                macroValue = "" + value;
            }
            generatedSrc = generatedSrc.slice(0, macro.position.start)
                + macroValue
                + generatedSrc.slice(macro.position.end);
        }
        return generatedSrc;
    };
    return ProgramTemplate;
}());

/**
 * Provides a high-level API to manage program template and generate shaders by passing macro data
 * for the shader templates.
 *
 * @public
 */
var ShaderPreprocessor = /** @class */ (function () {
    function ShaderPreprocessor() {
    }
    /**
     * @param vertexTemplateSrc - the vertex shader template source
     * @param fragmentTemplateSrc  - the fragment shader template source
     * @param name - custom name of the shader, if desired
     */
    ShaderPreprocessor.generateShader = function (vertexTemplateSrc, fragmentTemplateSrc, uniforms, data, name) {
        var programTemplate = ShaderPreprocessor.from(vertexTemplateSrc, fragmentTemplateSrc, name);
        var program = programTemplate.generateProgram(data, name);
        return new core.Shader(program, uniforms);
    };
    /**
     * Creates a program template for given shader template sources. It will return a memoized instance if
     * the same sources are used together twice.
     *
     * @param vertexTemplateSrc - vertex template source
     * @param fragmentTemplateSrc - fragment template source
     * @param name - the name of the template
     */
    ShaderPreprocessor.from = function (vertexTemplateSrc, fragmentTemplateSrc, name) {
        var key = vertexTemplateSrc + fragmentTemplateSrc;
        var template = ShaderPreprocessor.managedTemplates[key];
        if (!template) {
            template
                = ShaderPreprocessor.managedTemplates[key]
                    = new ProgramTemplate(vertexTemplateSrc, fragmentTemplateSrc, name);
        }
        return template;
    };
    ShaderPreprocessor.managedTemplates = {};
    return ShaderPreprocessor;
}());

exports.ProgramTemplate = ProgramTemplate;
exports.ShaderPreprocessor = ShaderPreprocessor;
//# sourceMappingURL=shader-preprocessor.js.map
