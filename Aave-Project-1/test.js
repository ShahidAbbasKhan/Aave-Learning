const { assert } = require("chai");

describe('Lottery', function () {
    before(async () => {
        const Lottery = await ethers.getContractFactory("Lottery");
        lottery = await Lottery.deploy();
        await lottery.deployed();
    });

    it('should set the lottery drawing', async () => {
        const drawing = await lottery.drawing();
        assert(drawing, "expected the drawing uint to be set!");
    });

    it('should set the lottery drawing for a week away', async () => {
        const drawing = await lottery.drawing();

        const oneWeek = 6 * 24 * 60 * 60;
        const sixDaysFromNowForked = 1607204609 + oneWeek;
        assert.isAbove(drawing.toNumber(), sixDaysFromNowForked, "expected the lottery drawing to be above 6 days away");

        const eightDays = 8 * 24 * 60 * 60;
        const eightDaysFromNowForked = 1607204609 + eightDays + 1;
        assert.isBelow(drawing.toNumber(), eightDaysFromNowForked, "expected the lottery drawing to be less than 8 days away");
    });
});
