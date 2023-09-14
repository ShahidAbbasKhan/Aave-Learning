//SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.5;

import "./IERC20.sol";
import "./IWETHGateway.sol";

contract Escrow {
    address arbiter;
    address depositor;
    address beneficiary;
    uint256 depositedAmount;
    IWETHGateway gateway = IWETHGateway(0xDcD33426BA191383f1c9B431A342498fdac73488);
    IERC20 aWETH = IERC20(0x030bA81f1c18d280636F32af80b9AAd02Cf0854e);

    constructor(address _arbiter, address _beneficiary) payable {
        depositedAmount = msg.value;
        arbiter = _arbiter;
        beneficiary = _beneficiary;
        depositor = msg.sender;
        gateway.depositETH{value: address(this).balance}(address(this), 0);
        // ETH => WETH transfered into Aave Pool , escrow will get aWETH 
        
    }

    function approve() external {
        require(msg.sender == arbiter, "Not Arbiter");
        uint balance = aWETH.balanceOf(address(this));
        aWETH.approve(address(gateway), balance);
        gateway.withdrawETH(balance, address(this));
        // withdrawing Eth from Aave Pool
        (bool sentToBeneficiary,) = payable(beneficiary).call{value: depositedAmount}("");
        require(sentToBeneficiary, "Sending eth failed to benificiary");
        uint256 interestEarned =  address(this).balance - depositedAmount;
        selfdestruct(payable(depositor)); // remaining eth will be sent to depositor
        // (bool sentToDepositor,) = payable(depositor).call{value: interestEarned}("");
        // require(sentToDepositor, "Sending eth failed to depositor");

    }
    receive() external payable{} // will be able to receive ethers
}
