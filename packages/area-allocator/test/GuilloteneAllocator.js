const { Area, AreaOrientation, GuilloteneAllocator } = require('../');
const expect = require('chai').expect;

describe('GuilloteneAllocator', function()
{
    it('should have a root node with horizontal orientation', function()
    {
        const mockAllocator = new GuilloteneAllocator(50, 60);
        const mockRoot = mockAllocator._root[1];

        expect(Area.getOrientation(mockRoot)).to.equal(AreaOrientation.HORIZONTAL);
        expect(Area.getOpenOffset(mockRoot)).to.equal(0);
        expect(Area.getCloseOffset(mockRoot)).to.equal(60);
    });

    it('should correctly decode the rectangle of an area node', function()
    {
        const mockAllocator = new GuilloteneAllocator(100, 120);
        const mockRoot = mockAllocator._root;

        mockAllocator.addChild(
            mockRoot,
            [mockRoot, Area.makeArea(0, 60, AreaOrientation.VERTICAL)],
            [mockRoot, Area.makeArea(60, 100, AreaOrientation.VERTICAL)]
        );

        const rightPane = mockAllocator.getChildren(mockRoot)[1];
        const rightPaneFrame = mockAllocator.getFrame(rightPane);

        expect(rightPaneFrame.width).to.equal(40);
        expect(rightPaneFrame.height).to.equal(120);

        mockAllocator.addChild(
            rightPane,
            [rightPane, Area.makeArea(0, 50, AreaOrientation.HORIZONTAL)],
            [rightPane, Area.makeArea(50, 100, AreaOrientation.HORIZONTAL)],
        );

        const rightBottomPane = mockAllocator.getChildren(rightPane)[1];
        const rightBottomPaneFrame = mockAllocator.getFrame(rightBottomPane);

        expect(rightBottomPaneFrame.width).to.equal(40);
        expect(rightBottomPaneFrame.height).to.equal(50);
    });

    it('should make first allocation correctly', function() {
        const mockAllocator = new GuilloteneAllocator(500, 500);
        const mockRoot = mockAllocator._root;
        const mw = 100;
        const mh = 200;

        const rect = mockAllocator.allocate(mw, mh);

        expect(rect.width).to.equal(mw);
        expect(rect.height).to.equal(mh);

        expect(mockRoot[2]).to.not.equal(undefined);
        expect(mockRoot[2].length).to.equal(2);

        const leftArea = mockAllocator.getFrame(mockRoot[2][0]);
        const rightArea = mockAllocator.getFrame(mockRoot[2][1]);

        expect(leftArea.width).to.equal(mw);
        expect(leftArea.height).to.equal(mockAllocator.height);
        expect(rightArea.width).to.equal(mockAllocator.width - mw);
        expect(rightArea.height).to.equal(mockAllocator.height);

        const leftTopArea = mockAllocator.getFrame(mockRoot[2][0][2][0]);
        const leftBottomArea = mockAllocator.getFrame(mockRoot[2][0][2][1]);

        expect(leftTopArea.width).to.equal(leftArea.width);
        expect(leftTopArea.height).to.equal(mh);
        expect(leftBottomArea.width).to.equal(leftArea.width);
        expect(leftBottomArea.height).to.equal(mockAllocator.height - mh);
    });

    it('should fill correctly on tiled allocations correctly, merge everything once freed', function()
    {
        const mockAllocator = new GuilloteneAllocator(128, 128);
        let field = 0;// 16-bit map for the 16-tiles

        const nodes = [];
        const freeOrder = [0, 14, 1, 2, 13, 15, 4, 3, 5, 6, 7, 8, 12, 9, 10, 11];

        for (let i = 0; i < 16; i++)
        {
            const rect = mockAllocator.allocate(32, 32);

            expect(rect).to.not.equal(null);
            expect(rect.width).to.equal(32);
            expect(rect.height).to.equal(32);

            const row = Math.floor(rect.x / 32);
            const column = Math.floor(rect.y / 32);
            const bit = row * 4 + column;

            field = field | (1 << bit);
            nodes.push(rect);
        }

        expect(field).to.equal((1 << 16) - 1);

        for (let i = 0; i < 16; i++)
        {
            mockAllocator.free(nodes[freeOrder[i]]);
        }

        expect(mockAllocator._root[2]).to.equal(false);
    });
});