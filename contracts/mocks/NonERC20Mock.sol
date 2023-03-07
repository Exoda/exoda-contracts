// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface INonERC20Mock
{
	function approve(address spender, uint256 amount) external returns (bool);
	function allowance(address owner, address spender) external view returns (uint128);
}

contract NonERC20Mock is INonERC20Mock
{
	function approve(address spender, uint256 amount) external pure override returns (bool)
	{
		require(spender == address(0) && amount == 0, "Forced mock error");
		return true;
	}

	function allowance(address owner, address spender) external pure override returns (uint128)
	{
		require(owner != address(0) && spender == address(0), "Forced mock error");
		return 0;
	}
}