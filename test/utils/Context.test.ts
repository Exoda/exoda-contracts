/* eslint-disable node/no-unpublished-import */
import { ethers } from "hardhat";
import { expect } from "chai";
import { ContractFactory } from "ethers";
import { keccak256, toUtf8Bytes } from "ethers/lib/utils";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { IContextMock } from "../../typechain-types";

// * Unit tests are grouped in contexts.
// * Ever group represents an derived class or interface.
// * Contexts are named after the imported class or interface.
// * Unit tests covering class specific functionality are put in the context "this".
// * Contexts are ordered alphabetically.
// * Tests are ordered by the function name. After that the order should be "Should emit->Should allow->Should not allow".
describe("Context", () =>
{
	let ContextFactory: ContractFactory;
	let Signers: SignerWithAddress[];
	let Alice: SignerWithAddress;
	let Bob: SignerWithAddress;
	let Context: IContextMock;

	before(async() =>
	{
		ContextFactory = await ethers.getContractFactory("ContextMock");
		Signers = await ethers.getSigners();
		Alice = Signers[0];
		Bob = Signers[1];
	});

	context("this", async() =>
	{
		beforeEach(async() =>
		{
			Context = (await ContextFactory.deploy()) as IContextMock;
			await Context.deployed();
		});

		it("Context.msgData: Should allow to get message data", async() =>
		{
			// Arrange
			const methodId = keccak256(toUtf8Bytes("msgData()")).substring(0, 10);
			const methodId2 = keccak256(toUtf8Bytes("msgData2(address,uint256,uint32)")).substring(0, 10);
			const usedAddress = Bob.address;
			const usedUint256 = 15678431;
			const usedUint32 = 12345;
			const abi = new ethers.utils.AbiCoder();
			const encodedParameters = abi.encode(["address", "uint256", "uint32"], [usedAddress, usedUint256, usedUint32]).substring(2);
			const expectedResult2 = methodId2 + encodedParameters;
			// Act
			const result = await Context.msgData();
			const result2 = await Context.msgData2(usedAddress, usedUint256, usedUint32);
			// Assert
			expect(result).to.equal(methodId);
			expect(result2).to.equal(expectedResult2);
		});

		it("Context.msgSender: Should allow to get message sender", async() =>
		{
			// Arrange
			// Act
			const resultAlice = await Context.msgSender();
			const resultBob = await Context.connect(Bob).msgSender();
			// Assert
			expect(resultAlice).to.equal(Alice.address);
			expect(resultBob).to.equal(Bob.address);
		});
	});
});
