// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { IInitContract } from "../interfaces/proxy/IInitContract.sol";

interface IProxyMasterMock
{
	function setValues(uint256 v1, address s2, uint256 v2, bytes memory v3) external;
}

contract ProxyMasterMock is IInitContract, IProxyMasterMock
{
	uint256 public value1;
	mapping(address => uint256) public value2;
	bytes public value3;

	function setValues(uint256 v1, address s2, uint256 v2, bytes memory v3) override external
	{
		value1 = v1;
		value2[s2] = v2;
		value3 = v3;
	}

	function init(bytes calldata data) override external payable 
	{
		value1 = 100;
		value2[msg.sender] = 200;
		value3 = data;
	}
}