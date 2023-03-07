// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import { IExodaFactory } from "../interfaces/proxy/IExodaFactory.sol";
import { IInitContract } from "../interfaces/proxy/IInitContract.sol";

// solhint-disable no-inline-assembly
contract ExodaFactory is IExodaFactory {
	mapping(IInitContract => IInitContract) private _masterContractOf;
	mapping(IInitContract => IInitContract[]) private _clonesOf;

	/// @inheritdoc IExodaFactory
	function deploy(
		IInitContract master,
		bytes calldata data,
		bool useCreate2
	) override external payable returns (IInitContract cloneAddress) {
		require(address(master) != address(0), "ExodaFactory: No master contract");
		bytes20 targetBytes = bytes20(address(master)); // Takes the first 20 bytes of the master's address

		if (useCreate2) {
			// each master has different code already. So clones are distinguished by their data only.
			bytes32 salt = keccak256(data);

			// Creates clone, more info here: https://blog.openzeppelin.com/deep-dive-into-the-minimal-proxy-contract/
			assembly {
				let clone := mload(0x40)
				mstore(
					clone,
					0x3d602d80600a3d3981f3363d3d373d3d3d363d73000000000000000000000000
				)
				mstore(add(clone, 0x14), targetBytes)
				mstore(
					add(clone, 0x28),
					0x5af43d82803e903d91602b57fd5bf30000000000000000000000000000000000
				)
				cloneAddress := create2(0, clone, 0x37, salt)
			}
		} else {
			assembly {
				let clone := mload(0x40)
				mstore(
					clone,
					0x3d602d80600a3d3981f3363d3d373d3d3d363d73000000000000000000000000
				)
				mstore(add(clone, 0x14), targetBytes)
				mstore(
					add(clone, 0x28),
					0x5af43d82803e903d91602b57fd5bf30000000000000000000000000000000000
				)
				cloneAddress := create(0, clone, 0x37)
			}
		}
		_masterContractOf[cloneAddress] = master;
		_clonesOf[master].push(cloneAddress);

		cloneAddress.init{value: msg.value}(data);

		emit LogDeploy(master, data, cloneAddress);
	}

	/// @inheritdoc IExodaFactory
	function clonesOf(IInitContract master) override external view returns (IInitContract[] memory) {
		return _clonesOf[master];
	}

	/// @inheritdoc IExodaFactory
	function clonesOfCount(IInitContract master) override external view returns (uint256) {
		return _clonesOf[master].length;
	}

	/// @inheritdoc IExodaFactory
	function masterOf(IInitContract clone) override external view returns (IInitContract) {
		return _masterContractOf[clone];
	}
}
