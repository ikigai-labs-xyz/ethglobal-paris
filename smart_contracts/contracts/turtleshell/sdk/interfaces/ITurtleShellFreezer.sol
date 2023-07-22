// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

/**
 * @title ITurtleShellFreezer
 */
interface ITurtleShellFreezer {
    /// @notice Thrown when the caller is not the protocol
    error TurtleShellFreezer__CallerNotProtocol();
    /// @notice Thrown when the caller does not have enough allowance to transfer the to be frozen tokens
    error TurtleShellFreezer__InsufficientAllowance();

    /// @notice Event emitted when funds are frozen by the protocol
    event FundsFrozen(address indexed user, uint256 indexed amount, address indexed tokenAddress);
    /// @notice Event emitted when the withdrawal is rejected and the funds are returned to the protocol
    event FundsReturned(address indexed user, uint256 indexed amount, address indexed tokenAddress);
    /// @notice Event emitted when the funds are unlocked by Governance and are transferred to the user
    event FundsUnlocked(address indexed user, uint256 indexed amount, address indexed tokenAddress);

    /**
     * @notice Function to freeze funds
     * @param user Address of the user
     * @param amount Amount to freeze
     * @param tokenAddress Address of the token to freeze
     * @dev This function can only be called by the protocol
     */
    function freezeFunds(address user, uint256 amount, address tokenAddress) external;

    /**
     * @notice Function to return funds to the protocol
     * @param user Address of the user
     * @param tokenAddress Address of the token to return
     * @dev This function can only be called by the owner (governance). Funds should only be
     * released by Governance
     */
    function returnFunds(address user, address tokenAddress) external;

    /**
     * @notice Function to unlock funds and transfer them to the user
     * @param user Address of the user
     * @param tokenAddress Address of the token to unlock
     * @dev This function can only be called by the owner (governance). Funds should only be allowed
     * to be unlocked by Governance
     */
    function unlockFunds(address user, address tokenAddress) external;

    /**
     * @notice Function to set the protocol address
     * @param protocolAddress Address of the protocol
     * @dev This function can only be called by the owner (governance)
     */
    function setProtocol(address protocolAddress) external;

    /**
     * @notice Function to get the amount of frozen funds of a user
     * @param user address of the user
     * @param tokenAddress Token address of the frozen funds
     * @return uint256 amount of frozen funds
     */
    function getFrozenFundsOf(address user, address tokenAddress) external view returns (uint256);
}