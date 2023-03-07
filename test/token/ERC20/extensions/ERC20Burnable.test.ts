import { ethers } from "hardhat";
import { expect } from "chai";
import { BigNumber } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ADDRESS_ZERO, AdvanceBlock, EmitOnlyThis, StartAutomine, StopAutomine, UINT256_MAX } from "../../../helpers";
import { ERC20BurnableMock } from "../../../../typechain-types";

// * Unit tests are grouped in contexts.
// * Ever group represents an derived class or interface.
// * Contexts are named after the imported class or interface.
// * Only methods that are overriden or not in the same codebase need to be tested again.
// * Unit tests covering class specific functionality are put in the context "this".
// * Contexts are ordered alphabetically.
// * Tests are ordered by the function name. After that the order should be "Should emit->Should allow->Should not allow".
describe("ERC20Burnable", () =>
{
	let Alice: SignerWithAddress;
	let Bob: SignerWithAddress;
	let Carol: SignerWithAddress;
	let ERC20BurnableMock: ERC20BurnableMock;

	before(async () =>
	{
		const signers = await ethers.getSigners();
		Alice = signers[0];
		Bob = signers[1];
		Carol = signers[2];
		const erc20Factory = await ethers.getContractFactory("ERC20BurnableMock");
		ERC20BurnableMock = await erc20Factory.deploy("Name", "SYM");
	});

	context("Mock", () =>
	{
		beforeEach(async () =>
		{
			// Reset values form previous tests
			await ERC20BurnableMock.burn(await ERC20BurnableMock.balanceOf(Alice.address));
			await ERC20BurnableMock.connect(Bob).burn(await ERC20BurnableMock.balanceOf(Bob.address));
			await ERC20BurnableMock.connect(Carol).burn(await ERC20BurnableMock.balanceOf(Carol.address));
			await ERC20BurnableMock.approve(Bob.address, 0);
			await ERC20BurnableMock.approve(Carol.address, 0);
			await ERC20BurnableMock.connect(Bob).approve(Alice.address, 0);
			await ERC20BurnableMock.connect(Bob).approve(Carol.address, 0);
			await ERC20BurnableMock.connect(Carol).approve(Alice.address, 0);
			await ERC20BurnableMock.connect(Carol).approve(Bob.address, 0);
		});

		it("ERC20Burnable.mockMint: Should allow to mint.", async () =>
		{
			// NOTICE: _mint is only used in the mock contract for testing purposes.
			// The purpose for this test is to proof that mockMint used in other test cases is working as expected.
			// Arrange
			const expectedBalanceAlice = BigNumber.from(0).add(25);
			const expectedTotalSupply = BigNumber.from(0).add(25);
			// Act
			const result = await ERC20BurnableMock.mockMint(Alice.address, 25);
			// Assert
			await expect(result).to.emit(ERC20BurnableMock, "Transfer(address,address,uint256)").withArgs(ADDRESS_ZERO, Alice.address, 25);
			await EmitOnlyThis(result, ERC20BurnableMock, "Transfer(address,address,uint256)");
			expect(await ERC20BurnableMock.totalSupply()).to.equal(expectedTotalSupply);
			expect(await ERC20BurnableMock.balanceOf(Alice.address)).to.equal(expectedBalanceAlice);
		});
	});

	context("this", () =>
	{
		beforeEach(async () =>
		{
			// Reset values form previous tests
			await ERC20BurnableMock.burn(await ERC20BurnableMock.balanceOf(Alice.address));
			await ERC20BurnableMock.connect(Bob).burn(await ERC20BurnableMock.balanceOf(Bob.address));
			await ERC20BurnableMock.connect(Carol).burn(await ERC20BurnableMock.balanceOf(Carol.address));
			await ERC20BurnableMock.approve(Bob.address, 0);
			await ERC20BurnableMock.approve(Carol.address, 0);
			await ERC20BurnableMock.connect(Bob).approve(Alice.address, 0);
			await ERC20BurnableMock.connect(Bob).approve(Carol.address, 0);
			await ERC20BurnableMock.connect(Carol).approve(Alice.address, 0);
			await ERC20BurnableMock.connect(Carol).approve(Bob.address, 0);
		});

		it("ERC20Burnable.constructor: Should emit nothing", async () =>
		{
			// NOTICE: We use the original Contract for this in case the mock does modify the constructor
			// and for the contract to show up in the Deployments section of `npm run test:gas`.
			// Arrange
			const factory = await ethers.getContractFactory("ERC20Burnable");
			const originalContract = await factory.deploy("Original", "OOO");
			await originalContract.deployed();
			// Act
			const result = originalContract.deployTransaction;
			// Assert
			await EmitOnlyThis(result, originalContract);
		});

		it("ERC20Burnable.burn: Should emit `Transfer` event", async () =>
		{
			// Arrange
			await ERC20BurnableMock.mockMint(Alice.address, 100);
			// Act
			const result = await ERC20BurnableMock.burn(50);
			// Assert
			await expect(result).to.emit(ERC20BurnableMock, "Transfer(address,address,uint256)").withArgs(Alice.address, ADDRESS_ZERO, 50);
			await EmitOnlyThis(result, ERC20BurnableMock, "Transfer(address,address,uint256)");
		});

		it("ERC20Burnable.burn: Should allow token holder to burn all of his tokens", async () =>
		{
			// Arrange
			await ERC20BurnableMock.mockMint(Alice.address, 100);
			await ERC20BurnableMock.mockMint(Bob.address, 100);
			const balanceAlice = BigNumber.from(100);
			const expectedBalanceAlice = BigNumber.from(0);
			const expectedBalanceBob = BigNumber.from(100);
			const expectedTotalSupply = BigNumber.from(100);
			// Act
			const result = await ERC20BurnableMock.burn(100);
			// Assert
			await expect(result).to.emit(ERC20BurnableMock, "Transfer(address,address,uint256)").withArgs(Alice.address, ADDRESS_ZERO, balanceAlice);
			await EmitOnlyThis(result, ERC20BurnableMock, "Transfer(address,address,uint256)");
			expect(await ERC20BurnableMock.totalSupply()).to.equal(expectedTotalSupply);
			expect(await ERC20BurnableMock.balanceOf(Alice.address)).to.equal(expectedBalanceAlice);
			expect(await ERC20BurnableMock.balanceOf(Bob.address)).to.equal(expectedBalanceBob);
		});

		it("ERC20Burnable.burn: Should allow token holder to burn part of his tokens", async () =>
		{
			// Arrange
			await ERC20BurnableMock.mockMint(Alice.address, 100);
			await ERC20BurnableMock.mockMint(Bob.address, 100);
			const balanceAlice = BigNumber.from(100);
			const expectedBalanceAlice = balanceAlice.sub(50);
			const expectedBalanceBob = BigNumber.from(100);
			const expectedTotalSupply = BigNumber.from(200).sub(50);
			// Act
			const result = await ERC20BurnableMock.burn(50);
			// Assert
			await expect(result).to.emit(ERC20BurnableMock, "Transfer(address,address,uint256)").withArgs(Alice.address, ADDRESS_ZERO, 50);
			await EmitOnlyThis(result, ERC20BurnableMock, "Transfer(address,address,uint256)");
			expect(await ERC20BurnableMock.totalSupply()).to.equal(expectedTotalSupply);
			expect(await ERC20BurnableMock.balanceOf(Alice.address)).to.equal(expectedBalanceAlice);
			expect(await ERC20BurnableMock.balanceOf(Bob.address)).to.equal(expectedBalanceBob);
		});

		it("ERC20Burnable.burn: Should not allow token holder to burn more than his tokens", async () =>
		{
			// Arrange
			await ERC20BurnableMock.mockMint(Alice.address, 100);
			await ERC20BurnableMock.mockMint(Bob.address, 100);
			const balanceAlice = BigNumber.from(100);
			const expectedBalanceAlice = balanceAlice;
			const expectedBalanceBob = BigNumber.from(100);
			const expectedTotalSupply = BigNumber.from(200);
			// Act
			const result = ERC20BurnableMock.burn(balanceAlice.add(1));
			// Assert
			await expect(result).to.be.revertedWith("ERC20: burn exceeds balance");
			expect(await ERC20BurnableMock.totalSupply()).to.equal(expectedTotalSupply);
			expect(await ERC20BurnableMock.balanceOf(Alice.address)).to.equal(expectedBalanceAlice);
			expect(await ERC20BurnableMock.balanceOf(Bob.address)).to.equal(expectedBalanceBob);
		});

		it("ERC20Burnable.burnFrom: Should emit `Transfer` and `Approval` event", async () =>
		{
			// Arrange
			await ERC20BurnableMock.mockMint(Alice.address, 100);
			await ERC20BurnableMock.mockMint(Bob.address, 100);
			await ERC20BurnableMock.connect(Bob).approve(Alice.address, 50);
			// Act
			const result = await ERC20BurnableMock.burnFrom(Bob.address, 20);
			// Assert
			await expect(result).to.emit(ERC20BurnableMock, "Transfer(address,address,uint256)").withArgs(Bob.address, ADDRESS_ZERO, 20);
			await expect(result).to.emit(ERC20BurnableMock, "Approval(address, address, uint256)").withArgs(Bob.address, Alice.address, 30);
			await EmitOnlyThis(result, ERC20BurnableMock, "Transfer(address,address,uint256)", "Approval(address,address,uint256)");
		});

		it("ERC20Burnable.burnFrom: Should allow token holder to burn part of the tokens he got allowance for", async () =>
		{
			// Arrange
			await ERC20BurnableMock.mockMint(Alice.address, 100);
			await ERC20BurnableMock.mockMint(Bob.address, 100);
			const expectedTotalSupply = BigNumber.from(200).sub(25);
			await ERC20BurnableMock.connect(Bob).approve(Alice.address, 50);
			// Act
			const result = await ERC20BurnableMock.burnFrom(Bob.address, 25);
			// Assert
			await expect(result).to.emit(ERC20BurnableMock, "Transfer(address,address,uint256)").withArgs(Bob.address, ADDRESS_ZERO, 25);
			await expect(result).to.emit(ERC20BurnableMock, "Approval(address, address, uint256)").withArgs(Bob.address, Alice.address, 25);
			await EmitOnlyThis(result, ERC20BurnableMock, "Transfer(address,address,uint256)", "Approval(address,address,uint256)");
			expect(await ERC20BurnableMock.totalSupply()).to.equal(expectedTotalSupply);
			expect(await ERC20BurnableMock.balanceOf(Alice.address)).to.equal(100);
			expect(await ERC20BurnableMock.balanceOf(Bob.address)).to.equal(75);
			expect(await ERC20BurnableMock.allowance(Bob.address, Alice.address)).to.equal(25);
		});

		it("ERC20Burnable.burnFrom: Should allow token holder to burn all of the tokens he got allowance for", async () =>
		{
			// Arrange
			await ERC20BurnableMock.mockMint(Alice.address, 100);
			await ERC20BurnableMock.mockMint(Bob.address, 100);
			await ERC20BurnableMock.connect(Bob).approve(Alice.address, 50);
			const expectedTotalSupply = BigNumber.from(200).sub(50);
			// Act
			const result = await ERC20BurnableMock.burnFrom(Bob.address, 50);
			// Assert
			await expect(result).to.emit(ERC20BurnableMock, "Transfer(address,address,uint256)").withArgs(Bob.address, ADDRESS_ZERO, 50);
			await expect(result).to.emit(ERC20BurnableMock, "Approval(address, address, uint256)").withArgs(Bob.address, Alice.address, 0);
			await EmitOnlyThis(result, ERC20BurnableMock, "Transfer(address,address,uint256)", "Approval(address,address,uint256)");
			expect(await ERC20BurnableMock.totalSupply()).to.equal(expectedTotalSupply);
			expect(await ERC20BurnableMock.balanceOf(Alice.address)).to.equal(100);
			expect(await ERC20BurnableMock.balanceOf(Bob.address)).to.equal(50);
			expect(await ERC20BurnableMock.allowance(Bob.address, Alice.address)).to.equal(0);
		});

		it("ERC20Burnable.burnFrom: Should not allow token holder to burn more tokens he got allowance for", async () =>
		{
			// Arrange
			await ERC20BurnableMock.mockMint(Alice.address, 100);
			await ERC20BurnableMock.mockMint(Bob.address, 100);
			await ERC20BurnableMock.connect(Bob).approve(Alice.address, 50);
			const expectedTotalSupply = BigNumber.from(200);
			// Act
			const result = ERC20BurnableMock.burnFrom(Bob.address, 51);
			// Assert
			await expect(result).to.be.revertedWith("ERC20: insufficient allowance");
			expect(await ERC20BurnableMock.totalSupply()).to.equal(expectedTotalSupply);
			expect(await ERC20BurnableMock.balanceOf(Alice.address)).to.equal(100);
			expect(await ERC20BurnableMock.balanceOf(Bob.address)).to.equal(100);
			expect(await ERC20BurnableMock.allowance(Bob.address, Alice.address)).to.equal(50);
		});
	});

	context("IERC20", () =>
	{
		beforeEach(async () =>
		{
			// Reset values form previous tests
			await ERC20BurnableMock.burn(await ERC20BurnableMock.balanceOf(Alice.address));
			await ERC20BurnableMock.connect(Bob).burn(await ERC20BurnableMock.balanceOf(Bob.address));
			await ERC20BurnableMock.connect(Carol).burn(await ERC20BurnableMock.balanceOf(Carol.address));
			await ERC20BurnableMock.approve(Bob.address, 0);
			await ERC20BurnableMock.approve(Carol.address, 0);
			await ERC20BurnableMock.connect(Bob).approve(Alice.address, 0);
			await ERC20BurnableMock.connect(Bob).approve(Carol.address, 0);
			await ERC20BurnableMock.connect(Carol).approve(Alice.address, 0);
			await ERC20BurnableMock.connect(Carol).approve(Bob.address, 0);
		});

		it("ERC20Burnable.approve: Should emit `Approval` event", async () =>
		{
			// Arrange
			// Act
			const result = await ERC20BurnableMock.approve(Bob.address, 10);
			// Assert
			await expect(result).to.emit(ERC20BurnableMock, "Approval(address,address,uint256)").withArgs(Alice.address, Bob.address, 10);
			await EmitOnlyThis(result, ERC20BurnableMock, "Approval(address,address,uint256)");
		});

		it("ERC20Burnable.approve: Should allow set of approval", async () =>
		{
			// Arrange
			// Act
			const result = await ERC20BurnableMock.approve(Bob.address, 10);
			// Assert
			const approved = await ERC20BurnableMock.allowance(Alice.address, Bob.address);
			expect(approved).to.equal(BigNumber.from(10));
			await expect(result).to.emit(ERC20BurnableMock, "Approval(address,address,uint256)").withArgs(Alice.address, Bob.address, 10);
			await EmitOnlyThis(result, ERC20BurnableMock, "Approval(address,address,uint256)");
		});

		it("ERC20.approve: Proof of unfixable approve/transferFrom attack vector", async () =>
		{
			// Arrange
			await ERC20BurnableMock.approve(Bob.address, 0);
			await ERC20BurnableMock.mockMint(Alice.address, 100);
			const expectedBalanceAlice = BigNumber.from(100).sub(50).sub(30);
			const expectedBalanceBob = BigNumber.from(0).add(50).add(30);
			// Act
			await ERC20BurnableMock.approve(Bob.address, 50);
			await StopAutomine();
			// What happens is that Alice is changing the approved tokens from 50 to 30.
			// Bob notice this before the Transaction of Alice is confirmed and added his on transferFrom transaction.
			// The attack is successfull if the transferFrom transaction is confirmed before the approve transaction or
			// if confirmed in the same block the transferFrom transaction is processed first.
			// We simulate that second case.
			await ERC20BurnableMock.connect(Bob).transferFrom(Alice.address, Bob.address, 50);
			await ERC20BurnableMock.approve(Bob.address, 30);
			await AdvanceBlock();
			// The Damange is now done. There is no way to prevent this inside the approve method.
			await StartAutomine();
			await ERC20BurnableMock.connect(Bob).transferFrom(Alice.address, Bob.address, 30);
			// Assert
			expect(await ERC20BurnableMock.balanceOf(Alice.address)).to.equal(expectedBalanceAlice);
			expect(await ERC20BurnableMock.balanceOf(Bob.address)).to.equal(expectedBalanceBob);
		});

		it("ERC20Burnable.balanceOf: Should allow to get balance of tokens.", async () =>
		{
			// Arrange
			await ERC20BurnableMock.mockMint(Alice.address, 25);
			await ERC20BurnableMock.mockMint(Bob.address, 50);
			// Act
			const resultAlice = await ERC20BurnableMock.balanceOf(Alice.address);
			const resultBob = await ERC20BurnableMock.balanceOf(Bob.address);
			// Assert
			expect(resultAlice).to.equal(25);
			expect(resultBob).to.equal(50);
		});

		it("ERC20Burnable.totalSupply: Should allow to get total token supply.", async () =>
		{
			// Arrange
			const expectedTotalSupply = (await ERC20BurnableMock.totalSupply()).add(25).add(25);
			await ERC20BurnableMock.mockMint(Alice.address, 25);
			await ERC20BurnableMock.mockMint(Bob.address, 25);
			// Act
			const result = await ERC20BurnableMock.totalSupply();
			// Assert
			expect(result).to.equal(expectedTotalSupply);
		});

		it("ERC20Burnable.transfer: Should emit `Transfer` event", async () =>
		{
			// Arrange
			await ERC20BurnableMock.mockMint(Alice.address, BigNumber.from(100));
			// Act
			const result = await ERC20BurnableMock.transfer(Carol.address, BigNumber.from(10));
			// Assert
			await expect(result).to.emit(ERC20BurnableMock, "Transfer(address,address,uint256)").withArgs(Alice.address, Carol.address, 10);
			await EmitOnlyThis(result, ERC20BurnableMock, "Transfer(address,address,uint256)");
		});

		it("ERC20Burnable.transfer: Should allow token transfer", async () =>
		{
			// Arrange
			await ERC20BurnableMock.mockMint(Alice.address, BigNumber.from(100));
			const expectedTotalSupply = await ERC20BurnableMock.totalSupply();
			// Act
			const result = await ERC20BurnableMock.transfer(Carol.address, BigNumber.from(10));
			// Assert
			const totalSupply = await ERC20BurnableMock.totalSupply();
			const aliceBal = await ERC20BurnableMock.balanceOf(Alice.address);
			const carolBal = await ERC20BurnableMock.balanceOf(Carol.address);
			expect(totalSupply).to.equal(expectedTotalSupply);
			expect(aliceBal).to.equal(BigNumber.from(90));
			expect(carolBal).to.equal(BigNumber.from(10));
			await EmitOnlyThis(result, ERC20BurnableMock, "Transfer(address,address,uint256)");
		});

		it("ERC20Burnable.transfer: Should not allow transfer more than balance", async () =>
		{
			// Arrange
			await ERC20BurnableMock.mockMint(Alice.address, BigNumber.from(100));
			// Act
			const result = ERC20BurnableMock.transfer(Carol.address, BigNumber.from(110));
			// Assert
			await expect(result).to.be.revertedWith("ERC20: transfer exceeds balance");
			const aliceBal = await ERC20BurnableMock.balanceOf(Alice.address);
			const carolBal = await ERC20BurnableMock.balanceOf(Carol.address);
			expect(aliceBal).to.equal(BigNumber.from(100));
			expect(carolBal).to.equal(BigNumber.from(0));
		});

		it("ERC20Burnable.transferFrom: Should emit `Transfer` and `Approval` event", async () =>
		{
			// Arrange
			await ERC20BurnableMock.mockMint(Alice.address, 100);
			await ERC20BurnableMock.approve(Bob.address, 50);
			// Act
			const result = await ERC20BurnableMock.connect(Bob).transferFrom(Alice.address, Carol.address, 10);
			// Assert
			await expect(result).to.emit(ERC20BurnableMock, "Approval(address,address,uint256)").withArgs(Alice.address, Bob.address, 40);
			await expect(result).to.emit(ERC20BurnableMock, "Transfer(address,address,uint256)").withArgs(Alice.address, Carol.address, 10);
			await EmitOnlyThis(result, ERC20BurnableMock, "Approval(address,address,uint256)", "Transfer(address,address,uint256)");
		});

		it("ERC20Burnable.transferFrom: Should allow token transfer and reduce allowance", async () =>
		{
			// Arrange
			await ERC20BurnableMock.mockMint(Alice.address, BigNumber.from(100));
			await ERC20BurnableMock.approve(Bob.address, 50);
			const expectedTotalSupply = await ERC20BurnableMock.totalSupply();
			// Act
			const result = await ERC20BurnableMock.connect(Bob).transferFrom(Alice.address, Carol.address, 10);
			// Assert
			const totalSupply = await ERC20BurnableMock.totalSupply();
			const aliceBal = await ERC20BurnableMock.balanceOf(Alice.address);
			const carolBal = await ERC20BurnableMock.balanceOf(Carol.address);
			const allowance = await ERC20BurnableMock.allowance(Alice.address, Bob.address);
			expect(totalSupply).to.equal(expectedTotalSupply);
			expect(aliceBal).to.equal(BigNumber.from(90));
			expect(carolBal).to.equal(BigNumber.from(10));
			expect(allowance).to.equal(BigNumber.from(40));
			await expect(result).to.emit(ERC20BurnableMock, "Approval(address,address,uint256)").withArgs(Alice.address, Bob.address, 40);
			await expect(result).to.emit(ERC20BurnableMock, "Transfer(address,address,uint256)").withArgs(Alice.address, Carol.address, 10);
			await EmitOnlyThis(result, ERC20BurnableMock, "Approval(address,address,uint256)", "Transfer(address,address,uint256)");
		});

		it("ERC20Burnable.transferFrom: Should allow token transfer and not reduce infinite allowance", async () =>
		{
			// Arrange
			await ERC20BurnableMock.mockMint(Alice.address, BigNumber.from(100));
			await ERC20BurnableMock.approve(Bob.address, UINT256_MAX);
			const expectedTotalSupply = await ERC20BurnableMock.totalSupply();
			// Act
			const result = await ERC20BurnableMock.connect(Bob).transferFrom(Alice.address, Carol.address, 10);
			// Assert
			const totalSupply = await ERC20BurnableMock.totalSupply();
			const aliceBal = await ERC20BurnableMock.balanceOf(Alice.address);
			const carolBal = await ERC20BurnableMock.balanceOf(Carol.address);
			const allowance = await ERC20BurnableMock.allowance(Alice.address, Bob.address);
			expect(totalSupply).to.equal(expectedTotalSupply);
			expect(aliceBal).to.equal(BigNumber.from(90));
			expect(carolBal).to.equal(BigNumber.from(10));
			expect(allowance).to.equal(UINT256_MAX);
			await expect(result).to.emit(ERC20BurnableMock, "Transfer(address,address,uint256)").withArgs(Alice.address, Carol.address, 10);
			await EmitOnlyThis(result, ERC20BurnableMock, "Transfer(address,address,uint256)");
		});

		it("ERC20Burnable.transferFrom: Should not allow transfer more than balance", async () =>
		{
			// Arrange
			await ERC20BurnableMock.mockMint(Alice.address, BigNumber.from(100));
			await ERC20BurnableMock.approve(Bob.address, 200);
			// Act
			const result = ERC20BurnableMock.connect(Bob).transferFrom(Alice.address, Carol.address, 110);
			// Assert
			await expect(result).to.be.revertedWith("ERC20: transfer exceeds balance");
			const aliceBal = await ERC20BurnableMock.balanceOf(Alice.address);
			const carolBal = await ERC20BurnableMock.balanceOf(Carol.address);
			const allowance = await ERC20BurnableMock.allowance(Alice.address, Bob.address);
			expect(aliceBal).to.equal(BigNumber.from(100));
			expect(carolBal).to.equal(BigNumber.from(0));
			expect(allowance).to.equal(BigNumber.from(200));
		});

		it("ERC20Burnable.transferFrom: Should not allow transfer more than allowance", async () =>
		{
			// Arrange
			await ERC20BurnableMock.mockMint(Alice.address, 100);
			await ERC20BurnableMock.approve(Bob.address, 90);
			// Act
			const result = ERC20BurnableMock.connect(Bob).transferFrom(Alice.address, Carol.address, 100);
			// Assert
			await expect(result).to.be.revertedWith("ERC20: insufficient allowance");
			const aliceBal = await ERC20BurnableMock.balanceOf(Alice.address);
			const carolBal = await ERC20BurnableMock.balanceOf(Carol.address);
			const allowance = await ERC20BurnableMock.allowance(Alice.address, Bob.address);
			expect(aliceBal).to.equal(BigNumber.from(100));
			expect(carolBal).to.equal(BigNumber.from(0));
			expect(allowance).to.equal(BigNumber.from(90));
		});
	});

	context("IERC20AltApprove", () =>
	{
		beforeEach(async () =>
		{
			// Reset values form previous tests
			await ERC20BurnableMock.burn(await ERC20BurnableMock.balanceOf(Alice.address));
			await ERC20BurnableMock.connect(Bob).burn(await ERC20BurnableMock.balanceOf(Bob.address));
			await ERC20BurnableMock.connect(Carol).burn(await ERC20BurnableMock.balanceOf(Carol.address));
			await ERC20BurnableMock.approve(Bob.address, 0);
			await ERC20BurnableMock.approve(Carol.address, 0);
			await ERC20BurnableMock.connect(Bob).approve(Alice.address, 0);
			await ERC20BurnableMock.connect(Bob).approve(Carol.address, 0);
			await ERC20BurnableMock.connect(Carol).approve(Alice.address, 0);
			await ERC20BurnableMock.connect(Carol).approve(Bob.address, 0);
		});

		it("ERC20Burnable.decreaseAllowance: Should allow token holder to change allowance", async () =>
		{
			// Arrange
			await ERC20BurnableMock.mockMint(Alice.address, BigNumber.from(100));
			await ERC20BurnableMock.increaseAllowance(Bob.address, 100);
			// Act
			const result = await ERC20BurnableMock.decreaseAllowance(Bob.address, 50);
			// Assert
			await EmitOnlyThis(result, ERC20BurnableMock, "Approval(address,address,uint256)");
			expect(await ERC20BurnableMock.allowance(Alice.address, Bob.address)).to.equal(50);
		});

		it("ERC20Burnable.decreaseAllowance: Should allow token holder to change allowance multible times", async () =>
		{
			// Arrange
			await ERC20BurnableMock.mockMint(Alice.address, BigNumber.from(100));
			await ERC20BurnableMock.increaseAllowance(Bob.address, 100);
			// Act
			await ERC20BurnableMock.decreaseAllowance(Bob.address, 50);
			await ERC20BurnableMock.decreaseAllowance(Bob.address, 10);
			await ERC20BurnableMock.decreaseAllowance(Bob.address, 20);
			// Assert
			expect(await ERC20BurnableMock.allowance(Alice.address, Bob.address)).to.equal(20);
		});

		it("ERC20Burnable.decreaseAllowance: Should not allow token holder to change allowance below 0", async () =>
		{
			// Arrange
			await ERC20BurnableMock.mockMint(Alice.address, BigNumber.from(100));
			await ERC20BurnableMock.increaseAllowance(Bob.address, 100);
			// Act
			const result = ERC20BurnableMock.decreaseAllowance(Bob.address, 101);
			// Assert
			await expect(result).to.revertedWith("ERC20: reduced allowance below 0");
			expect(await ERC20BurnableMock.allowance(Alice.address, Bob.address)).to.equal(100);
		});

		it("ERC20Burnable.increaseAllowance: Should allow token holder to change allowance", async () =>
		{
			// Arrange
			await ERC20BurnableMock.mockMint(Alice.address, BigNumber.from(100));
			// Act
			const result = await ERC20BurnableMock.increaseAllowance(Bob.address, 50);
			// Assert
			await EmitOnlyThis(result, ERC20BurnableMock, "Approval(address,address,uint256)");
			expect(await ERC20BurnableMock.allowance(Alice.address, Bob.address)).to.equal(50);
		});

		it("ERC20Burnable.increaseAllowance: Should allow token holder to change allowance above hold tokens", async () =>
		{
			// Arrange
			await ERC20BurnableMock.mockMint(Alice.address, BigNumber.from(100));
			// Act
			const result = await ERC20BurnableMock.increaseAllowance(Bob.address, 200);
			// Assert
			await EmitOnlyThis(result, ERC20BurnableMock, "Approval(address,address,uint256)");
			expect(await ERC20BurnableMock.allowance(Alice.address, Bob.address)).to.equal(200);
		});

		it("ERC20Burnable.increaseAllowance: Should allow token holder to change allowance multible times", async () =>
		{
			// Arrange
			await ERC20BurnableMock.mockMint(Alice.address, BigNumber.from(100));
			// Act
			await ERC20BurnableMock.increaseAllowance(Bob.address, 50);
			await ERC20BurnableMock.increaseAllowance(Bob.address, 10);
			await ERC20BurnableMock.increaseAllowance(Bob.address, 20);
			// Assert
			expect(await ERC20BurnableMock.allowance(Alice.address, Bob.address)).to.equal(80);
		});
	});

	context("IERC20Metadata", () =>
	{
		beforeEach(async () =>
		{
			// Reset values form previous tests
			await ERC20BurnableMock.burn(await ERC20BurnableMock.balanceOf(Alice.address));
			await ERC20BurnableMock.connect(Bob).burn(await ERC20BurnableMock.balanceOf(Bob.address));
			await ERC20BurnableMock.connect(Carol).burn(await ERC20BurnableMock.balanceOf(Carol.address));
			await ERC20BurnableMock.approve(Bob.address, 0);
			await ERC20BurnableMock.approve(Carol.address, 0);
			await ERC20BurnableMock.connect(Bob).approve(Alice.address, 0);
			await ERC20BurnableMock.connect(Bob).approve(Carol.address, 0);
			await ERC20BurnableMock.connect(Carol).approve(Alice.address, 0);
			await ERC20BurnableMock.connect(Carol).approve(Bob.address, 0);
		});

		it("ERC20Burnable.decimals: Should return correct decimals", async () =>
		{
			// Arrange
			// Act
			const decimals: number = await ERC20BurnableMock.decimals();
			// Assert
			expect(decimals).to.equal(18);
		});

		it("ERC20Burnable.name: Should return correct name", async () =>
		{
			// Arrange
			// Act
			const result = await ERC20BurnableMock.name();
			// Assert
			expect(result).to.equal("Name");
		});

		it("ERC20Burnable.symbol: Should return correct symbol", async () =>
		{
			// Arrange
			// Act
			const result = await ERC20BurnableMock.symbol();
			// Assert
			expect(result).to.equal("SYM");
		});
	});
});
