// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { IERC20Metadata, ERC20 } from "../ERC20.sol";
import { IERC20 } from "../../../interfaces/token/ERC20/IERC20.sol";

interface ITokenLock is IERC20Metadata
{
	/// Withdraw amount exceeds sender's balance of the locked token
	error ExceedsBalance();
	/// Deposit is not possible anymore because the deposit period is over
	error DepositPeriodOver();
	/// Withdraw is not possible because the lock period is not over yet
	error LockPeriodOngoing();
	/// Could not transfer the designated ERC20 token
	error TransferFailed();
	/// ERC-20 function is not supported
	error NotSupported();

	function token() external view returns(IERC20Metadata);
	function depositDeadline() external view returns(uint256);
	function lockDuration() external view returns(uint256);
}

contract ERC20TimeLock is ERC20, ITokenLock {
	IERC20Metadata private immutable _token;
	uint256 private immutable _depositDeadline;
	uint256 private immutable _lockDuration;
	

	constructor(
		IERC20Metadata initToken,
		uint256 initDepositDeadline,
		uint256 initLockDuration,
		string memory tokenName,
		string memory tokenSymbol)
	ERC20 (tokenName, tokenSymbol)
	{
		_token = initToken;
		_depositDeadline = initDepositDeadline;
		_lockDuration = initLockDuration;
	}

	/// @dev Deposit tokens to be locked until the end of the locking period
	/// @param amount The amount of tokens to deposit
	function deposit(uint256 amount) external {
		if (block.timestamp > _depositDeadline) {
			revert DepositPeriodOver();
		}

		_balances[_msgSender()] += amount;
		_totalSupply += amount;

		if (!_token.transferFrom(_msgSender(), address(this), amount)) {
			revert TransferFailed();
		}

		emit Transfer(_msgSender(), address(this), amount);
	}

	/// @dev Withdraw tokens after the end of the locking period or during the deposit period
	/// @param amount The amount of tokens to withdraw
	function withdraw(uint256 amount) external {
		if (
			block.timestamp > _depositDeadline &&
			block.timestamp < _depositDeadline + _lockDuration
		) {
			revert LockPeriodOngoing();
		}
		if (_balances[_msgSender()] < amount) {
			revert ExceedsBalance();
		}

		_balances[_msgSender()] -= amount;
		_totalSupply -= amount;

		if (!_token.transfer(_msgSender(), amount)) {
			revert TransferFailed();
		}

		emit Transfer(address(this), _msgSender(), amount);
	}

	/// @dev Lock claim tokens are non-transferrable: ERC-20 transfer is not supported
	function transfer(
		address,
		uint256
	) public pure override(ERC20, IERC20) returns (bool) {
		revert NotSupported();
	}

	/// @dev Lock claim tokens are non-transferrable: ERC-20 allowance is not supported
	function allowance(
		address,
		address
	) public pure override(ERC20, IERC20) returns (uint256) {
		revert NotSupported();
	}

	/// @dev Lock claim tokens are non-transferrable: ERC-20 approve is not supported
	function approve(
		address,
		uint256
	) public pure override(ERC20, IERC20) returns (bool) {
		revert NotSupported();
	}

	/// @dev Lock claim tokens are non-transferrable: ERC-20 transferFrom is not supported
	function transferFrom(
		address,
		address,
		uint256
	) public pure override(ERC20, IERC20) returns (bool) {
		revert NotSupported();
	}

	function token() external view override returns (IERC20Metadata) {
		return _token;
	}

	function depositDeadline() external view override returns (uint256) {
		return _depositDeadline;
	}

	function lockDuration() external view override returns (uint256) {
		return _lockDuration;
	}
}
