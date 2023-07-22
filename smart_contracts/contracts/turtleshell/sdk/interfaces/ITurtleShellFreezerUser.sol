// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

/**
 * @title ITurtleShellFreezerUser
 */
interface ITurtleShellFreezerUser {
    /// @notice Event emitted when the protocoal automatically creates an unlock proposal
    event UnlockProposalCreated(uint256 indexed proposalId);
}