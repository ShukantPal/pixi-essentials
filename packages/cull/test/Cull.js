const { Container } = require('@pixi/display');
const { Cull } = require('../');
const { Rectangle } = require('@pixi/math');
const { Graphics } = require('@pixi/graphics');
const expect = require('chai').expect;

describe('Cull', () =>
{
    it('should cull out display-objects outside of the screen', () =>
    {
        const cull = new Cull({ recursive: true, toggle: 'renderable' });

        const stage = new Graphics().drawRect(0, 0, 10, 10);
        const rect1 = stage.addChild(new Graphics().drawRect(250, 250, 500, 500));
        const rect2 = stage.addChild(new Graphics().drawRect(0, 0, 100, 100));
        const parent = stage.addChild(new Graphics().drawRect(900, 1000, 150, 150));
        const rect3 = stage.addChild(new Graphics().drawRect(10, 10, 20, 20));

        cull.add(stage);
        cull.cull(new Rectangle(90, 90, 200, 200));

        expect(stage.renderable).to.equal(true);
        expect(rect1.renderable).to.equal(true);
        expect(rect2.renderable).to.equal(true);
        expect(parent.renderable).to.equal(false);
        expect(rect3.renderable).to.equal(false);
    });

    it('should not recalculate transforms when skipUpdate is passed', () =>
    {
        const cull = new Cull({ recursive: true });

        const stage = new Container();
        const rect1 = stage.addChild(new Container());

        const stageTransformID = stage.transform._worldID;
        const rect1TransformID = rect1.transform._worldID;

        cull.cull(new Rectangle());

        expect(stage.transform._worldID).to.equal(stageTransformID);
        expect(rect1.transform._worldID).to.equal(rect1TransformID);
    });
});
