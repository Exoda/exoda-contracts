import { ethers } from "hardhat";
import { expect } from "chai";
import { BigNumber } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { SafeERC20Wrapper } from "../../../../typechain-types";
import { ADDRESS_ZERO } from "../../../helpers";

describe("SafeERC20", () =>
{
	context("this with address that has no contract code", () =>
	{
		let SafeERC20Wrapper: SafeERC20Wrapper;

		before(async () =>
		{
			const signers = await ethers.getSigners();
			const alice = signers[0];
			const safeERC20WrapperFactory = await ethers.getContractFactory("SafeERC20Wrapper");
			SafeERC20Wrapper = await safeERC20WrapperFactory.deploy(alice.address);
		});

		it("SafeERC20.transfer: Should revert on transfer", async () =>
		{
			// Arrange
			// Act
			const result = SafeERC20Wrapper.transfer();
			// Assert
			await expect(result).revertedWith("Address: call to non-contract");
		});

		it("SafeERC20.transferFrom: Should revert on transferFrom", async () =>
		{
			// Arrange
			// Act
			const result = SafeERC20Wrapper.transferFrom();
			// Assert
			await expect(result).revertedWith("Address: call to non-contract");
		});

		it("SafeERC20.approve: Should revert on zero approve", async () =>
		{
			// Arrange
			// Act
			const result = SafeERC20Wrapper.approve(0);
			// Assert
			await expect(result).revertedWith("Address: call to non-contract");
		});

		it("SafeERC20.approve: Should revert on value approve", async () =>
		{
			// Arrange
			// Act
			const result = SafeERC20Wrapper.approve(1);
			// Assert
			await expect(result).revertedWithoutReason();
			// await expect(result).revertedWith("Address: call to non-contract");
		});

		it("SafeERC20.increaseAllowance: Should revert on increaseAllowance", async () =>
		{
			// Arrange
			// Act
			const result = SafeERC20Wrapper.increaseAllowance(0);
			// Assert
			await expect(result).revertedWithoutReason();
			// await expect(result).revertedWith("Address: call to non-contract");
		});

		it("SafeERC20.decreaseAllowance: Should revert on decreaseAllowance", async () =>
		{
			// Arrange
			// Act
			const result = SafeERC20Wrapper.decreaseAllowance(0);
			// Assert
			await expect(result).revertedWithoutReason();
			// await expect(result).revertedWith("Address: call to non-contract");
		});
	});

	context("this with token that returns false on all calls", () =>
	{
		let SafeERC20Wrapper: SafeERC20Wrapper;

		before(async () =>
		{
			const erc20ReturnFalseMockFactory = await ethers.getContractFactory("ERC20ReturnFalseMock");
			const erc20ReturnFalseMock = await erc20ReturnFalseMockFactory.deploy();
			const safeERC20WrapperFactory = await ethers.getContractFactory("SafeERC20Wrapper");
			SafeERC20Wrapper = await safeERC20WrapperFactory.deploy(erc20ReturnFalseMock.address);
		});

		it("SafeERC20.transfer: Should revert on transfer", async () =>
		{
			// Arrange
			// Act
			const result = SafeERC20Wrapper.transfer();
			// Assert
			await expect(result).revertedWith("SafeERC20: ERC20 call failed");
		});

		it("SafeERC20.transferFrom: Should revert on transferFrom", async () =>
		{
			// Arrange
			// Act
			const result = SafeERC20Wrapper.transferFrom();
			// Assert
			await expect(result).revertedWith("SafeERC20: ERC20 call failed");
		});

		it("SafeERC20.approve: Should revert on zero approve", async () =>
		{
			// Arrange
			// Act
			const result = SafeERC20Wrapper.approve(0);
			// Assert
			await expect(result).revertedWith("SafeERC20: ERC20 call failed");
		});

		it("SafeERC20.approve: Should revert on value approve", async () =>
		{
			// Arrange
			// Act
			const result = SafeERC20Wrapper.approve(1);
			// Assert
			await expect(result).revertedWith("SafeERC20: ERC20 call failed");
		});

		it("SafeERC20.increaseAllowance: Should revert on increaseAllowance", async () =>
		{
			// Arrange
			// Act
			const result = SafeERC20Wrapper.increaseAllowance(0);
			// Assert
			await expect(result).revertedWith("SafeERC20: ERC20 call failed");
		});

		it("SafeERC20.decreaseAllowance: Should revert on decreaseAllowance", async () =>
		{
			// Arrange
			// Act
			const result = SafeERC20Wrapper.decreaseAllowance(0);
			// Assert
			await expect(result).revertedWith("SafeERC20: ERC20 call failed");
		});
	});

	context("this with token that returns true on all calls", () =>
	{
		let SafeERC20Wrapper: SafeERC20Wrapper;

		before(async () =>
		{
			const erc20ReturnFactory = await ethers.getContractFactory("ERC20ReturnTrueMock");
			const erc20ReturnMock = await erc20ReturnFactory.deploy();
			const safeERC20WrapperFactory = await ethers.getContractFactory("SafeERC20Wrapper");
			SafeERC20Wrapper = await safeERC20WrapperFactory.deploy(erc20ReturnMock.address);
		});

		it("SafeERC20.transfer: Should not revert on transfer", async () =>
		{
			// Arrange
			// Act
			await SafeERC20Wrapper.transfer();
			// Assert
			// Success if no error
		});

		it("SafeERC20.transferFrom: Should not revert on transferFrom", async () =>
		{
			// Arrange
			// Act
			await SafeERC20Wrapper.transferFrom();
			// Assert
			// Success if no error
		});

		describe("Approvals", () =>
		{
			context("this with zero allowance", () =>
			{
				beforeEach(async () =>
				{
					await SafeERC20Wrapper.setAllowance(0);
				});

				it("SafeERC20.approve: Should not revert when approving a non-zero allowance", async () =>
				{
					// Arrange
					// Act
					await SafeERC20Wrapper.approve(100);
					// Assert
					// Success if no error
				});

				it("SafeERC20.approve: Should not revert when approving a zero allowance", async () =>
				{
					// Arrange
					// Act
					await SafeERC20Wrapper.approve(0);
					// Assert
					// Success if no error
				});

				it("SafeERC20.increaseAllowance: Should not revert when increasing the allowance", async () =>
				{
					// Arrange
					// Act
					await SafeERC20Wrapper.increaseAllowance(10);
					// Assert
					// Success if no error
				});

				it("SafeERC20.approve: Should revert when decreasing the allowance below 0", async () =>
				{
					// Arrange
					// Act
					const result = SafeERC20Wrapper.decreaseAllowance(10);
					// Assert
					await expect(result).revertedWith("SafeERC20: reduced allowance <0");
				});
			});

			context("this with non-zero allowance", () =>
			{
				beforeEach(async () =>
				{
					await SafeERC20Wrapper.setAllowance(100);
				});

				it("SafeERC20.approve: Should revert when approving a non-zero allowance", async () =>
				{
					// Arrange
					// Act
					const result = SafeERC20Wrapper.approve(20);
					// Assert
					await expect(result).revertedWith("SafeERC20: exploitable approve");
				});

				it("SafeERC20.approve: Should not revert when approving a zero allowance", async () =>
				{
					// Arrange
					// Act
					await SafeERC20Wrapper.approve(0);
					// Assert
					// Success if no error
				});

				it("SafeERC20.increaseAllowance: Should not revert when increasing the allowance", async () =>
				{
					// Arrange
					// Act
					await SafeERC20Wrapper.increaseAllowance(10);
					// Assert
					// Success if no error
				});

				it("SafeERC20.decreaseAllowance: Should not revert when decreasing the allowance to a positive value", async () =>
				{
					// Arrange
					// Act
					await SafeERC20Wrapper.decreaseAllowance(50);
					// Assert
					// Success if no error
				});

				it("SafeERC20.decreaseAllowance: Should reverts when decreasing the allowance to a negative value", async () =>
				{
					// Arrange
					// Act
					const result = SafeERC20Wrapper.decreaseAllowance(200);
					// Assert
					await expect(result).revertedWith("SafeERC20: reduced allowance <0");
				});
			});
		});
	});

	context("this with token that returns nothing on all calls", () =>
	{
		let SafeERC20Wrapper: SafeERC20Wrapper;

		before(async () =>
		{
			const erc20ReturnFactory = await ethers.getContractFactory("ERC20NoReturnMock");
			const erc20ReturnMock = await erc20ReturnFactory.deploy();
			const safeERC20WrapperFactory = await ethers.getContractFactory("SafeERC20Wrapper");
			SafeERC20Wrapper = await safeERC20WrapperFactory.deploy(erc20ReturnMock.address);
		});

		it("SafeERC20.transfer: Should not revert on transfer", async () =>
		{
			// Arrange
			// Act
			await SafeERC20Wrapper.transfer();
			// Assert
			// Success if no error
		});

		it("SafeERC20.transferFrom: Should not revert on transferFrom", async () =>
		{
			// Arrange
			// Act
			await SafeERC20Wrapper.transferFrom();
			// Assert
			// Success if no error
		});

		describe("Approvals", () =>
		{
			context("this with zero allowance", () =>
			{
				beforeEach(async () =>
				{
					await SafeERC20Wrapper.setAllowance(0);
				});

				it("SafeERC20.approve: Should not revert when approving a non-zero allowance", async () =>
				{
					// Arrange
					// Act
					await SafeERC20Wrapper.approve(100);
					// Assert
					// Success if no error
				});

				it("SafeERC20.approve: Should not revert when approving a zero allowance", async () =>
				{
					// Arrange
					// Act
					await SafeERC20Wrapper.approve(0);
					// Assert
					// Success if no error
				});

				it("SafeERC20.increaseAllowance: Should not revert when increasing the allowance", async () =>
				{
					// Arrange
					// Act
					await SafeERC20Wrapper.increaseAllowance(10);
					// Assert
					// Success if no error
				});

				it("SafeERC20.approve: Should revert when decreasing the allowance below 0", async () =>
				{
					// Arrange
					// Act
					const result = SafeERC20Wrapper.decreaseAllowance(10);
					// Assert
					await expect(result).revertedWith("SafeERC20: reduced allowance <0");
				});
			});

			context("this with non-zero allowance", () =>
			{
				beforeEach(async () =>
				{
					await SafeERC20Wrapper.setAllowance(100);
				});

				it("SafeERC20.approve: Should revert when approving a non-zero allowance", async () =>
				{
					// Arrange
					// Act
					const result = SafeERC20Wrapper.approve(20);
					// Assert
					await expect(result).revertedWith("SafeERC20: exploitable approve");
				});

				it("SafeERC20.approve: Should not revert when approving a zero allowance", async () =>
				{
					// Arrange
					// Act
					await SafeERC20Wrapper.approve(0);
					// Assert
					// Success if no error
				});

				it("SafeERC20.increaseAllowance: Should not revert when increasing the allowance", async () =>
				{
					// Arrange
					// Act
					await SafeERC20Wrapper.increaseAllowance(10);
					// Assert
					// Success if no error
				});

				it("SafeERC20.decreaseAllowance: Should not revert when decreasing the allowance to a positive value", async () =>
				{
					// Arrange
					// Act
					await SafeERC20Wrapper.decreaseAllowance(50);
					// Assert
					// Success if no error
				});

				it("SafeERC20.decreaseAllowance: Should reverts when decreasing the allowance to a negative value", async () =>
				{
					// Arrange
					// Act
					const result = SafeERC20Wrapper.decreaseAllowance(200);
					// Assert
					await expect(result).revertedWith("SafeERC20: reduced allowance <0");
				});
			});
		});
	});

	context("this with token that returns wrong allowance datatype", () =>
	{
		let SafeERC20Wrapper: SafeERC20Wrapper;
		let Alice: SignerWithAddress;

		before(async () =>
		{
			const signers = await ethers.getSigners();
			Alice = signers[0];
			const erc20ReturnFactory = await ethers.getContractFactory("NonERC20Mock");
			const erc20ReturnMock = await erc20ReturnFactory.deploy();
			const safeERC20WrapperFactory = await ethers.getContractFactory("SafeERC20Wrapper");
			SafeERC20Wrapper = await safeERC20WrapperFactory.deploy(erc20ReturnMock.address);
		});

		it("SafeERC20.transfer: Should revert on allowance", async () =>
		{
			// Arrange
			// Act
			const result = SafeERC20Wrapper.allowance(ADDRESS_ZERO);
			// Assert
			await expect(result).revertedWith("Forced mock error");
		});

		it("SafeERC20.transfer: Should not revert on allowance return type smaller uint256", async () =>
		{
			// Arrange
			// Act
			const result = await SafeERC20Wrapper.allowance(Alice.address);
			// await expect(result).revertedWith("Forced mock error");
			expect(result).to.equal(BigNumber.from(0));
		});
	});
});
