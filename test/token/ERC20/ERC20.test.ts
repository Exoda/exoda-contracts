/* eslint-disable node/no-unpublished-import */
import { ethers } from "hardhat";
import { expect } from "chai";
import { BigNumber, Contract, ContractFactory } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ADDRESS_ZERO, AdvanceBlock, EmitOnlyThis, StartAutomine, StopAutomine } from "../../helpers";
import { IERC20, IERC20Metadata, IERC20Mock, IERC20AltApprove } from "../../../typechain-types";

// * Unit tests are grouped in contexts.
// * Ever group represents an derived class or interface.
// * Contexts are named after the imported class or interface.
// * Unit tests covering class specific functionality are put in the context "this".
// * Contexts are ordered alphabetically.
// * Tests are ordered by the function name. After that the order should be "Should emit->Should allow/return->Should not allow".

describe("ERC20", () =>
{
	let ERC20Factory: ContractFactory;
	let Signers: SignerWithAddress[];
	let Alice: SignerWithAddress;
	let Bob: SignerWithAddress;
	let Carol: SignerWithAddress;
	let Contract: Contract;
	// Only Mock methods needs to be available everywhere.
	const ERC20Mock = () => Contract as IERC20Mock;

	before(async () =>
	{
		ERC20Factory = await ethers.getContractFactory("ERC20Mock");
		Signers = await ethers.getSigners();
		Alice = Signers[0];
		Bob = Signers[1];
		Carol = Signers[2];
	});

	context("this", async () =>
	{
		const ERC20 = () => Contract as IERC20;

		beforeEach(async () =>
		{
			Contract = await ERC20Factory.deploy("Name", "SYM");
			await Contract.deployed();
		});

		it("ERC20.constructor: Should emit nothing", async () =>
		{
			// NOTICE: We use the original Contract for this in case the mock does modify the constructor
			// and for the contract to show up in the Deployments section of `npm run test:gas`.
			// Arrange
			const factory = await ethers.getContractFactory("ERC20");
			const originalContract = await factory.deploy("Original", "OOO");
			await originalContract.deployed();
			// Act
			const result = originalContract.deployTransaction;
			// Assert
			await EmitOnlyThis(result, originalContract);
		});

		it("ERC20._approve: Should not allow set of approval to zero address", async () =>
		{
			// Arrange
			// Act
			const result = ERC20().approve(ADDRESS_ZERO, 10);
			// Assert
			await expect(result).to.be.revertedWith("ERC20: approve to address(0)");
		});

		it("ERC20._approve: Should not allow set of approval from zero address", async () =>
		{
			// Arrange
			// Act
			const result = ERC20Mock().mockApproveFromZeroAddress(Alice.address, 10);
			// Assert
			await expect(result).to.be.revertedWith("ERC20: approve from address(0)");
		});

		// This is just to prove that the mocked _burn function is working.
		it("ERC20._burn: Should allow burn of tokens", async () =>
		{
			// Arrange
			await ERC20Mock().mockMint(Alice.address, "100");
			// Act
			const result = await ERC20Mock().mockBurn(Alice.address, "10");
			// Assert
			await expect(result).to.emit(Contract, "Transfer(address,address,uint256)").withArgs(Alice.address, ADDRESS_ZERO, 10);
			await EmitOnlyThis(result, Contract, "Transfer(address,address,uint256)");
			expect(await ERC20().totalSupply()).to.equal(90);
			expect(await ERC20().balanceOf(Alice.address)).to.equal(90);
		});

		// This is just to prove that the mocked _burn function is working.
		it("ERC20._burn: Should not allow burn of zero address", async () =>
		{
			// Arrange
			// Act
			const result = ERC20Mock().mockBurn(ADDRESS_ZERO, "1");
			// Assert
			await expect(result).to.be.revertedWith("ERC20: burn from address(0)");
		});

		// This is just to prove that the mocked _burn function is working.
		it("ERC20._burn: Should not allow burn more tokens than owned", async () =>
		{
			// Arrange
			await ERC20Mock().mockMint(Alice.address, "100");
			// Act
			const result = ERC20Mock().mockBurn(Alice.address, "101");
			// Assert
			await expect(result).to.be.revertedWith("ERC20: burn exceeds balance");
		});

		// This is just to prove that the mocked _mint function is working.
		it("ERC20._mint: Should allow mint of tokens", async () =>
		{
			// Arrange
			// Act
			const result = await ERC20Mock().mockMint(Alice.address, "1");
			// Assert
			await expect(result).to.emit(Contract, "Transfer(address,address,uint256)").withArgs(ADDRESS_ZERO, Alice.address, 1);
			await EmitOnlyThis(result, Contract, "Transfer(address,address,uint256)");
			expect(await ERC20().totalSupply()).to.equal(1);
			expect(await ERC20().balanceOf(Alice.address)).to.equal(1);
		});

		// This is just to prove that the mocked _mint function is working.
		it("ERC20._mint: Should not allow mint on zero address", async () =>
		{
			// Arrange
			// Act
			const result = ERC20Mock().mockMint(ADDRESS_ZERO, "1");
			// Assert
			await expect(result).to.be.revertedWith("ERC20: mint to address(0)");
		});

		it("ERC20._transfer: Should not allow transfer to zero address", async () =>
		{
			// Arrange
			await ERC20Mock().mockMint(Alice.address, "100");
			// Act
			const result = ERC20().transfer(ADDRESS_ZERO, "10");
			// Assert
			await expect(result).to.be.revertedWith("ERC20: transfer to address(0)");
		});

		it("ERC20._transfer: Should not allow transfer from zero address", async () =>
		{
			// Arrange
			await ERC20Mock().mockMint(Alice.address, "100");
			// Act
			const result = ERC20Mock().mockTransferFromZeroAddress(Alice.address, "10");
			// Assert
			await expect(result).to.be.revertedWith("ERC20: transfer from address(0)");
		});

		it("ERC20.approve: Should emit `Approval` event", async () =>
		{
			// Arrange
			await ERC20Mock().mockMint(Alice.address, 100);
			// Act
			const result = await ERC20().approve(Bob.address, 10);
			// Assert
			await expect(result).to.emit(Contract, "Approval(address,address,uint256)").withArgs(Alice.address, Bob.address, 10);
			await EmitOnlyThis(result, Contract, "Approval(address,address,uint256)");
		});

		it("ERC20.approve: Should allow set of approval", async () =>
		{
			// Arrange
			await ERC20Mock().mockMint(Alice.address, 100);
			// Act
			const result = await ERC20().approve(Bob.address, 10);
			// Assert
			const approved = await ERC20().allowance(Alice.address, Bob.address);
			expect(approved.toString()).to.equal("10");
			await expect(result).to.emit(Contract, "Approval(address,address,uint256)").withArgs(Alice.address, Bob.address, 10);
			await EmitOnlyThis(result, Contract, "Approval(address,address,uint256)");
		});

		it("ERC20.approve: Proof of unfixable approve/transferFrom attack vector", async () =>
		{
			await ERC20Mock().mockMint(Alice.address, 100);
			await ERC20().approve(Bob.address, 50);
			await StopAutomine();
			// What happens is that Alice is changing the approved tokens from 50 to 30.
			// Bob notice this before the Transaction of Alice is confirmed and added his on transferFrom transaction.
			// The attack is successfull if the transferFrom transaction is confirmed before the approve transaction or
			// if confirmed in the same block the transferFrom transaction is processed first.
			// We simulate that second case.
			await ERC20().connect(Bob).transferFrom(Alice.address, Bob.address, 50);
			await ERC20().approve(Bob.address, 30);
			await AdvanceBlock();
			// The Damange is now done. There is no way to prevent this inside the approve method.
			await StartAutomine();
			await ERC20().connect(Bob).transferFrom(Alice.address, Bob.address, 30);

			expect(await ERC20().balanceOf(Alice.address)).to.equal(20);
			expect(await ERC20().balanceOf(Bob.address)).to.equal(80);
		});

		it("ERC20.transfer: Should emit `Transfer` event", async () =>
		{
			// Arrange
			await ERC20Mock().mockMint(Alice.address, "100");
			// Act
			const result = await ERC20().transfer(Carol.address, "10");
			// Assert
			await expect(result).to.emit(Contract, "Transfer(address,address,uint256)").withArgs(Alice.address, Carol.address, 10);
			await EmitOnlyThis(result, Contract, "Transfer(address,address,uint256)");
		});

		it("ERC20.transfer: Should allow token transfer", async () =>
		{
			// Arrange
			await ERC20Mock().mockMint(Alice.address, "100");
			// Act
			const result = await ERC20().transfer(Carol.address, "10");
			// Assert
			const totalSupply = await ERC20().totalSupply();
			const aliceBal = await ERC20().balanceOf(Alice.address);
			const carolBal = await ERC20().balanceOf(Carol.address);
			expect(totalSupply.toString()).to.equal("100");
			expect(aliceBal.toString()).to.equal("90");
			expect(carolBal.toString()).to.equal("10");
			await EmitOnlyThis(result, Contract, "Transfer(address,address,uint256)");
		});

		it("ERC20.transfer: Should not allow transfer more than balance", async () =>
		{
			// Arrange
			await ERC20Mock().mockMint(Alice.address, "100");
			// Act
			const result = ERC20().transfer(Carol.address, "110");
			// Assert
			await expect(result).to.be.revertedWith("ERC20: transfer exceeds balance");
			const aliceBal = await ERC20().balanceOf(Alice.address);
			const carolBal = await ERC20().balanceOf(Carol.address);
			expect(aliceBal.toString()).to.equal("100");
			expect(carolBal.toString()).to.equal("0");
		});

		it("ERC20.transferFrom: Should emit `Transfer` and `Approval` event", async () =>
		{
			// Arrange
			await ERC20Mock().mockMint(Alice.address, 100);
			await ERC20().approve(Bob.address, 50);
			// Act
			const result = await ERC20().connect(Bob).transferFrom(Alice.address, Carol.address, 10);
			// Assert
			await expect(result).to.emit(Contract, "Approval(address,address,uint256)").withArgs(Alice.address, Bob.address, 40);
			await expect(result).to.emit(Contract, "Transfer(address,address,uint256)").withArgs(Alice.address, Carol.address, 10);
			await EmitOnlyThis(result, Contract, "Approval(address,address,uint256)", "Transfer(address,address,uint256)");
		});

		it("ERC20.transferFrom: Should allow token transfer and reduce allowance", async () =>
		{
			// Arrange
			await ERC20Mock().mockMint(Alice.address, "100");
			await ERC20().approve(Bob.address, 50);
			// Act
			const result = await ERC20().connect(Bob).transferFrom(Alice.address, Carol.address, 10);
			// Assert
			const totalSupply = await ERC20().totalSupply();
			const aliceBal = await ERC20().balanceOf(Alice.address);
			const carolBal = await ERC20().balanceOf(Carol.address);
			const allowance = await ERC20().allowance(Alice.address, Bob.address);
			expect(totalSupply.toString()).to.equal("100");
			expect(aliceBal.toString()).to.equal("90");
			expect(carolBal.toString()).to.equal("10");
			expect(allowance.toString()).to.equal("40");
			await expect(result).to.emit(Contract, "Approval(address,address,uint256)").withArgs(Alice.address, Bob.address, 40);
			await expect(result).to.emit(Contract, "Transfer(address,address,uint256)").withArgs(Alice.address, Carol.address, 10);
			await EmitOnlyThis(result, Contract, "Approval(address,address,uint256)", "Transfer(address,address,uint256)");
		});

		it("ERC20.transferFrom: Should allow token transfer and not reduce infinite allowance", async () =>
		{
			// Arrange
			const max: BigNumber = BigNumber.from(2).pow(256).sub(1);
			await ERC20Mock().mockMint(Alice.address, "100");
			await ERC20().approve(Bob.address, max);
			// Act
			const result = await ERC20().connect(Bob).transferFrom(Alice.address, Carol.address, 10);
			// Assert
			const totalSupply = await ERC20().totalSupply();
			const aliceBal = await ERC20().balanceOf(Alice.address);
			const carolBal = await ERC20().balanceOf(Carol.address);
			const allowance = await ERC20().allowance(Alice.address, Bob.address);
			expect(totalSupply.toString()).to.equal("100");
			expect(aliceBal.toString()).to.equal("90");
			expect(carolBal.toString()).to.equal("10");
			expect(allowance).to.equal(max);
			await expect(result).to.emit(Contract, "Transfer(address,address,uint256)").withArgs(Alice.address, Carol.address, 10);
			await EmitOnlyThis(result, Contract, "Transfer(address,address,uint256)");
		});

		it("ERC20.transferFrom: Should not allow transfer more than balance", async () =>
		{
			// Arrange
			await ERC20Mock().mockMint(Alice.address, "100");
			await ERC20().approve(Bob.address, 200);
			// Act
			const result = ERC20().connect(Bob).transferFrom(Alice.address, Carol.address, 110);
			// Assert
			await expect(result).to.be.revertedWith("ERC20: transfer exceeds balance");
			const aliceBal = await ERC20().balanceOf(Alice.address);
			const carolBal = await ERC20().balanceOf(Carol.address);
			const allowance = await ERC20().allowance(Alice.address, Bob.address);
			expect(aliceBal.toString()).to.equal("100");
			expect(carolBal.toString()).to.equal("0");
			expect(allowance.toString()).to.equal("200");
		});

		it("ERC20.transferFrom: Should not allow transfer more than allowance", async () =>
		{
			// Arrange
			await ERC20Mock().mockMint(Alice.address, 100);
			await ERC20().approve(Bob.address, 90);
			// Act
			const result = ERC20().connect(Bob).transferFrom(Alice.address, Carol.address, 100);
			// Assert
			await expect(result).to.be.revertedWith("ERC20: insufficient allowance");
			const aliceBal = await ERC20().balanceOf(Alice.address);
			const carolBal = await ERC20().balanceOf(Carol.address);
			const allowance = await ERC20().allowance(Alice.address, Bob.address);
			expect(aliceBal.toString()).to.equal("100");
			expect(carolBal.toString()).to.equal("0");
			expect(allowance.toString()).to.equal("90");
		});
	});

	context("IERC20AltApprove", async () =>
	{
		const AltApprove = () => Contract as IERC20AltApprove;
		const TestOnlyERC20 = () => Contract as IERC20;

		beforeEach(async () =>
		{
			Contract = await ERC20Factory.deploy("Name", "SYM");
			await Contract.deployed();
		});

		it("ERC20.decreaseAllowance: Should allow token holder to change allowance", async () =>
		{
			// Arrange
			await ERC20Mock().mockMint(Alice.address, "100");
			await AltApprove().increaseAllowance(Bob.address, 100);
			// Act
			const result = await AltApprove().decreaseAllowance(Bob.address, 50);
			// Assert
			await EmitOnlyThis(result, Contract, "Approval(address,address,uint256)");
			expect(await TestOnlyERC20().allowance(Alice.address, Bob.address)).to.equal(50);
		});

		it("ERC20.decreaseAllowance: Should allow token holder to change allowance multible times", async () =>
		{
			// Arrange
			await ERC20Mock().mockMint(Alice.address, "100");
			await AltApprove().increaseAllowance(Bob.address, 100);
			// Act
			await AltApprove().decreaseAllowance(Bob.address, 50);
			await AltApprove().decreaseAllowance(Bob.address, 10);
			await AltApprove().decreaseAllowance(Bob.address, 20);
			// Assert
			expect(await TestOnlyERC20().allowance(Alice.address, Bob.address)).to.equal(20);
		});

		it("ERC20.decreaseAllowance: Should not allow token holder to change allowance below 0", async () =>
		{
			// Arrange
			await ERC20Mock().mockMint(Alice.address, "100");
			await AltApprove().increaseAllowance(Bob.address, 100);
			// Act
			const result = AltApprove().decreaseAllowance(Bob.address, 101);
			// Assert
			await expect(result).to.revertedWith("ERC20: reduced allowance below 0");
			expect(await TestOnlyERC20().allowance(Alice.address, Bob.address)).to.equal(100);
		});

		it("ERC20.increaseAllowance: Should allow token holder to change allowance", async () =>
		{
			// Arrange
			await ERC20Mock().mockMint(Alice.address, "100");
			// Act
			const result = await AltApprove().increaseAllowance(Bob.address, 50);
			// Assert
			await EmitOnlyThis(result, Contract, "Approval(address,address,uint256)");
			expect(await TestOnlyERC20().allowance(Alice.address, Bob.address)).to.equal(50);
		});

		it("ERC20.increaseAllowance: Should allow token holder to change allowance above hold tokens", async () =>
		{
			// Arrange
			await ERC20Mock().mockMint(Alice.address, "100");
			// Act
			const result = await AltApprove().increaseAllowance(Bob.address, 200);
			// Assert
			await EmitOnlyThis(result, Contract, "Approval(address,address,uint256)");
			expect(await TestOnlyERC20().allowance(Alice.address, Bob.address)).to.equal(200);
		});

		it("ERC20.increaseAllowance: Should allow token holder to change allowance multible times", async () =>
		{
			// Arrange
			await ERC20Mock().mockMint(Alice.address, "100");
			// Act
			await AltApprove().increaseAllowance(Bob.address, 50);
			await AltApprove().increaseAllowance(Bob.address, 10);
			await AltApprove().increaseAllowance(Bob.address, 20);
			// Assert
			expect(await TestOnlyERC20().allowance(Alice.address, Bob.address)).to.equal(80);
		});
	});

	context("IERC20Metadata", async () =>
	{
		const ERC20Metadata = () => Contract as IERC20Metadata;

		beforeEach(async () =>
		{
			Contract = await ERC20Factory.deploy("Name", "SYM");
			await Contract.deployed();
		});

		it("ERC20.decimals: Should return correct decimals", async () =>
		{
			// Arrange
			// Act
			const decimals: number = await ERC20Metadata().decimals();
			// Assert
			expect(decimals).to.equal(18);
		});

		it("ERC20.name: Should return correct name", async () =>
		{
			// Arrange
			// Act
			const result = await ERC20Metadata().name();
			// Assert
			expect(result).to.equal("Name");
		});

		it("ERC20.symbol: Should return correct symbol", async () =>
		{
			// Arrange
			// Act
			const result = await ERC20Metadata().symbol();
			// Assert
			expect(result).to.equal("SYM");
		});
	});
});
