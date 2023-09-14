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

    it("should hold DAI", async function () {
        const balance = await dai.balanceOf(escrow.address);
        assert.equal(balance.toString(), deposit.toString());
    });
});
