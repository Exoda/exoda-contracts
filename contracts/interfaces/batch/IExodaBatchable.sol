// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { IERC20Permit } from "../token/ERC20/extensions/IERC20Permit.sol";

interface IBaseExodaBatchable {
	error BatchError(bytes innerError);

	/// @notice Allows batched call to self (this contract).
	/// @param calls An array of inputs for each call.
	/// @param revertOnFail If True then reverts after a failed call and stops doing further calls.
	function batch(bytes[] calldata calls, bool revertOnFail) external payable;
}

// WARNING!!!
// Combining ExodaBatchable with msg.value can cause double spending issues
// https://www.paradigm.xyz/2021/08/two-rights-might-make-a-wrong/
interface IExodaBatchable is IBaseExodaBatchable {
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
    ) external;
}
