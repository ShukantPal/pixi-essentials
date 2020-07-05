const { ShaderPreprocessor } = require('../');
const { expect } = require('chai');

describe('ShaderPreprocessor', function ()
{
    it('should use the same program for the same generated source', function ()
    {
        const vertexTemplateSrc = `
        void main(void) {
            int x = %someValue%;
        }`;

        const fragmentTemplateSrc = `void main(void) {}`;

        const shader = ShaderPreprocessor.generateShader(vertexTemplateSrc, fragmentTemplateSrc, {}, { someValue: 4 });
        const shaderMemo = ShaderPreprocessor.generateShader(vertexTemplateSrc, fragmentTemplateSrc, {}, { someValue: 4 });

        expect(shader.program).to.equal(shaderMemo.program);
    });
});
