const { Container } = require('@pixi/display');
const { Graphics } = require('@pixi/graphics');
const { Rectangle } = require('@pixi/math');
const expect = require('chai').expect;

require('../');

describe('SmartMaskMixin', function ()
{
    it('should install itself on the display-object', function ()
    {
        const container = new Container();

        expect(container.updateSmartMask).to.not.equal(undefined);
    });

    it('should not add a mask on masking container when children lie inside the mask', function ()
    {
        const parent = new Container();
        const mask = parent.addChild(new Graphics().drawRect(0, 0, 30, 45));

        parent.addChild(new Graphics().drawRect(0, 0, 25, 25));

        parent.smartMask = mask;
        parent.updateSmartMask(true, false);

        expect(parent.mask).to.equal(null);
    });

    it('should not add a mask when filter-area is overlaps non-mask area', function ()
    {
        const parent = new Container();
        const mask = parent.addChild(new Graphics().drawRect(0, 0, 100, 100));

        parent.addChild(new Graphics().drawRect(20, 20, 40, 40));
        parent.smartMask = mask;

        parent.updateSmartMask(true, false);
        expect(parent.mask).to.equal(null);

        parent.filterArea = new Rectangle(75, 75, 125, 125);
        parent.updateSmartMask();

        expect(parent.mask).to.equal(mask);
    });

    it('should not add mask if unmasked children extend outside mask, but masked children do not', function ()
    {
        const parent = new Container();
        const mask = parent.addChild(new Graphics().drawRect(0, 0, 100, 100));

        const child = new Graphics().drawRect(0, 0, 200, 200);

        parent.addChild(child);
        parent.smartMask = mask;

        parent.updateSmartMask(true, false);

        expect(parent.mask).to.equal(mask);

        child.smartMask = mask;
        parent.updateSmartMask();

        expect(parent.mask).to.equal(null);
    });
});
