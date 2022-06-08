/* eslint-disable node/no-unpublished-import */
import { ethers } from "hardhat";
import { expect } from "chai";
import { BigNumber, ContractFactory } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ADDRESS_ZERO, AdvanceBlock, EmitOnlyThis, StartAutomine, StopAutomine } from "./helpers";
import { IERC20BurnableMock, IERC20AltApprove } from "../typechain-types";

// * Unit tests are grouped in contexts.
// * Ever group represents an derived class or interface.
// * Contexts are named after the imported class or interface.
// * Only methods that are overriden or not in the same codebase need to be tested again.
// * Unit tests covering class specific functionality are put in the context "this".
// * Contexts are ordered alphabetically.
// * Tests are ordered by the function name. After that the order should be "Should emit->Should allow->Should not allow".
describe("ERC20Burnable", () =>
{
	let ERC20BurnableFactory: ContractFactory;
	let Signers: SignerWithAddress[];
	let Alice: SignerWithAddress;
	let Bob: SignerWithAddress;
	let Carol: SignerWithAddress;
	let ERC20Burnable: IERC20BurnableMock;

	before(async () =>
	{
		ERC20BurnableFactory = await ethers.getContractFactory("ERC20BurnableMock");
		Signers = await ethers.getSigners();
		Alice = Signers[0];
		Bob = Signers[1];
		Carol = Signers[2];
	});

	context("this", async () =>
	{
		beforeEach(async () =>
		{
			ERC20Burnable = (await ERC20BurnableFactory.deploy("Name", "SYM")) as IERC20BurnableMock;
			await ERC20Burnable.deployed();
		});

		it("ERC20Burnable.balanceOf: Should allow to get balance of tokens.", async () =>
		{
			// Arrange
			await ERC20Burnable.mockMint(Alice.address, 25);
			await ERC20Burnable.mockMint(Bob.address, 50);
			// Act
			const resultAlice = await ERC20Burnable.balanceOf(Alice.address);
			const resultBob = await ERC20Burnable.balanceOf(Bob.address);
			// Assert
			expect(resultAlice).to.equal(25);
			expect(resultBob).to.equal(50);
		});

		it("ERC20Burnable.burn: Should emit `Transfer` event", async () =>
		{
			// Arrange
			await ERC20Burnable.mockMint(Alice.address, 100);
			// Act
			const result = await ERC20Burnable.burn(50);
			// Assert
			await expect(result).to.emit(ERC20Burnable, "Transfer(address,address,uint256)").withArgs(Alice.address, ADDRESS_ZERO, 50);
			await EmitOnlyThis(result, ERC20Burnable, "Transfer(address,address,uint256)");
		});

		it("ERC20Burnable.burn: Should allow token holder to burn all of his tokens", async () =>
		{
			// Arrange
			await ERC20Burnable.mockMint(Alice.address, 100);
			await ERC20Burnable.mockMint(Bob.address, 100);
			// Act
			const result = await ERC20Burnable.burn(100);
			// Assert
			await expect(result).to.emit(ERC20Burnable, "Transfer(address,address,uint256)").withArgs(Alice.address, ADDRESS_ZERO, 100);
			await EmitOnlyThis(result, ERC20Burnable, "Transfer(address,address,uint256)");
			expect(await ERC20Burnable.totalSupply()).to.equal(100);
			expect(await ERC20Burnable.balanceOf(Alice.address)).to.equal(0);
			expect(await ERC20Burnable.balanceOf(Bob.address)).to.equal(100);
		});

		it("ERC20Burnable.burn: Should allow token holder to burn part of his tokens", async () =>
		{
			// Arrange
			await ERC20Burnable.mockMint(Alice.address, 100);
			await ERC20Burnable.mockMint(Bob.address, 100);
			// Act
			const result = await ERC20Burnable.burn(50);
			// Assert
			await expect(result).to.emit(ERC20Burnable, "Transfer(address,address,uint256)").withArgs(Alice.address, ADDRESS_ZERO, 50);
			await EmitOnlyThis(result, ERC20Burnable, "Transfer(address,address,uint256)");
			expect(await ERC20Burnable.totalSupply()).to.equal(150);
			expect(await ERC20Burnable.balanceOf(Alice.address)).to.equal(50);
			expect(await ERC20Burnable.balanceOf(Bob.address)).to.equal(100);
		});

		it("ERC20Burnable.burn: Should not allow token holder to burn more than his tokens", async () =>
		{
			// Arrange
			await ERC20Burnable.mockMint(Alice.address, 100);
			await ERC20Burnable.mockMint(Bob.address, 100);
			// Act
			const result = ERC20Burnable.burn(101);
			// Assert
			await expect(result).to.be.revertedWith("ERC20: burn exceeds balance");
			expect(await ERC20Burnable.totalSupply()).to.equal(200);
			expect(await ERC20Burnable.balanceOf(Alice.address)).to.equal(100);
			expect(await ERC20Burnable.balanceOf(Bob.address)).to.equal(100);
		});

		it("ERC20Burnable.burnFrom: Should emit `Transfer` and `Approval` event", async () =>
		{
			// Arrange
			await ERC20Burnable.mockMint(Alice.address, 100);
			await ERC20Burnable.mockMint(Bob.address, 100);
			await ERC20Burnable.connect(Bob).approve(Alice.address, 50);
			// Act
			const result = await ERC20Burnable.burnFrom(Bob.address, 20);
			// Assert
			await expect(result).to.emit(ERC20Burnable, "Transfer(address,address,uint256)").withArgs(Bob.address, ADDRESS_ZERO, 20);
			await expect(result).to.emit(ERC20Burnable, "Approval(address, address, uint256)").withArgs(Bob.address, Alice.address, 30);
			await EmitOnlyThis(result, ERC20Burnable, "Transfer(address,address,uint256)", "Approval(address,address,uint256)");
		});

		it("ERC20Burnable.burnFrom: Should allow token holder to burn part of the tokens he got allowance for", async () =>
		{
			// Arrange
			await ERC20Burnable.mockMint(Alice.address, 100);
			await ERC20Burnable.mockMint(Bob.address, 100);
			await ERC20Burnable.connect(Bob).approve(Alice.address, 50);
			// Act
			const result = await ERC20Burnable.burnFrom(Bob.address, 25);
			// Assert
			await expect(result).to.emit(ERC20Burnable, "Transfer(address,address,uint256)").withArgs(Bob.address, ADDRESS_ZERO, 25);
			await expect(result).to.emit(ERC20Burnable, "Approval(address, address, uint256)").withArgs(Bob.address, Alice.address, 25);
			await EmitOnlyThis(result, ERC20Burnable, "Transfer(address,address,uint256)", "Approval(address,address,uint256)");
			expect(await ERC20Burnable.totalSupply()).to.equal(175);
			expect(await ERC20Burnable.balanceOf(Alice.address)).to.equal(100);
			expect(await ERC20Burnable.balanceOf(Bob.address)).to.equal(75);
			expect(await ERC20Burnable.allowance(Bob.address, Alice.address)).to.equal(25);
		});

		it("ERC20Burnable.burnFrom: Should allow token holder to burn all of the tokens he got allowance for", async () =>
		{
			// Arrange
			await ERC20Burnable.mockMint(Alice.address, 100);
			await ERC20Burnable.mockMint(Bob.address, 100);
			await ERC20Burnable.connect(Bob).approve(Alice.address, 50);
			// Act
			const result = await ERC20Burnable.burnFrom(Bob.address, 50);
			// Assert
			await expect(result).to.emit(ERC20Burnable, "Transfer(address,address,uint256)").withArgs(Bob.address, ADDRESS_ZERO, 50);
			await expect(result).to.emit(ERC20Burnable, "Approval(address, address, uint256)").withArgs(Bob.address, Alice.address, 0);
			await EmitOnlyThis(result, ERC20Burnable, "Transfer(address,address,uint256)", "Approval(address,address,uint256)");
			expect(await ERC20Burnable.totalSupply()).to.equal(150);
			expect(await ERC20Burnable.balanceOf(Alice.address)).to.equal(100);
			expect(await ERC20Burnable.balanceOf(Bob.address)).to.equal(50);
			expect(await ERC20Burnable.allowance(Bob.address, Alice.address)).to.equal(0);
		});

		it("ERC20Burnable.burnFrom: Should not allow token holder to burn more tokens he got allowance for", async () =>
		{
			// Arrange
			await ERC20Burnable.mockMint(Alice.address, 100);
			await ERC20Burnable.mockMint(Bob.address, 100);
			await ERC20Burnable.connect(Bob).approve(Alice.address, 50);
			// Act
			const result = ERC20Burnable.burnFrom(Bob.address, 51);
			// Assert
			await expect(result).to.be.revertedWith("ERC20: insufficient allowance");
			expect(await ERC20Burnable.totalSupply()).to.equal(200);
			expect(await ERC20Burnable.balanceOf(Alice.address)).to.equal(100);
			expect(await ERC20Burnable.balanceOf(Bob.address)).to.equal(100);
			expect(await ERC20Burnable.allowance(Bob.address, Alice.address)).to.equal(50);
		});

		it("ERC20Burnable.totalSupply: Should allow to get total token supply.", async () =>
		{
			// Arrange
			await ERC20Burnable.mockMint(Alice.address, 25);
			await ERC20Burnable.mockMint(Bob.address, 25);
			// Act
			const result = await ERC20Burnable.totalSupply();
			// Assert
			expect(result).to.equal(50);
		});

		it("ERC20Burnable.mockMint: Should allow to mint.", async () =>
		{
			// NOTICE: Mint is only used in the mock contract for testing purposes.
			// Arrange
			// Act
			const result = await ERC20Burnable.mockMint(Alice.address, 25);
			// Assert
			await expect(result).to.emit(ERC20Burnable, "Transfer(address,address,uint256)").withArgs(ADDRESS_ZERO, Alice.address, 25);
			await EmitOnlyThis(result, ERC20Burnable, "Transfer(address,address,uint256)");
			expect(await ERC20Burnable.totalSupply()).to.equal(25);
			expect(await ERC20Burnable.balanceOf(Alice.address)).to.equal(25);
		});
	});

	context("IERC20AltApprove", async () =>
	{
		let ERC20AltApprove: IERC20AltApprove;

		beforeEach(async () =>
		{
			const contract = ERC20BurnableFactory.deploy("Name", "SYM");
			ERC20Burnable = (await contract) as IERC20BurnableMock;
			ERC20AltApprove = (await contract) as IERC20AltApprove;
			await ERC20Burnable.deployed();
		});

		it("ERC20Burnable.decreaseAllowance: Should allow token holder to change allowance", async () =>
		{
			// Arrange
			await ERC20Burnable.mockMint(Alice.address, "100");
			await ERC20AltApprove.increaseAllowance(Bob.address, 100);
			// Act
			const result = await ERC20AltApprove.decreaseAllowance(Bob.address, 50);
			// Assert
			await EmitOnlyThis(result, ERC20Burnable, "Approval(address,address,uint256)");
			expect(await ERC20Burnable.allowance(Alice.address, Bob.address)).to.equal(50);
		});

		it("ERC20Burnable.decreaseAllowance: Should allow token holder to change allowance multible times", async () =>
		{
			// Arrange
			await ERC20Burnable.mockMint(Alice.address, "100");
			await ERC20AltApprove.increaseAllowance(Bob.address, 100);
			// Act
			await ERC20AltApprove.decreaseAllowance(Bob.address, 50);
			await ERC20AltApprove.decreaseAllowance(Bob.address, 10);
			await ERC20AltApprove.decreaseAllowance(Bob.address, 20);
			// Assert
			expect(await ERC20Burnable.allowance(Alice.address, Bob.address)).to.equal(20);
		});

		it("ERC20Burnable.decreaseAllowance: Should not allow token holder to change allowance below 0", async () =>
		{
			// Arrange
			await ERC20Burnable.mockMint(Alice.address, "100");
			await ERC20AltApprove.increaseAllowance(Bob.address, 100);
			// Act
			const result = ERC20AltApprove.decreaseAllowance(Bob.address, 101);
			// Assert
			await expect(result).to.revertedWith("ERC20: reduced allowance below 0");
			expect(await ERC20Burnable.allowance(Alice.address, Bob.address)).to.equal(100);
		});

		it("ERC20Burnable.increaseAllowance: Should allow token holder to change allowance", async () =>
		{
			// Arrange
			await ERC20Burnable.mockMint(Alice.address, "100");
			// Act
			const result = await ERC20AltApprove.increaseAllowance(Bob.address, 50);
			// Assert
			await EmitOnlyThis(result, ERC20Burnable, "Approval(address,address,uint256)");
			expect(await ERC20Burnable.allowance(Alice.address, Bob.address)).to.equal(50);
		});

		it("ERC20Burnable.increaseAllowance: Should allow token holder to change allowance above hold tokens", async () =>
		{
			// Arrange
			await ERC20Burnable.mockMint(Alice.address, "100");
			// Act
			const result = await ERC20AltApprove.increaseAllowance(Bob.address, 200);
			// Assert
			await EmitOnlyThis(result, ERC20Burnable, "Approval(address,address,uint256)");
			expect(await ERC20Burnable.allowance(Alice.address, Bob.address)).to.equal(200);
		});

		it("ERC20Burnable.increaseAllowance: Should allow token holder to change allowance multible times", async () =>
		{
			// Arrange
			await ERC20Burnable.mockMint(Alice.address, "100");
			// Act
			await ERC20AltApprove.increaseAllowance(Bob.address, 50);
			await ERC20AltApprove.increaseAllowance(Bob.address, 10);
			await ERC20AltApprove.increaseAllowance(Bob.address, 20);
			// Assert
			expect(await ERC20Burnable.allowance(Alice.address, Bob.address)).to.equal(80);
		});
	});

	context("IERC20", async () =>
	{
		let ERC20AltApprove: IERC20AltApprove;

		beforeEach(async () =>
		{
			const contract = ERC20BurnableFactory.deploy("Name", "SYM");
			ERC20Burnable = (await contract) as IERC20BurnableMock;
			ERC20AltApprove = (await contract) as IERC20AltApprove;
			await ERC20Burnable.deployed();
		});

		it("ERC20Burnable.constructor: Should emit nothing", async () =>
		{
			// Arrange
			// Act
			const result = ERC20Burnable.deployTransaction;
			// Assert
			await EmitOnlyThis(result, ERC20Burnable);
		});

		it("ERC20Burnable.approve: Should emit `Approval` event", async () =>
		{
			// Arrange
			await ERC20Burnable.mockMint(Alice.address, 100);
			// Act
			const result = await ERC20Burnable.approve(Bob.address, 10);
			// Assert
			await expect(result).to.emit(ERC20Burnable, "Approval(address,address,uint256)").withArgs(Alice.address, Bob.address, 10);
			await EmitOnlyThis(result, ERC20Burnable, "Approval(address,address,uint256)");
		});

		it("ERC20Burnable.approve: Should allow set of approval", async () =>
		{
			// Arrange
			await ERC20Burnable.mockMint(Alice.address, 100);
			// Act
			const result = await ERC20Burnable.approve(Bob.address, 10);
			// Assert
			const approved = await ERC20Burnable.allowance(Alice.address, Bob.address);
			expect(approved.toString()).to.equal("10");
			await expect(result).to.emit(ERC20Burnable, "Approval(address,address,uint256)").withArgs(Alice.address, Bob.address, 10);
			await EmitOnlyThis(result, ERC20Burnable, "Approval(address,address,uint256)");
		});

		it("ERC20Burnable.approve: Proof of unfixable approve/transferFrom attack vector", async () =>
		{
			await ERC20Burnable.mockMint(Alice.address, 100);
			await ERC20Burnable.approve(Bob.address, 50);
			await StopAutomine();
			// What happens is that Alice is changing the approved tokens from 50 to 30.
			// Bob notice this before the Transaction of Alice is confirmed and added his on transferFrom transaction.
			// The attack is successfull if the transferFrom transaction is confirmed before the approve transaction or
			// if confirmed in the same block the transferFrom transaction is processed first.
			// We simulate that second case.
			await ERC20Burnable.connect(Bob).transferFrom(Alice.address, Bob.address, 50);
			await ERC20Burnable.approve(Bob.address, 30);
			await AdvanceBlock();
			// The Damange is now done. There is no way to prevent this inside the approve method.
			await StartAutomine();
			await ERC20Burnable.connect(Bob).transferFrom(Alice.address, Bob.address, 30);

			expect(await ERC20Burnable.balanceOf(Alice.address)).to.equal(20);
			expect(await ERC20Burnable.balanceOf(Bob.address)).to.equal(80);
		});

		it("ERC20Burnable.transfer: Should emit `Transfer` event", async () =>
		{
			// Arrange
			await ERC20Burnable.mockMint(Alice.address, "100");
			// Act
			const result = await ERC20Burnable.transfer(Carol.address, "10");
			// Assert
			await expect(result).to.emit(ERC20Burnable, "Transfer(address,address,uint256)").withArgs(Alice.address, Carol.address, 10);
			await EmitOnlyThis(result, ERC20Burnable, "Transfer(address,address,uint256)");
		});

		it("ERC20Burnable.transfer: Should allow token transfer", async () =>
		{
			// Arrange
			await ERC20Burnable.mockMint(Alice.address, "100");
			// Act
			const result = await ERC20Burnable.transfer(Carol.address, "10");
			// Assert
			const totalSupply = await ERC20Burnable.totalSupply();
			const aliceBal = await ERC20Burnable.balanceOf(Alice.address);
			const carolBal = await ERC20Burnable.balanceOf(Carol.address);
			expect(totalSupply.toString()).to.equal("100");
			expect(aliceBal.toString()).to.equal("90");
			expect(carolBal.toString()).to.equal("10");
			await EmitOnlyThis(result, ERC20Burnable, "Transfer(address,address,uint256)");
		});

		it("ERC20Burnable.transfer: Should not allow transfer more than balance", async () =>
		{
			// Arrange
			await ERC20Burnable.mockMint(Alice.address, "100");
			// Act
			const result = ERC20Burnable.transfer(Carol.address, "110");
			// Assert
			await expect(result).to.be.revertedWith("ERC20: transfer exceeds balance");
			const aliceBal = await ERC20Burnable.balanceOf(Alice.address);
			const carolBal = await ERC20Burnable.balanceOf(Carol.address);
			expect(aliceBal.toString()).to.equal("100");
			expect(carolBal.toString()).to.equal("0");
		});

		it("ERC20Burnable.transferFrom: Should emit `Transfer` and `Approval` event", async () =>
		{
			// Arrange
			await ERC20Burnable.mockMint(Alice.address, 100);
			await ERC20AltApprove.increaseAllowance(Bob.address, 50);
			// Act
			const result = await ERC20Burnable.connect(Bob).transferFrom(Alice.address, Carol.address, 10);
			// Assert
			await expect(result).to.emit(ERC20Burnable, "Approval(address,address,uint256)").withArgs(Alice.address, Bob.address, 40);
			await expect(result).to.emit(ERC20Burnable, "Transfer(address,address,uint256)").withArgs(Alice.address, Carol.address, 10);
			await EmitOnlyThis(result, ERC20Burnable, "Approval(address,address,uint256)", "Transfer(address,address,uint256)");
		});

		it("ERC20Burnable.transferFrom: Should allow token transfer and reduce allowance", async () =>
		{
			// Arrange
			await ERC20Burnable.mockMint(Alice.address, "100");
			await ERC20AltApprove.increaseAllowance(Bob.address, 50);
			// Act
			const result = await ERC20Burnable.connect(Bob).transferFrom(Alice.address, Carol.address, 10);
			// Assert
			const totalSupply = await ERC20Burnable.totalSupply();
			const aliceBal = await ERC20Burnable.balanceOf(Alice.address);
			const carolBal = await ERC20Burnable.balanceOf(Carol.address);
			const allowance = await ERC20Burnable.allowance(Alice.address, Bob.address);
			expect(totalSupply.toString()).to.equal("100");
			expect(aliceBal.toString()).to.equal("90");
			expect(carolBal.toString()).to.equal("10");
			expect(allowance.toString()).to.equal("40");
			await expect(result).to.emit(ERC20Burnable, "Approval(address,address,uint256)").withArgs(Alice.address, Bob.address, 40);
			await expect(result).to.emit(ERC20Burnable, "Transfer(address,address,uint256)").withArgs(Alice.address, Carol.address, 10);
			await EmitOnlyThis(result, ERC20Burnable, "Approval(address,address,uint256)", "Transfer(address,address,uint256)");
		});

		it("ERC20Burnable.transferFrom: Should allow token transfer and not reduce infinite allowance", async () =>
		{
			// Arrange
			const max: BigNumber = BigNumber.from(2).pow(256).sub(1);
			await ERC20Burnable.mockMint(Alice.address, "100");
			await ERC20AltApprove.increaseAllowance(Bob.address, max);
			// Act
			const result = await ERC20Burnable.connect(Bob).transferFrom(Alice.address, Carol.address, 10);
			// Assert
			const totalSupply = await ERC20Burnable.totalSupply();
			const aliceBal = await ERC20Burnable.balanceOf(Alice.address);
			const carolBal = await ERC20Burnable.balanceOf(Carol.address);
			const allowance = await ERC20Burnable.allowance(Alice.address, Bob.address);
			expect(totalSupply.toString()).to.equal("100");
			expect(aliceBal.toString()).to.equal("90");
			expect(carolBal.toString()).to.equal("10");
			expect(allowance).to.equal(max);
			await expect(result).to.emit(ERC20Burnable, "Transfer(address,address,uint256)").withArgs(Alice.address, Carol.address, 10);
			await EmitOnlyThis(result, ERC20Burnable, "Transfer(address,address,uint256)");
		});

		it("ERC20Burnable.transferFrom: Should not allow transfer more than balance", async () =>
		{
			// Arrange
			await ERC20Burnable.mockMint(Alice.address, "100");
			await ERC20AltApprove.increaseAllowance(Bob.address, 200);
			// Act
			const result = ERC20Burnable.connect(Bob).transferFrom(Alice.address, Carol.address, 110);
			// Assert
			await expect(result).to.be.revertedWith("ERC20: transfer exceeds balance");
			const aliceBal = await ERC20Burnable.balanceOf(Alice.address);
			const carolBal = await ERC20Burnable.balanceOf(Carol.address);
			const allowance = await ERC20Burnable.allowance(Alice.address, Bob.address);
			expect(aliceBal.toString()).to.equal("100");
			expect(carolBal.toString()).to.equal("0");
			expect(allowance.toString()).to.equal("200");
		});

		it("ERC20Burnable.transferFrom: Should not allow transfer more than allowance", async () =>
		{
			// Arrange
			await ERC20Burnable.mockMint(Alice.address, 100);
			await ERC20AltApprove.increaseAllowance(Bob.address, 90);
			// Act
			const result = ERC20Burnable.connect(Bob).transferFrom(Alice.address, Carol.address, 100);
			// Assert
			await expect(result).to.be.revertedWith("ERC20: insufficient allowance");
			const aliceBal = await ERC20Burnable.balanceOf(Alice.address);
			const carolBal = await ERC20Burnable.balanceOf(Carol.address);
			const allowance = await ERC20Burnable.allowance(Alice.address, Bob.address);
			expect(aliceBal.toString()).to.equal("100");
			expect(carolBal.toString()).to.equal("0");
			expect(allowance.toString()).to.equal("90");
		});
	});

	context("IERC20Metadata", async () =>
	{
		beforeEach(async () =>
		{
			ERC20Burnable = (await ERC20BurnableFactory.deploy("Name", "SYM")) as IERC20BurnableMock;
			await ERC20Burnable.deployed();
		});

		it("ERC20Burnable.decimals: Should return correct decimals", async () =>
		{
			// Arrange
			// Act
			const decimals: number = await ERC20Burnable.decimals();
			// Assert
			expect(decimals).to.equal(18);
		});

		it("ERC20Burnable.name: Should return correct name", async () =>
		{
			// Arrange
			// Act
			const result = await ERC20Burnable.name();
			// Assert
			expect(result).to.equal("Name");
		});

		it("ERC20Burnable.symbol: Should return correct symbol", async () =>
		{
			// Arrange
			// Act
			const result = await ERC20Burnable.symbol();
			// Assert
			expect(result).to.equal("SYM");
		});
	});
});
