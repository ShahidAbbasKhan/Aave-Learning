const { assert } = require("chai");

describe("Escrow", function () {
    let escrow;
    let depositorAddr = "0x47ac0Fb4F2D84898e4D9E7b4DaB3C24507a6D503";
    let depositorSigner;
    let arbiter;
    let beneficiary;
    let dai;
    const deposit = ethers.utils.parseEther("500");
    before(async () => {
        const signer = await ethers.provider.getSigner(0);
        signer.sendTransaction({ to: depositorAddr, value: ethers.utils.parseEther("1") });
        await hre.network.provider.request({
            method: "hardhat_impersonateAccount",
            params: [depositorAddr]
        })
        depositorSigner = await ethers.provider.getSigner(depositorAddr);

        dai = await ethers.getContractAt("IERC20", "0x6b175474e89094c44da98b954eedeac495271d0f", depositorSigner);
        aDai = await ethers.getContractAt("IERC20", "0x028171bCA77440897B824Ca71D1c56caC55b68A3");

        const escrowAddress = ethers.utils.getContractAddress({
            from: depositorAddr,
            nonce: (await ethers.provider.getTransactionCount(depositorAddr)) + 1,
        });

        await dai.approve(escrowAddress, deposit);

        [arbiter, beneficiary] = await ethers.provider.listAccounts();
        const Escrow = await ethers.getContractFactory("Escrow", depositorSigner);
        escrow = await Escrow.deploy(arbiter, beneficiary, deposit);
        await escrow.deployed();
    });

    it("should not hold DAI", async function () {
        const balance = await dai.balanceOf(escrow.address);
        assert.equal(balance.toString(), "0");
    });

    it("should hold aDAI", async function () {
        const balance = await aDai.balanceOf(escrow.address);
        assert.equal(balance.toString(), deposit.toString());
    });

    describe('approving as the beneficiary', () => {
        it('should not be allowed', async () => {
            let ex;
            try {
                const signer = await ethers.provider.getSigner(beneficiary);
                await escrow.connect(signer).approve();
            }
            catch(_ex) {
                ex = _ex;
            }
            assert(ex, "expected the transaction to revert when the beneficiary calls approve!");
        });
    });

    describe('after approving', () => {
        before(async () => {
            const thousandDays = 1000 * 24 * 60 * 60;
            await hre.network.provider.request({
                method: "evm_increaseTime",
                params: [thousandDays]
            });
            const arbiterSigner = await ethers.provider.getSigner(arbiter);
            await escrow.connect(arbiterSigner).approve();
        });

        it('should provide the principal to the beneficiary', async () => {
            const balance = await dai.balanceOf(beneficiary);
            assert.equal(balance.toString(), deposit.toString());
        });
    });
});
