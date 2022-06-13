// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../utils/Address.sol";
import "../interfaces/token/ERC20/IERC20.sol";

interface IAddressMock
{
	event CallReturnValue(string data);

	receive() external payable;
	function functionCall(address target, bytes memory data) external;
	function functionCall(address target, bytes memory data, string memory errorMessage) external;
	function functionCallWithValue(address target, bytes memory data, uint256 value) external payable;
	function functionCallWithValue(address target, bytes memory data, uint256 value, string memory errorMessage) external payable;
	function isContract(address account) external view returns (bool);
}

contract AddressMock is IAddressMock
{
	// sendValue's tests require the contract to hold Ether
	receive() override external payable
	{} //solhint-disable-line no-empty-blocks

	function functionCall(address target, bytes memory data) override public
	{
		bytes memory returnData = Address.functionCall(target, data);
		emit CallReturnValue(abi.decode(returnData, (string)));
	}

	function functionCall(address target, bytes memory data, string memory errorMessage) override public
	{
		bytes memory returnData = Address.functionCall(target, data, errorMessage);
		emit CallReturnValue(abi.decode(returnData, (string)));
	}

	function functionCallWithValue(address target, bytes memory data, uint256 value) override public payable
	{
		bytes memory returnData = Address.functionCallWithValue(target, data, value);
		emit CallReturnValue(abi.decode(returnData, (string)));
	}

	function functionCallWithValue(address target, bytes memory data, uint256 value, string memory errorMessage) override public payable
	{
		bytes memory returnData = Address.functionCallWithValue(target, data, value, errorMessage);
		emit CallReturnValue(abi.decode(returnData, (string)));
	}

	function isContract(address account) override public view returns (bool)
	{
		return Address.isContract(account);
	}
}