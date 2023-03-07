import { ethers } from "hardhat";
import { expect } from "chai";
import { BigNumber } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ERC20Mock } from "../../../typechain-types";
import { ADDRESS_ZERO, AdvanceBlock, EmitOnlyThis, StartAutomine, StopAutomine, UINT256_MAX } from "../../helpers";

// * Unit tests are grouped in contexts.
// * Ever group represents an derived class or interface.
// * Contexts are named after the imported class or interface.
// * Unit tests covering class specific functionality are put in the context "this".
// * Contexts are ordered alphabetically.
// * Tests are ordered by the function name. After that the order should be "Should emit->Should allow/return->Should not allow".
describe("ERC20", () =>
{
	let Alice: SignerWithAddress;
	let Bob: SignerWithAddress;
	let Carol: SignerWithAddress;
	let ERC20Mock: ERC20Mock;

	before(async () =>
	{
		const signers = await ethers.getSigners();
		Alice = signers[0];
		Bob = signers[1];
		Carol = signers[2];
		const erc20Factory = await ethers.getContractFactory("ERC20Mock");
		ERC20Mock = await erc20Factory.deploy("Name", "SYM");
	});

	context("Mock", () =>
	{
		// This is just to prove that the mocked _burn function is working.
		it("ERC20.mockBurn: Should allow burn of tokens", async () =>
		{
			// Arrange
			const expectedTotalSupply = (await ERC20Mock.totalSupply()).add(100).sub(10);
			const expectedBalance = (await ERC20Mock.balanceOf(Alice.address)).add(100).sub(10);
			await ERC20Mock.mockMint(Alice.address, 100);
			// Act
			const result = await ERC20Mock.mockBurn(Alice.address, 10);
			// Assert
			await expect(result).to.emit(ERC20Mock, "Transfer(address,address,uint256)").withArgs(Alice.address, ADDRESS_ZERO, 10);
			await EmitOnlyThis(result, ERC20Mock, "Transfer(address,address,uint256)");
			expect(await ERC20Mock.totalSupply()).to.equal(expectedTotalSupply);
			expect(await ERC20Mock.balanceOf(Alice.address)).to.equal(expectedBalance);
		});

		// This is just to prove that the mocked _burn function is working.
		it("ERC20.mockBurn: Should not allow burn of zero address", async () =>
		{
			// Arrange
			// Act
			const result = ERC20Mock.mockBurn(ADDRESS_ZERO, 1);
			// Assert
			await expect(result).to.be.revertedWith("ERC20: burn from address(0)");
		});

		// This is just to prove that the mocked _burn function is working.
		it("ERC20.mockBurn: Should not allow burn more tokens than owned", async () =>
		{
			// Arrange
			const balance = (await ERC20Mock.balanceOf(Alice.address)).add(100).add(1);
			await ERC20Mock.mockMint(Alice.address, 100);
			// Act
			const result = ERC20Mock.mockBurn(Alice.address, balance);
			// Assert
			await expect(result).to.be.revertedWith("ERC20: burn exceeds balance");
		});

		// This is just to prove that the mocked _mint function is working.
		it("ERC20.mockMint: Should allow mint of tokens", async () =>
		{
			// Arrange
			const expectedBalance = (await ERC20Mock.balanceOf(Alice.address)).add(1);
			const expectedTotalSupply = (await ERC20Mock.totalSupply()).add(1);
			// Act
			const result = await ERC20Mock.mockMint(Alice.address, 1);
			// Assert
			await expect(result).to.emit(ERC20Mock, "Transfer(address,address,uint256)").withArgs(ADDRESS_ZERO, Alice.address, 1);
			await EmitOnlyThis(result, ERC20Mock, "Transfer(address,address,uint256)");
			expect(await ERC20Mock.totalSupply()).to.equal(expectedTotalSupply);
			expect(await ERC20Mock.balanceOf(Alice.address)).to.equal(expectedBalance);
		});

		// This is just to prove that the mocked _mint function is working.
		it("ERC20.mockMint: Should not allow mint on zero address", async () =>
		{
			// Arrange
			// Act
			const result = ERC20Mock.mockMint(ADDRESS_ZERO, 1);
			// Assert
			await expect(result).to.be.revertedWith("ERC20: mint to address(0)");
		});
	});

	context("this", () =>
	{
		it("ERC20.constructor: Should emit nothing", async () =>
		{
			// NOTICE: We use the original ERC20Mock for this in case the mock does modify the constructor
			// and for the ERC20Mock to show up in the Deployments section of `npm run test:gas`.
			// Arrange
			const factory = await ethers.getContractFactory("ERC20");
			const originalERC20Mock = await factory.deploy("Original", "OOO");
			await originalERC20Mock.deployed();
			// Act
			const result = originalERC20Mock.deployTransaction;
			// Assert
			await EmitOnlyThis(result, originalERC20Mock);
		});

		it("ERC20.approve: Should not allow set of approval from zero address", async () =>
		{
			// Arrange
			// Act
			const result = ERC20Mock.mockApproveFromZeroAddress(Alice.address, 10);
			// Assert
			await expect(result).to.be.revertedWith("ERC20: approve from address(0)");
		});

		it("ERC20.approve: Should not allow set of approval to zero address", async () =>
		{
			// Arrange
			// Act
			const result = ERC20Mock.approve(ADDRESS_ZERO, 10);
			// Assert
			await expect(result).to.be.revertedWith("ERC20: approve to address(0)");
		});

		it("ERC20.approve: Should emit `Approval` event", async () =>
		{
			// Arrange
			// Act
			const result = await ERC20Mock.approve(Bob.address, 10);
			// Assert
			await expect(result).to.emit(ERC20Mock, "Approval(address,address,uint256)").withArgs(Alice.address, Bob.address, 10);
			await EmitOnlyThis(result, ERC20Mock, "Approval(address,address,uint256)");
		});

		it("ERC20.approve: Should allow set of approval", async () =>
		{
			// Arrange
			// Act
			const result = await ERC20Mock.approve(Bob.address, 10);
			// Assert
			const approved = await ERC20Mock.allowance(Alice.address, Bob.address);
			expect(approved).to.equal(BigNumber.from(10));
			await expect(result).to.emit(ERC20Mock, "Approval(address,address,uint256)").withArgs(Alice.address, Bob.address, 10);
			await EmitOnlyThis(result, ERC20Mock, "Approval(address,address,uint256)");
		});

		it("ERC20.approve: Proof of unfixable approve/transferFrom attack vector", async () =>
		{
			// Arrange
			await ERC20Mock.mockBurn(Alice.address, await ERC20Mock.balanceOf(Alice.address));
			await ERC20Mock.approve(Bob.address, 0);
			await ERC20Mock.mockMint(Alice.address, 100);
			const expectedBalanceAlice = (await ERC20Mock.balanceOf(Alice.address)).sub(50).sub(30);
			const expectedBalanceBob = (await ERC20Mock.balanceOf(Bob.address)).add(50).add(30);
			// Act
			await ERC20Mock.approve(Bob.address, 50);
			await StopAutomine();
			// What happens is that Alice is changing the approved tokens from 50 to 30.
			// Bob notice this before the Transaction of Alice is confirmed and added his on transferFrom transaction.
			// The attack is successfull if the transferFrom transaction is confirmed before the approve transaction or
			// if confirmed in the same block the transferFrom transaction is processed first.
			// We simulate that second case.
			await ERC20Mock.connect(Bob).transferFrom(Alice.address, Bob.address, 50);
			await ERC20Mock.approve(Bob.address, 30);
			await AdvanceBlock();
			// The Damange is now done. There is no way to prevent this inside the approve method.
			await StartAutomine();
			await ERC20Mock.connect(Bob).transferFrom(Alice.address, Bob.address, 30);
			// Assert
			expect(await ERC20Mock.balanceOf(Alice.address)).to.equal(expectedBalanceAlice);
			expect(await ERC20Mock.balanceOf(Bob.address)).to.equal(expectedBalanceBob);
		});

		it("ERC20.transfer: Should emit `Transfer` event", async () =>
		{
			// Arrange
			await ERC20Mock.mockBurn(Alice.address, await ERC20Mock.balanceOf(Alice.address));
			await ERC20Mock.mockMint(Alice.address, 100);
			// Act
			const result = await ERC20Mock.transfer(Carol.address, 10);
			// Assert
			await expect(result).to.emit(ERC20Mock, "Transfer(address,address,uint256)").withArgs(Alice.address, Carol.address, 10);
			await EmitOnlyThis(result, ERC20Mock, "Transfer(address,address,uint256)");
		});

		it("ERC20.transfer: Should allow token transfer", async () =>
		{
			// Arrange
			await ERC20Mock.mockBurn(Alice.address, await ERC20Mock.balanceOf(Alice.address));
			await ERC20Mock.mockBurn(Carol.address, await ERC20Mock.balanceOf(Carol.address));
			await ERC20Mock.mockMint(Alice.address, 100);
			const expectedBalanceAlice = BigNumber.from(100).sub(10);
			const expectedBalanceCarol = BigNumber.from(0).add(10);
			const expectedTotalSupply = await ERC20Mock.totalSupply();
			// Act
			const result = await ERC20Mock.transfer(Carol.address, 10);
			// Assert
			const totalSupply = await ERC20Mock.totalSupply();
			const aliceBal = await ERC20Mock.balanceOf(Alice.address);
			const carolBal = await ERC20Mock.balanceOf(Carol.address);
			expect(totalSupply).to.equal(expectedTotalSupply);
			expect(aliceBal).to.equal(expectedBalanceAlice);
			expect(carolBal).to.equal(expectedBalanceCarol);
			await EmitOnlyThis(result, ERC20Mock, "Transfer(address,address,uint256)");
		});

		it("ERC20.transfer: Should not allow transfer from zero address", async () =>
		{
			// Arrange
			await ERC20Mock.mockMint(Alice.address, 100);
			// Act
			const result = ERC20Mock.mockTransferFromZeroAddress(Alice.address, 10);
			// Assert
			await expect(result).to.be.revertedWith("ERC20: transfer from address(0)");
		});

		it("ERC20.transfer: Should not allow transfer to zero address", async () =>
		{
			// Arrange
			await ERC20Mock.mockMint(Alice.address, 100);
			// Act
			const result = ERC20Mock.transfer(ADDRESS_ZERO, 10);
			// Assert
			await expect(result).to.be.revertedWith("ERC20: transfer to address(0)");
		});

		it("ERC20.transfer: Should not allow transfer more than balance", async () =>
		{
			// Arrange
			await ERC20Mock.mockMint(Alice.address, 100);
			const balanceAlice = (await ERC20Mock.balanceOf(Alice.address));
			const balanceCarol = (await ERC20Mock.balanceOf(Carol.address));
			// Act
			const result = ERC20Mock.transfer(Carol.address, balanceAlice.add(10));
			// Assert
			await expect(result).to.be.revertedWith("ERC20: transfer exceeds balance");
			const aliceBal = await ERC20Mock.balanceOf(Alice.address);
			const carolBal = await ERC20Mock.balanceOf(Carol.address);
			expect(aliceBal).to.equal(balanceAlice);
			expect(carolBal).to.equal(balanceCarol);
		});

		it("ERC20.transferFrom: Should emit `Transfer` and `Approval` event", async () =>
		{
			// Arrange
			await ERC20Mock.mockMint(Alice.address, 100);
			await ERC20Mock.approve(Bob.address, 50);
			// Act
			const result = await ERC20Mock.connect(Bob).transferFrom(Alice.address, Carol.address, 10);
			// Assert
			await expect(result).to.emit(ERC20Mock, "Approval(address,address,uint256)").withArgs(Alice.address, Bob.address, 40);
			await expect(result).to.emit(ERC20Mock, "Transfer(address,address,uint256)").withArgs(Alice.address, Carol.address, 10);
			await EmitOnlyThis(result, ERC20Mock, "Approval(address,address,uint256)", "Transfer(address,address,uint256)");
		});

		it("ERC20.transferFrom: Should allow token transfer and reduce allowance", async () =>
		{
			// Arrange
			await ERC20Mock.mockMint(Alice.address, 100);
			const expectedBalanceAlice = (await ERC20Mock.balanceOf(Alice.address)).sub(10);
			const expectedBalanceCarol = (await ERC20Mock.balanceOf(Carol.address)).add(10);
			const expectedTotalSupply = (await ERC20Mock.totalSupply());
			await ERC20Mock.approve(Bob.address, 50);
			// Act
			const result = await ERC20Mock.connect(Bob).transferFrom(Alice.address, Carol.address, 10);
			// Assert
			const totalSupply = await ERC20Mock.totalSupply();
			const aliceBal = await ERC20Mock.balanceOf(Alice.address);
			const carolBal = await ERC20Mock.balanceOf(Carol.address);
			const allowance = await ERC20Mock.allowance(Alice.address, Bob.address);
			expect(totalSupply).to.equal(expectedTotalSupply);
			expect(aliceBal).to.equal(expectedBalanceAlice);
			expect(carolBal).to.equal(expectedBalanceCarol);
			expect(allowance).to.equal(BigNumber.from(40));
			await expect(result).to.emit(ERC20Mock, "Approval(address,address,uint256)").withArgs(Alice.address, Bob.address, 40);
			await expect(result).to.emit(ERC20Mock, "Transfer(address,address,uint256)").withArgs(Alice.address, Carol.address, 10);
			await EmitOnlyThis(result, ERC20Mock, "Approval(address,address,uint256)", "Transfer(address,address,uint256)");
		});

		it("ERC20.transferFrom: Should allow token transfer and not reduce infinite allowance", async () =>
		{
			// Arrange
			const max: BigNumber = UINT256_MAX;
			await ERC20Mock.mockMint(Alice.address, 100);
			const expectedBalanceAlice = (await ERC20Mock.balanceOf(Alice.address)).sub(10);
			const expectedBalanceCarol = (await ERC20Mock.balanceOf(Carol.address)).add(10);
			const expectedTotalSupply = (await ERC20Mock.totalSupply());
			await ERC20Mock.approve(Bob.address, max);
			// Act
			const result = await ERC20Mock.connect(Bob).transferFrom(Alice.address, Carol.address, 10);
			// Assert
			const totalSupply = await ERC20Mock.totalSupply();
			const aliceBal = await ERC20Mock.balanceOf(Alice.address);
			const carolBal = await ERC20Mock.balanceOf(Carol.address);
			const allowance = await ERC20Mock.allowance(Alice.address, Bob.address);
			expect(totalSupply).to.equal(expectedTotalSupply);
			expect(aliceBal).to.equal(expectedBalanceAlice);
			expect(carolBal).to.equal(expectedBalanceCarol);
			expect(allowance).to.equal(max);
			await expect(result).to.emit(ERC20Mock, "Transfer(address,address,uint256)").withArgs(Alice.address, Carol.address, 10);
			await EmitOnlyThis(result, ERC20Mock, "Transfer(address,address,uint256)");
		});

		it("ERC20.transferFrom: Should not allow transfer more than balance", async () =>
		{
			// Arrange
			await ERC20Mock.mockMint(Alice.address, 100);
			const expectedBalanceAlice = await ERC20Mock.balanceOf(Alice.address);
			const expectedBalanceCarol = await ERC20Mock.balanceOf(Carol.address);
			const expectedAllowance = expectedBalanceAlice.add(200);
			await ERC20Mock.approve(Bob.address, expectedAllowance);
			// Act
			const result = ERC20Mock.connect(Bob).transferFrom(Alice.address, Carol.address, expectedBalanceAlice.add(10));
			// Assert
			await expect(result).to.be.revertedWith("ERC20: transfer exceeds balance");
			const aliceBal = await ERC20Mock.balanceOf(Alice.address);
			const carolBal = await ERC20Mock.balanceOf(Carol.address);
			const allowance = await ERC20Mock.allowance(Alice.address, Bob.address);
			expect(aliceBal).to.equal(expectedBalanceAlice);
			expect(carolBal).to.equal(expectedBalanceCarol);
			expect(allowance).to.equal(expectedAllowance);
		});

		it("ERC20.transferFrom: Should not allow transfer more than allowance", async () =>
		{
			// Arrange
			await ERC20Mock.mockMint(Alice.address, 100);
			const expectedBalanceAlice = await ERC20Mock.balanceOf(Alice.address);
			const expectedBalanceCarol = await ERC20Mock.balanceOf(Carol.address);
			await ERC20Mock.approve(Bob.address, 90);
			// Act
			const result = ERC20Mock.connect(Bob).transferFrom(Alice.address, Carol.address, 100);
			// Assert
			await expect(result).to.be.revertedWith("ERC20: insufficient allowance");
			const aliceBal = await ERC20Mock.balanceOf(Alice.address);
			const carolBal = await ERC20Mock.balanceOf(Carol.address);
			const allowance = await ERC20Mock.allowance(Alice.address, Bob.address);
			expect(aliceBal).to.equal(expectedBalanceAlice);
			expect(carolBal).to.equal(expectedBalanceCarol);
			expect(allowance).to.equal(BigNumber.from(90));
		});
	});

	context("IERC20AltApprove", () =>
	{
		it("ERC20.decreaseAllowance: Should allow token holder to change allowance", async () =>
		{
			// Arrange
			await ERC20Mock.increaseAllowance(Bob.address, 100);
			const expectedAllowance = (await ERC20Mock.allowance(Alice.address, Bob.address)).sub(50);
			// Act
			const result = await ERC20Mock.decreaseAllowance(Bob.address, 50);
			// Assert
			await EmitOnlyThis(result, ERC20Mock, "Approval(address,address,uint256)");
			expect(await ERC20Mock.allowance(Alice.address, Bob.address)).to.equal(expectedAllowance);
		});

		it("ERC20.decreaseAllowance: Should allow token holder to change allowance multible times", async () =>
		{
			// Arrange
			await ERC20Mock.increaseAllowance(Bob.address, 100);
			const expectedAllowance = (await ERC20Mock.allowance(Alice.address, Bob.address)).sub(50).sub(10).sub(20);
			// Act
			await ERC20Mock.decreaseAllowance(Bob.address, 50);
			await ERC20Mock.decreaseAllowance(Bob.address, 10);
			await ERC20Mock.decreaseAllowance(Bob.address, 20);
			// Assert
			expect(await ERC20Mock.allowance(Alice.address, Bob.address)).to.equal(expectedAllowance);
		});

		it("ERC20.decreaseAllowance: Should not allow token holder to change allowance below 0", async () =>
		{
			// Arrange
			await ERC20Mock.increaseAllowance(Bob.address, 100);
			const allowance = await ERC20Mock.allowance(Alice.address, Bob.address);
			const expectedAllowance = allowance;

			// Act
			const result = ERC20Mock.decreaseAllowance(Bob.address, allowance.add(1));
			// Assert
			await expect(result).to.revertedWith("ERC20: reduced allowance below 0");
			expect(await ERC20Mock.allowance(Alice.address, Bob.address)).to.equal(expectedAllowance);
		});

		it("ERC20.increaseAllowance: Should allow token holder to change allowance", async () =>
		{
			// Arrange
			await ERC20Mock.mockMint(Alice.address, 100); // ensure that tokens < allowance
			const expectedAllowance = (await ERC20Mock.allowance(Alice.address, Bob.address)).add(50);
			// Act
			const result = await ERC20Mock.increaseAllowance(Bob.address, 50);
			// Assert
			await EmitOnlyThis(result, ERC20Mock, "Approval(address,address,uint256)");
			expect(await ERC20Mock.allowance(Alice.address, Bob.address)).to.equal(expectedAllowance);
		});

		it("ERC20.increaseAllowance: Should allow token holder to change allowance above hold tokens", async () =>
		{
			// Arrange
			await ERC20Mock.mockBurn(Alice.address, await ERC20Mock.balanceOf(Alice.address));
			await ERC20Mock.mockMint(Alice.address, 100);
			await ERC20Mock.approve(Bob.address, 0);
			const expectedAllowance = (await ERC20Mock.balanceOf(Alice.address)).add(100);
			// Act
			const result = await ERC20Mock.increaseAllowance(Bob.address, expectedAllowance);
			// Assert
			await EmitOnlyThis(result, ERC20Mock, "Approval(address,address,uint256)");
			expect(await ERC20Mock.allowance(Alice.address, Bob.address)).to.equal(expectedAllowance);
		});

		it("ERC20.increaseAllowance: Should allow token holder to change allowance multible times", async () =>
		{
			// Arrange
			await ERC20Mock.mockBurn(Alice.address, await ERC20Mock.balanceOf(Alice.address));
			await ERC20Mock.approve(Bob.address, 0);
			await ERC20Mock.mockMint(Alice.address, 100);
			const expectedAllowance = BigNumber.from(80);
			// Act
			await ERC20Mock.increaseAllowance(Bob.address, 50);
			await ERC20Mock.increaseAllowance(Bob.address, 10);
			await ERC20Mock.increaseAllowance(Bob.address, 20);
			// Assert
			expect(await ERC20Mock.allowance(Alice.address, Bob.address)).to.equal(expectedAllowance);
		});
	});

	context("IERC20Metadata", async () =>
	{
		it("ERC20.decimals: Should return correct decimals", async () =>
		{
			// Arrange
			// Act
			const decimals: number = await ERC20Mock.decimals();
			// Assert
			expect(decimals).to.equal(18);
		});

		it("ERC20.name: Should return correct name", async () =>
		{
			// Arrange
			// Act
			const result = await ERC20Mock.name();
			// Assert
			expect(result).to.equal("Name");
		});

		it("ERC20.symbol: Should return correct symbol", async () =>
		{
			// Arrange
			// Act
			const result = await ERC20Mock.symbol();
			// Assert
			expect(result).to.equal("SYM");
		});
	});
});
