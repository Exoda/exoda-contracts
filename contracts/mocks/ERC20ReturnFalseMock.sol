// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { Context } from "../utils/Context.sol";
import { IERC20 } from "../interfaces/token/ERC20/IERC20.sol";

contract ERC20ReturnFalseMock is IERC20, Context
{
	uint256 private _allowance;

	// IERC20's functions are not pure, but these mock implementations are: to prevent Solidity from issuing warnings,
	// we write to a dummy state variable.
	uint256 private _dummy;

	function transfer(address, uint256) override public returns (bool)
	{
		_dummy = 0;
		return false;
	}

	function transferFrom(
		address,
		address,
		uint256
	) override public returns (bool)
	{
		_dummy = 0;
		return false;
	}

	function approve(address, uint256) override public returns (bool)
	{
		_dummy = 0;
		return false;
	}

	function allowance(address, address) override public view returns (uint256)
	{
		// solhint-disable-next-line reason-string
		require(_dummy == 0); // Dummy read from a state variable so that the function is view
		return 0;
	}

	// solhint-disable-next-line no-unused-vars
	function balanceOf(address account) override public view returns (uint256)
	{
		// solhint-disable-next-line reason-string
		require(account != address(0));
		// solhint-disable-next-line reason-string
		require(_dummy == 0); // Dummy read from a state variable so that the function is view
		return 0;
	}

	function totalSupply() override public view returns (uint256)
	{
		// solhint-disable-next-line reason-string
		require(_dummy == 0); // Dummy read from a state variable so that the function is view
		return 0;
	}
}