// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { IInitContract } from "./IInitContract.sol";

interface IExodaFactory {
	event LogDeploy(IInitContract indexed master, bytes data, IInitContract indexed clone);

	/// @notice Deploys a given master Contract as a clone.
	/// Any ETH transferred with this call is forwarded to the new clone.
	/// Emits `LogDeploy`.
	/// @param master The address of the contract to clone.
	/// @param data Additional abi encoded calldata that is passed to the new clone via `IMasterContract.init`.
	/// @param useCreate2 Creates the clone by using the CREATE2 opcode, in this case `data` will be used as salt.
	/// @return Address of the created clone contract.
	function deploy(IInitContract master, bytes calldata data, bool useCreate2) external payable returns (IInitContract);

	/// @notice Mapping from masterContract to an array of all clones
	/// On mainnet events can be used to get this list, but events aren't always easy to retrieve and
	/// barely work on sidechains. While this adds gas, it makes enumerating all clones much easier.
	function clonesOf(IInitContract master) external view returns (IInitContract[] memory);

	/// @notice Returns the count of clones that exists for a specific masterContract
	/// @param master The address of the master contract.
	/// @return Total number of clones for the masterContract.
	function clonesOfCount(IInitContract master) external view returns (uint256);

	/// @notice Mapping from clone contracts to their masterContract.
	function masterOf(IInitContract clone) external view returns (IInitContract);
}
