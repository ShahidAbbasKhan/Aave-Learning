// SPDX-License-Identifier: MIT
pragma solidity ^0.7.5;

import "./IERC20.sol";
import "./ILendingPool.sol";

contract CollateralGroup {
	ILendingPool pool = ILendingPool(0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9);
	IERC20 dai = IERC20(0x6B175474E89094C44Da98b954EedeAC495271d0F);
	IERC20 aDai = IERC20(0x028171bCA77440897B824Ca71D1c56caC55b68A3); 

	uint depositAmount = 10000e18;
	address[] members;

	constructor(address[] memory _members) {
		members = _members;

		for(uint i = 0; i < _members.length; i++) {
			dai.transferFrom(members[i], address(this), depositAmount);
		}
		uint totalDeposit = _members.length * depositAmount;
		dai.approve(address(pool), totalDeposit);
		pool.deposit(address(dai), totalDeposit, address(this), 0);
	}

	function withdraw() external {
		uint256 balance = aDai.balanceOf(address(this));
		aDai.approve(address(pool), balance);
		for(uint i = 0; i < members.length; i++) {
			pool.withdraw(address(dai), depositAmount, members[i]);
		}
	}

	function borrow(address asset, uint amount) external {
		//assest is the address that you want to borrow for that collateral is given, 1 is interestRate 
		//(1 stable, 2 variable)

		pool.borrow(asset, amount, 1, 0, address(this));
		IERC20(asset).transfer(msg.sender, amount);
	}

	function repay(address asset, uint amount) external {
		
	}
}