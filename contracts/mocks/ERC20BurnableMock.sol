// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../interfaces/token/ERC20/extensions/IERC20Burnable.sol";
import "../token/ERC20/extensions/ERC20Burnable.sol";

interface IERC20BurnableMock is IERC20Burnable
{
	function mockMint(address to, uint256 amount) external;
}

// solhint-disable-next-line no-empty-blocks
contract ERC20BurnableMock is ERC20Burnable, IERC20BurnableMock
{
	constructor(string memory name, string memory symbol) ERC20Burnable(name, symbol)
	{} // solhint-disable-line no-empty-blocks

	/// @notice Creates `amount` token to `to`.
	function mockMint(address to, uint256 amount) override public
	{
		_mint(to, amount);
	}
}