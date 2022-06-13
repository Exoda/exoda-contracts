// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../utils/Context.sol";

interface IERC20NoReturnMock
{
	function transfer(address, uint256) external;
	function transferFrom(address, address, uint256) external;
	function approve(address, uint256) external;
	function setAllowance(uint256 allowance_) external;
	function allowance(address owner, address) external view returns (uint256);
	function balanceOf(address account) external view returns (uint256);
	function totalSupply() external view returns (uint256);
}

contract ERC20NoReturnMock is IERC20NoReturnMock, Context
{
	mapping(address => uint256) private _allowances;

	// IERC20's functions are not pure, but these mock implementations are: to prevent Solidity from issuing warnings,
	// we write to a dummy state variable.
	uint256 private _dummy;

	function transfer(address, uint256) override public
	{
		_dummy = 0;
	}

	function transferFrom(
		address,
		address,
		uint256
	) override public
	{
		_dummy = 0;
	}

	function approve(address, uint256) override public
	{
		_dummy = 0;
	}

	function setAllowance(uint256 allowance_) override public {
		_allowances[_msgSender()] = allowance_;
	}

	function allowance(address owner, address) override public view returns (uint256)
	{
		 return _allowances[owner];
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