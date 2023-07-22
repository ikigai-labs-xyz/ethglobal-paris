// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {ITurtleShellFirewall} from "./ITurtleShellFirewall.sol";

/**
 * @title ITurtleShellFirewallIncreaser - Extension for the TurtleShell Firewall contract
 * @notice This interface extension includes methods for automatically increasing and decreasing
 * the parameters for a given protocol
 */
interface ITurtleShellFirewallIncreaser is ITurtleShellFirewall {
    /// @notice Decrease the parameter for the calling protocol by a given amount
    /// @param amount The amount to decrease the parameter by
    function decreaseParameter(uint256 amount) external returns (bool);

    /// @notice Increase the parameter for the calling protocol by a given amount
    /// @param amount The amount to increase the parameter by
    function increaseParameter(uint256 amount) external returns (bool);
}
