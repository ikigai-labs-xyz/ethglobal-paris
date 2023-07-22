// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {IProtocol} from "./interfaces/IProtocol.sol";

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract NonFirewalledProtocol is IProtocol, Ownable {
    IERC20 private s_usdc;
    uint256 private s_tvl;

    mapping(address => uint256) public balances;

    constructor(address _usdcAddress) {
        s_usdc = IERC20(_usdcAddress);
    }

    function deposit(uint256 depositAmount) external override {
        require(depositAmount > 0, "deposit: Amount must be greater than zero");
        require(
            s_usdc.allowance(msg.sender, address(this)) >= depositAmount,
            "deposit: Insufficient allowance"
        );
        require(
            s_usdc.balanceOf(msg.sender) >= depositAmount,
            "deposit: Insufficient balance"
        );

        balances[msg.sender] += depositAmount;
        
        // increase TVL
        s_tvl += depositAmount;

        require(
            s_usdc.transferFrom(msg.sender, address(this), depositAmount),
            "deposit: transferFrom failed"
        );
    }

    function withdraw(uint256 withdrawAmount) external override {
        require(
            withdrawAmount > 0,
            "withdraw: Amount must be greater than zero"
        );
        require(
            balances[msg.sender] >= withdrawAmount,
            "withdraw: Insufficient balance"
        );

        s_tvl -= withdrawAmount;

        require(
            s_usdc.transfer(msg.sender, withdrawAmount),
            "withdraw: transfer failed"
        );

        // We introduce a reentrancy vulnerability here
        balances[msg.sender] -= withdrawAmount;
    }

    // Admin can withdraw an abitrary amount of funds
    // There is a bug on access controls, this function should be restricted to owner of the contract (onlyOwner)
    function adminEmergencyWithdraw(uint256 withdrawAmount) external override {
        require(
            withdrawAmount > 0,
            "withdraw: Amount must be greater than zero"
        );

        require(
            s_usdc.transfer(msg.sender, withdrawAmount),
            "withdraw: transfer failed"
        );
    }

    function getTVL() public view returns (uint256) {
        return s_tvl;
    }

    function getUserBalance(address user) external view override returns (uint256) {
        return balances[user];
    }
}
