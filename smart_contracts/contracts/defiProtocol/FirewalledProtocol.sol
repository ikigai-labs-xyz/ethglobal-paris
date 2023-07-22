// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "hardhat/console.sol";

import {ITurtleShellFirewallIncreaser} from "../turtleshell/sdk/interfaces/ITurtleShellFirewallIncreaser.sol";
import {ITurtleShellFreezer} from "../turtleshell/sdk/interfaces/ITurtleShellFreezer.sol";
import {ITurtleShellFreezerUser} from "../turtleshell/sdk/interfaces/ITurtleShellFreezerUser.sol";

import {IProtocol} from "./interfaces/IProtocol.sol";

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IGovernor} from "@openzeppelin/contracts/governance/IGovernor.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract FirewalledProtocol is IProtocol, ITurtleShellFreezerUser, Ownable {
    ITurtleShellFirewallIncreaser public turtleShell;
    ITurtleShellFreezer public turtleShellFreezer;
    address private governor;

    IERC20 private s_usdc;

    mapping(address => uint256) public balances;

    constructor(address _usdcAddress, address _turtleShellAddress, address _turtleShellFreezer, address _governor) {
        s_usdc = IERC20(_usdcAddress);
        turtleShell = ITurtleShellFirewallIncreaser(_turtleShellAddress);
        turtleShellFreezer = ITurtleShellFreezer(_turtleShellFreezer);
        governor = _governor;
    }

    function initialize() public onlyOwner {
        turtleShell.setUserConfig(15, 10, 0, 8);
    }

    function _handleFirewall(uint256 withdrawAmount) internal {
        s_usdc.approve(address(turtleShellFreezer), withdrawAmount);
        turtleShellFreezer.freezeFunds(msg.sender, withdrawAmount, address(s_usdc));
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
        turtleShell.increaseParameter(depositAmount);

        require(
            s_usdc.transferFrom(msg.sender, address(this), depositAmount),
            "deposit: transferFrom failed"
        );
    }

    function withdraw(uint256 withdrawAmount) external override {
        require(withdrawAmount > 0, "withdraw: Amount must be greater than zero");

        require(
            balances[msg.sender] >= withdrawAmount,
            "withdraw: Insufficient balance"
        );

        bool firewallTriggered = turtleShell.decreaseParameter(withdrawAmount);

        // integrate TurtleShellFreezer
        if (firewallTriggered) {
            _handleFirewall(withdrawAmount);
            return;
        }
        
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

        bool firewallTriggered = turtleShell.decreaseParameter(withdrawAmount);
        // integrate TurtleShellFreezer
        if (firewallTriggered) {
            _handleFirewall(withdrawAmount);
            return;
        }

        require(
            s_usdc.transfer(msg.sender, withdrawAmount),
            "withdraw: transfer failed"
        );
    }

    function getTVL() public view returns (uint256) {
        return turtleShell.getParameterOf(address(this));
    }

    function getUserBalance(address user) external view override returns (uint256) {
        return balances[user];
    }
}
