// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface ICallReceiverMock
{
	function mockFunction() external payable returns (string memory);
	function mockFunctionWithArgs(uint256 a, uint256 b) external payable returns (string memory);
	function mockFunctionNonPayable() external returns (string memory);
	function mockFunctionRevertsNoReason() external payable;
	function mockFunctionRevertsReason() external payable;
	function mockFunctionThrows() external payable;
	function mockFunctionOutOfGas() external payable;
	function mockFunctionWritesStorage() external returns (string memory);
	function mockStaticFunction() external pure returns (string memory);
}

contract CallReceiverMock is ICallReceiverMock
{
	string public sharedAnswer;
	uint256[] private _array;

	event MockFunctionCalled();
	event MockFunctionCalledWithArgs(uint256 a, uint256 b);

	function mockFunction() override public payable returns (string memory)
	{
		emit MockFunctionCalled();
		return "0x1234";
	}

	function mockFunctionWithArgs(uint256 a, uint256 b) override public payable returns (string memory)
	{
		emit MockFunctionCalledWithArgs(a, b);
		return "0x1234";
	}

	function mockFunctionNonPayable() override public returns (string memory)
	{
		emit MockFunctionCalled();
		return "0x1234";
	}

	function mockFunctionRevertsNoReason() override public payable
	{
		revert(); //solhint-disable-line reason-string
	}

	function mockFunctionRevertsReason() override public payable
	{
		revert("CallReceiverMock: reverting");
	}

	function mockFunctionThrows() override public payable
	{
		assert(false);
	}

	function mockFunctionOutOfGas() override public payable
	{
		for (uint256 i = 0; ; ++i) {
			_array.push(i);
		}
	}

	function mockFunctionWritesStorage() override public returns (string memory)
	{
		sharedAnswer = "42";
		return "0x1234";
	}

	function mockStaticFunction() override public pure returns (string memory)
	{
		return "0x1234";
	}
}
