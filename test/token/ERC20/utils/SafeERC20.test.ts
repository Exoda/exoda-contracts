/* eslint-disable node/no-unpublished-import */
import { ethers } from "hardhat";
import { expect } from "chai";
import { Contract, ContractFactory } from "ethers";
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

	context("this with address that has no contract code", async () =>
	{
		beforeEach(async () =>
		{
			Contract = await SafeERC20WrapperFactory.deploy(Alice.address);
			await Contract.deployed();
		});

		ShouldRevertOnAllCalls("Address: call to non-contract");
	});

	context("this with token that returns false on all calls", async () =>
	{
		beforeEach(async () =>
		{
			Contract = await SafeERC20WrapperFactory.deploy(ERC20ReturnFalseMock.address);
			await Contract.deployed();
		});

		ShouldRevertOnAllCalls("SafeERC20: ERC20 call failed");
	});

	context("this with token that returns true on all calls", async () =>
	{
		beforeEach(async () =>
		{
			Contract = await SafeERC20WrapperFactory.deploy(ERC20ReturnTrueMock.address);
			await Contract.deployed();
		});

		ShouldOnlyRevertOnErrors();
	});

	context("this with token that returns nothing on all calls", async () =>
	{
		beforeEach(async () =>
		{
			Contract = await SafeERC20WrapperFactory.deploy(ERC20NoReturnMock.address);
			await Contract.deployed();
		});

		ShouldOnlyRevertOnErrors();
	});

	function ShouldOnlyRevertOnErrors()
	{
		it("SafeERC20.transfer: Should not revert on transfer", async function ()
		{
			await SafeERC20Wrapper().transfer();
		});

		it("SafeERC20.transferFrom: Should not revert on transferFrom", async function ()
		{
			await SafeERC20Wrapper().transferFrom();
		});

		describe("Approvals", function ()
		{
			context("this with zero allowance", function ()
			{
				beforeEach(async function ()
				{
					await SafeERC20Wrapper().setAllowance(0);
				});

				it("SafeERC20.approve: Should not revert when approving a non-zero allowance", async function ()
				{
					await SafeERC20Wrapper().approve(100);
				});

				it("SafeERC20.approve: Should not revert when approving a zero allowance", async function ()
				{
					await SafeERC20Wrapper().approve(0);
				});

				it("SafeERC20.increaseAllowance: Should not revert when increasing the allowance", async function ()
				{
					await SafeERC20Wrapper().increaseAllowance(10);
				});

				it("SafeERC20.approve: Should revert when decreasing the allowance below 0", async function ()
				{
					await expect(SafeERC20Wrapper().decreaseAllowance(10)).revertedWith("SafeERC20: reduced allowance <0");
				});
			});

			context("this with non-zero allowance", function ()
			{
				beforeEach(async function ()
				{
					await SafeERC20Wrapper().setAllowance(100);
				});

				it("SafeERC20.approve: Should revert when approving a non-zero allowance", async function ()
				{
					await expect(SafeERC20Wrapper().approve(20)).revertedWith("SafeERC20: exploitable approve");
				});

				it("SafeERC20.approve: Should not revert when approving a zero allowance", async function ()
				{
					await SafeERC20Wrapper().approve(0);
				});

				it("SafeERC20.increaseAllowance: Should not revert when increasing the allowance", async function ()
				{
					await SafeERC20Wrapper().increaseAllowance(10);
				});

				it("SafeERC20.decreaseAllowance: Should not revert when decreasing the allowance to a positive value", async function ()
				{
					await SafeERC20Wrapper().decreaseAllowance(50);
				});

				it("SafeERC20.decreaseAllowance: Should reverts when decreasing the allowance to a negative value", async function ()
				{
					await expect(SafeERC20Wrapper().decreaseAllowance(200)).revertedWith("SafeERC20: reduced allowance <0");
				});
			});
		});
	}

	function ShouldRevertOnAllCalls(reason: string)
	{
		it("SafeERC20.transfer: Should revert on transfer", async function ()
		{
			await expect(SafeERC20Wrapper().transfer()).revertedWith(reason);
		});

		it("SafeERC20.transferFrom: Should revert on transferFrom", async function ()
		{
			await expect(SafeERC20Wrapper().transferFrom()).revertedWith(reason);
		});

		it("SafeERC20.approve: Should revert on approve", async function ()
		{
			await expect(SafeERC20Wrapper().approve(0)).revertedWith(reason);
		});

		it("SafeERC20.increaseAllowance: Should revert on increaseAllowance", async function ()
		{
			if (reason.startsWith("Address"))
			{
				await expect(SafeERC20Wrapper().increaseAllowance(0)).revertedWith("Transaction reverted: function returned an unexpected amount of data");
			}
			else
			{
				await expect(SafeERC20Wrapper().increaseAllowance(0)).revertedWith(reason);
			}
		});

		it("SafeERC20.decreaseAllowance: Should revert on decreaseAllowance", async function ()
		{
			if (reason.startsWith("Address"))
			{
				await expect(SafeERC20Wrapper().decreaseAllowance(0)).revertedWith("Transaction reverted: function returned an unexpected amount of data");
			}
			else
			{
				await expect(SafeERC20Wrapper().decreaseAllowance(0)).revertedWith(reason);
			}
		});
	}
});
