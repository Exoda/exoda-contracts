// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IInitContract {
	/// @notice Init function that gets called from `ExodaFactory.deploy`.
	/// Also kown as the constructor for cloned contracts. Any ETH send to `ExodaFactory.deploy` ends up here.
	/// @param data Can be abi encoded arguments or anything else.
	function init(bytes calldata data) external payable;
}
