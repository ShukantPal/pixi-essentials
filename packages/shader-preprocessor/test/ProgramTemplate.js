const { ProgramTemplate } = require('../');
const { expect } = require('chai');

describe('ProgramTemplate', function ()
{
    it('should generate a the correct shader program for the macro values passed', function ()
    {
        const vertexTemplateSrc = `
void main(void) {
    int someValue = %someValue%;
    int r = %componentValue(red)%;
    int g = %componentValue(green)%;
}`;

        const fragmentTemplateSrc = `
void main(void) {
    int someValue = %someValue%;
}`;

        const vertexSrc = `
    int someValue = 4;
    int r = 3;
    int g = 4;
`;
        const fragmentSrc = `
    int someValue = 4;
`;

        const program = new ProgramTemplate(vertexTemplateSrc, fragmentTemplateSrc).generateProgram({
            someValue: '4',
            componentValue: (color) =>
            {
                if (color === 'red')
                {
                    return '3';
                }

                return 4;
            },
        });

        expect(program.vertexSrc.includes(vertexSrc)).to.equal(true);
        expect(program.fragmentSrc.includes(fragmentSrc)).to.equal(true);
    });
});
