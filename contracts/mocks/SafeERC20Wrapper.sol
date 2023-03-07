// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { Context } from "../utils/Context.sol";
import { IERC20 } from "../interfaces/token/ERC20/IERC20.sol";
import { SafeERC20 } from "../token/ERC20/utils/SafeERC20.sol";
import { ERC20ReturnTrueMock } from "./ERC20ReturnTrueMock.sol";

interface ISafeERC20Wrapper
{
	function transfer() external;
	function transferFrom() external;
	function approve(uint256 amount) external;
	function increaseAllowance(uint256 amount) external;
	function decreaseAllowance(uint256 amount) external;
	function setAllowance(uint256 allowance_) external;
	function allowance(address owner) external view returns (uint256);
}

contract SafeERC20Wrapper is ISafeERC20Wrapper, Context
{
	using SafeERC20 for IERC20;

	IERC20 private _token;

	constructor(IERC20 token) {
		_token = token;
	}

	function transfer() override public
	{
		_token.safeTransfer(address(0), 0);
	}

	function transferFrom() override public
	{
		_token.safeTransferFrom(address(0), address(0), 0);
	}

	function approve(uint256 amount) override public
	{
		_token.safeApprove(address(0), amount);
	}

	function increaseAllowance(uint256 amount) override public
	{
		_token.safeIncreaseAllowance(address(0), amount);
	}

	function decreaseAllowance(uint256 amount) override public
	{
		_token.safeDecreaseAllowance(address(0), amount);
	}

	function setAllowance(uint256 allowance_) override public
	{
		ERC20ReturnTrueMock(address(_token)).setAllowance(allowance_);
	}

	function allowance(address owner) override public view returns (uint256)
	{
		return _token.allowance(owner, address(0));
	}
}