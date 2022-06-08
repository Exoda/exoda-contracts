// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../utils/Context.sol";

interface IContextMock
{
	function msgData2(address one, uint256 two, uint32 three) external returns (bytes calldata);
	function msgData() external view returns (bytes calldata);
	function msgSender() external view returns (address);
}

// solhint-disable-next-line no-empty-blocks
contract ContextMock is Context, IContextMock
{
	constructor()
	{} // solhint-disable-line no-empty-blocks

	function msgData() override public view returns (bytes calldata)
	{
		return _msgData();
	}

	function msgData2(address one, uint256 two, uint32 three) override public view returns (bytes calldata)
	{
		require(one != address(0), "Mocktest");
		require(two > 0, "Mocktest");
		require(three > 0, "Mocktest");
		return _msgData();
	}

	function msgSender() override public view returns (address)
	{
		return _msgSender();
	}
}