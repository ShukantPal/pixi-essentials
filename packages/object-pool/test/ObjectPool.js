const { ObjectPool, ObjectPoolFactory } = require('..');
const sinon = require('sinon');
const expect = require('chai').expect;

// Constructor that constructs constructors :P
function MetaConstructor()
{
    return function InnerConstructor()
    {
        // This is intentionally left blank
    };
}

describe('ObjectPool', () =>
{
    it('should not create objects in allocateArray if pool has enough objects to fulfill demand', function ()
    {
        const ctorPool = ObjectPoolFactory.build(MetaConstructor());
        const ctorBin = new Array(16);

        // Ensure we allocate & release 16 objects, so they remain in the pool

        for (let i = 0; i < ctorBin.length; i++)
        {
            ctorBin[i] = ctorPool.allocate();
        }
        for (let i = 0; i < ctorBin.length; i++)
        {
            ctorPool.release(ctorBin[i]);
            ctorBin[i] = null;
        }

        const poolSpy = sinon.spy(ctorPool, 'create');

        ctorPool.allocateArray(ctorBin);

        expect(poolSpy.called).to.equal(false);
    });
});
