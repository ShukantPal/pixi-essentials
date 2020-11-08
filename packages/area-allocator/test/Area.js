const { Area } = require('../');
const expect = require('chai').expect;

describe('Area', function()
{
    it('should read and write correctly', function()
    {
        const area = Area.makeArea(10, 10000, 1);

        expect(Area.getOpenOffset(area)).to.equal(10);
        expect(Area.getCloseOffset(area)).to.equal(10000);
        expect(Area.getOrientation(area)).to.equal(1);
    });
});