// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import {ITurtleShellFreezer} from "./interfaces/ITurtleShellFreezer.sol";

/**
 * @title TurtleShellVault
 * @notice PUT DESCRIPTION HERE
 */
contract TurtleShellFreezer is ITurtleShellFreezer, Ownable {
    address public protocol;

    /// @dev user address => token address => amount
    /// @dev TODO: in future implementation, do not store token address in storage, let
    /// user specify it in function call
    mapping (address => mapping(address => uint256)) s_frozenFunds;

    /// @notice Modifier for checking if msg.sender is the protocol address
    modifier onlyProtocol {
        if (msg.sender != protocol) revert TurtleShellFreezer__CallerNotProtocol();
        _;
    }

    constructor() {}

    /// @inheritdoc ITurtleShellFreezer
    function freezeFunds(address user, uint256 amount, address tokenAddress) external override onlyProtocol {
        IERC20 token = IERC20(tokenAddress);
        // check allowance => error if not enough
        if (token.allowance(msg.sender, address(this)) < amount) revert TurtleShellFreezer__InsufficientAllowance();

        // update token balance in storage
        s_frozenFunds[user][tokenAddress] += amount;

        // transfer tokens to here
        token.transferFrom(msg.sender, address(this), amount);

        // emit event
        emit FundsFrozen(user, amount, tokenAddress);
    }

    /// @inheritdoc ITurtleShellFreezer
    function returnFunds(address user, address tokenAddress) external override onlyOwner {
        IERC20 token = IERC20(tokenAddress);
        uint256 amount = s_frozenFunds[user][tokenAddress];

        // update token balance in storage
        s_frozenFunds[user][tokenAddress] = 0;

        // transfer tokens to protocol
        token.transfer(protocol, amount);

        // emit event
        emit FundsReturned(user, amount, tokenAddress);
    }

    /// @inheritdoc ITurtleShellFreezer
    function unlockFunds(address user, address tokenAddress) external override onlyOwner {
        IERC20 token = IERC20(tokenAddress);
        uint256 amount = s_frozenFunds[user][tokenAddress];

        // update token balance in storage
        s_frozenFunds[user][tokenAddress] = 0;

        // transfer tokens to user
        token.transfer(user, amount);

        // emit event
        emit FundsUnlocked(user, amount, tokenAddress);
    }

    /// @inheritdoc ITurtleShellFreezer
    function setProtocol(address protocolAddress) external override onlyOwner {
        protocol = protocolAddress;
    }

    /// @dev GETTER FUNCTIONS

    /// @inheritdoc ITurtleShellFreezer
    function getFrozenFundsOf(address user, address tokenAddress) external view returns (uint256) {
        return s_frozenFunds[user][tokenAddress];
    }
}


