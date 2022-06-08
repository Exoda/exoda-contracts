// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../../../interfaces/token/ERC20/extensions/IERC20Burnable.sol";
import "../ERC20.sol";
import "../../../utils/Context.sol";

/**
* @notice Extension of {ERC20} that allows token holders to destroy both their own
* tokens and those that they have an allowance for, in a way that can be
* recognized off-chain (via event analysis).
*/
abstract contract ERC20Burnable is Context, ERC20, IERC20Burnable {
	/**
	* @notice Destroys `amount` tokens from the caller.
	*
	* See {ERC20-_burn}.
	*/
	function burn(uint256 amount) public virtual override
	{
		_burn(_msgSender(), amount);
	}

	/**
	* @notice Destroys `amount` tokens from `account`, deducting from the caller's allowance.
	*
	* See {ERC20-_burn} and {ERC20-allowance}.
	*
	* Requirements:
	* - the caller must have allowance for `account`'s tokens of at least `amount`.
	*/
	function burnFrom(address account, uint256 amount) public virtual override
	{
		_spendAllowance(account, _msgSender(), amount);
		_burn(account, amount);
	}
}
