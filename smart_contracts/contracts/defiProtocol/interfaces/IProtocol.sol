// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

/**
 * @title Protocol interface
 * @notice Interface for demo DeFi protocol
 */
interface IProtocol {
    /**
     * @notice Function for depositng into theprotocol
     * @param depositAmount The amount to deposit
     */
    function deposit(uint256 depositAmount) external;

    /**
     * @notice Function for withdrawing from the protocol
     * @param withdrawAmount The amount to withdraw
     */
    function withdraw(uint256 withdrawAmount) external;

    /**
     * @notice Function for getting the current TVL from the protocol
     * @return uint256 TVL
     */
    function getTVL() external view returns (uint256);

    /**
     * @notice Function for getting the user's balance in the protocol
     * @param user The user's address
     * @return uint256 User's balance
     */
    function getUserBalance(address user) external view returns (uint256);

    function adminEmergencyWithdraw(uint256 withdrawAmount) external;
}
