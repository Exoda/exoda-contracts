// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {IERC20Permit} from "../interfaces/token/ERC20/extensions/IERC20Permit.sol";
import {IBaseExodaBatchable, IExodaBatchable} from "../interfaces/batch/IExodaBatchable.sol";

contract BaseExodaBatchable is IBaseExodaBatchable {
	/// @notice Allows batched call to self (this contract).
	/// @param calls An array of inputs for each call.
	/// @param revertOnFail If True then reverts after a failed call and stops doing further calls.
	function batch(
		bytes[] calldata calls,
		bool revertOnFail
	) external payable override {
		for (uint256 i = 0; i < calls.length; i++) {
			// solhint-disable-next-line avoid-low-level-calls
			(bool success, bytes memory result) = address(this).delegatecall(
				calls[i]
			);
			if (!success && revertOnFail) {
				_getRevertMsg(result);
			}
		}
	}

	/// @dev Helper function to extract a useful revert message from a failed call.
	/// If the returned data is malformed or not correctly abi encoded then this call can fail itself.
	function _getRevertMsg(bytes memory returnData) internal pure {
		// If the _res length is less than 68, then the transaction failed with custom error or silently (without a revert message)
		if (returnData.length < 68) revert BatchError(returnData);

		// solhint-disable-next-line no-inline-assembly
		assembly {
			// Slice the sighash.
			returnData := add(returnData, 0x04)
		}
		revert(abi.decode(returnData, (string))); // All that remains is the revert string
	}
}

// WARNING!!!
// Combining ExodaBatchable with msg.value can cause double spending issues
// https://www.paradigm.xyz/2021/08/two-rights-might-make-a-wrong/
contract ExodaBatchable is BaseExodaBatchable, IExodaBatchable {
	/// @notice Call wrapper that performs `ERC20.permit` on `token`.
	// F6: Parameters can be used front-run the permit and the user's permit will fail (due to nonce or other revert)
	//     if part of a batch this could be used to grief once as the second call would not need the permit
	function permitToken(
		IERC20Permit token,
		address from,
		address to,
		uint256 amount,
		uint256 deadline,
		uint8 v,
		bytes32 r,
		bytes32 s
	) public override {
		token.permit(from, to, amount, deadline, v, r, s);
	}
}
