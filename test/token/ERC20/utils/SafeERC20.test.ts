/* eslint-disable node/no-unpublished-import */
import { ethers } from "hardhat";
import { expect } from "chai";
import { BigNumber, Contract, ContractFactory } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ERC20NoReturnMock, ERC20ReturnFalseMock, ERC20ReturnTrueMock, ISafeERC20Wrapper } from "../../../../typechain-types";

describe("SafeERC20", () =>
{
	let ERC20ReturnFalseMockFactory: ContractFactory;
	let ERC20ReturnTrueMockFactory: ContractFactory;
	let ERC20NoReturnMockFactory: ContractFactory;
	let SafeERC20WrapperFactory: ContractFactory;
	let Signers: SignerWithAddress[];
	let Alice: SignerWithAddress;
	let Contract: Contract;
	// Only Mock methods needs to be available everywhere.
	const SafeERC20Wrapper = () => Contract as ISafeERC20Wrapper;
	// Helper mocks no need to enforce usage of interface here
	let ERC20ReturnFalseMock: ERC20ReturnFalseMock;
	let ERC20ReturnTrueMock: ERC20ReturnTrueMock;
	let ERC20NoReturnMock: ERC20NoReturnMock;

	before(async () =>
	{
		ERC20ReturnFalseMockFactory = await ethers.getContractFactory("ERC20ReturnFalseMock");
		ERC20ReturnTrueMockFactory = await ethers.getContractFactory("ERC20ReturnTrueMock");
		ERC20NoReturnMockFactory = await ethers.getContractFactory("ERC20NoReturnMock");
		SafeERC20WrapperFactory = await ethers.getContractFactory("SafeERC20Wrapper");
		ERC20NoReturnMock = (await ERC20NoReturnMockFactory.deploy()) as ERC20NoReturnMock;
		ERC20ReturnTrueMock = (await ERC20ReturnTrueMockFactory.deploy()) as ERC20ReturnTrueMock;
		ERC20ReturnFalseMock = (await ERC20ReturnFalseMockFactory.deploy()) as ERC20ReturnFalseMock;
		await ERC20NoReturnMock.deployed();
		await ERC20ReturnTrueMock.deployed();
		await ERC20ReturnFalseMock.deployed();
		Signers = await ethers.getSigners();
		Alice = Signers[0];
	});

	context("with address that has no contract code", async () =>
	{
		beforeEach(async () =>
		{
			Contract = await SafeERC20WrapperFactory.deploy(Alice.address);
			await Contract.deployed();
		});

		ShouldRevertOnAllCalls("Address: call to non-contract");
	});

	context("with token that returns false on all calls", async () =>
	{
		beforeEach(async () =>
		{
			Contract = await SafeERC20WrapperFactory.deploy(ERC20ReturnFalseMock.address);
			await Contract.deployed();
		});

		ShouldRevertOnAllCalls("SafeERC20: ERC20 call failed");
	});

	context("with token that returns true on all calls", async () =>
	{
		beforeEach(async () =>
		{
			Contract = await SafeERC20WrapperFactory.deploy(ERC20ReturnTrueMock.address);
			await Contract.deployed();
		});

		ShouldOnlyRevertOnErrors();
	});

	function ShouldOnlyRevertOnErrors()
	{
		it("Should not revert on transfer", async function ()
		{
			await SafeERC20Wrapper().transfer();
		});

		it("doesn't revert on transferFrom", async function ()
		{
			await SafeERC20Wrapper().transferFrom();
		});

		describe("approvals", function ()
		{
			context("with zero allowance", function ()
			{
				beforeEach(async function ()
				{
					await SafeERC20Wrapper().setAllowance(0);
				});

				it("doesn't revert when approving a non-zero allowance", async function ()
				{
					await SafeERC20Wrapper().approve(100);
				});

				it("doesn't revert when approving a zero allowance", async function ()
				{
					await SafeERC20Wrapper().approve(0);
				});

				it("doesn't revert when increasing the allowance", async function ()
				{
					await SafeERC20Wrapper().increaseAllowance(10);
				});

				it("reverts when decreasing the allowance", async function ()
				{
					await expect(SafeERC20Wrapper().decreaseAllowance(10)).revertedWith("SafeERC20: reduced allowance <0");
				});
			});

			context("with non-zero allowance", function ()
			{
				beforeEach(async function ()
				{
					await SafeERC20Wrapper().setAllowance(100);
				});

				it("reverts when approving a non-zero allowance", async function ()
				{
					await expect(SafeERC20Wrapper().approve(20)).revertedWith("SafeERC20: exploitable approve");
				});

				it("doesn't revert when approving a zero allowance", async function ()
				{
					await SafeERC20Wrapper().approve(0);
				});

				it("doesn't revert when increasing the allowance", async function ()
				{
					await SafeERC20Wrapper().increaseAllowance(10);
				});

				it("doesn't revert when decreasing the allowance to a positive value", async function ()
				{
					await SafeERC20Wrapper().decreaseAllowance(50);
				});

				it("reverts when decreasing the allowance to a negative value", async function ()
				{
					await expect(SafeERC20Wrapper().decreaseAllowance(200)).revertedWith("SafeERC20: reduced allowance <0");
				});
			});
		});
	}

	function ShouldRevertOnAllCalls(reason: string)
	{
		it("Should revert on transfer", async function ()
		{
			await expect(SafeERC20Wrapper().transfer()).revertedWith(reason);
		});

		it("Should revert on transferFrom", async function ()
		{
			await expect(SafeERC20Wrapper().transferFrom()).revertedWith(reason);
		});

		it("Should revert on approve", async function ()
		{
			await expect(SafeERC20Wrapper().approve(0)).revertedWith(reason);
		});

		it("Should revert on increaseAllowance", async function ()
		{
			// [TODO] make sure it's reverting for the right reason
			// await expect(SafeERC20Wrapper().increaseAllowance(0)).revertedWith(reason);
			await expect(SafeERC20Wrapper().increaseAllowance(0)).to.be.reverted;
		});

		it("Should revert on decreaseAllowance", async function ()
		{
			// [TODO] make sure it's reverting for the right reason
			// await expect(SafeERC20Wrapper().decreaseAllowance(0)).revertedWith(reason);
			await expect(SafeERC20Wrapper().decreaseAllowance(0)).to.be.reverted;
		});
	}
});
