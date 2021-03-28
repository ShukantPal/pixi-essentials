const { FILL_RULE, Path } = require('../');

describe('Path', () =>
{
    const FILL_RULE_KEYS = Object.keys(FILL_RULE);

    FILL_RULE_KEYS.forEach(function (fillRuleId)
    {
        it(`should hit-test correctly for simple polygon for fill-rule ${fillRuleId}`, () =>
        {
            const path = new Path();

            path.fillRule = FILL_RULE[fillRuleId];
            path.points.push(
                0, 0,
                50, 50,
                100, 150,
                100, 0,
                50, 45,
            );

            expect(path.contains(50, 47.5)).to.equal(true);
            expect(path.contains(49, 48)).to.equal(true);
            expect(path.contains(49, 40)).to.equal(false);
            expect(path.contains(-1, 0)).to.equal(false);
        });

        it(`should hit-test correctly for polylines with holes for fill-rule ${fillRuleId}`, () =>
        {
            const path = new Path();

            path.fillRule = FILL_RULE[fillRuleId];
            path.points.push(
                0, 0,
                50, 50,
                1000, 0,
            );
            path.points.push(
                800, 5,
                50, 25,
                10, 10,
            );

            expect(path.contains(50, 47.5)).to.equal(true);
            expect(path.contains(40, 20)).to.equal(false);
            expect(path.contains(-1, 0)).to.equal(false);
        });
    });
});