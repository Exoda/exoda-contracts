// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../utils/Context.sol";
import "../interfaces/token/ERC20/IERC20.sol";

interface IERC20ReturnTrueMock {
	function setAllowance(uint256 allowance_) external;
}

contract ERC20ReturnTrueMock is IERC20, IERC20ReturnTrueMock, Context {
	mapping(address => uint256) private _allowances;

	// IERC20's functions are not pure, but these mock implementations are: to prevent Solidity from issuing warnings,
	// we write to a dummy state variable.
	uint256 private _dummy;

	function transfer(address, uint256) public override returns (bool) {
		_dummy = 0;
		return true;
	}

	function transferFrom(
		address,
		address,
		uint256
	) public override returns (bool) {
		_dummy = 0;
		return true;
	}

	function approve(address, uint256) public override returns (bool) {
		_dummy = 0;
		return true;
	}

	function setAllowance(uint256 allowance_) public override {
		_allowances[_msgSender()] = allowance_;
	}

	function allowance(address owner, address)
		public
		view
		override
		returns (uint256)
	{
		return _allowances[owner];
	}

	// solhint-disable-next-line no-unused-vars
	function balanceOf(address account) public view override returns (uint256) {
		// solhint-disable-next-line reason-string
		require(account != address(0));
		// solhint-disable-next-line reason-string
		require(_dummy == 0); // Dummy read from a state variable so that the function is view
		return 0;
	}

	function totalSupply() public view override returns (uint256) {
		// solhint-disable-next-line reason-string
		require(_dummy == 0); // Dummy read from a state variable so that the function is view
		return 0;
	}
}
