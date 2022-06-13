/* eslint-disable node/no-unpublished-import */
import { ethers } from "hardhat";
import { expect } from "chai";
import { ContractFactory } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ADDRESS_ZERO, EmitOnlyThis } from "../helpers";
import { IOwnable } from "../../typechain-types";

// * Unit tests are grouped in contexts.
// * Ever group represents an derived class or interface.
// * Contexts are named after the imported class or interface.
// * Unit tests covering class specific functionality are put in the context "this".
// * Contexts are ordered alphabetically.
// * Tests are ordered by the function name. After that the order should be "Should emit->Should allow->Should not allow".
describe("Ownable", () =>
{
	let OwnableFactory: ContractFactory;
	let Signers: SignerWithAddress[];
	let Alice: SignerWithAddress;
	let Bob: SignerWithAddress;
	let Carol: SignerWithAddress;
	let Ownable: IOwnable;

	before(async () =>
	{
		OwnableFactory = await ethers.getContractFactory("Ownable");
		Signers = await ethers.getSigners();
		Alice = Signers[0];
		Bob = Signers[1];
		Carol = Signers[2];
	});

	context("this", async () =>
	{
		beforeEach(async () =>
		{
			Ownable = (await OwnableFactory.deploy()) as IOwnable;
			await Ownable.deployed();
		});

		it("Ownable.constructor: Should emit `OwnershipTransferred` event", async () =>
		{
			// Arrange
			// Act
			const result = Ownable.deployTransaction;
			// Assert
			await expect(result).to.emit(Ownable, "OwnershipTransferred(address,address)").withArgs(ADDRESS_ZERO, Alice.address);
			await EmitOnlyThis(result, Ownable, "OwnershipTransferred(address,address)");
		});

		it("Ownable.constructor: Should set creator as owner", async () =>
		{
			// Arrange
			// Act
			const resultOwner = await Ownable.owner();
			// Assert
			expect(resultOwner).to.equal(Alice.address);
			await expect(Ownable.deployTransaction).to.emit(Ownable, "OwnershipTransferred(address,address)").withArgs(ADDRESS_ZERO, Alice.address);
			await EmitOnlyThis(Ownable.deployTransaction, Ownable, "OwnershipTransferred(address,address)");
		});

		it("Ownable.owner: Should get current owner", async () =>
		{
			// Arrange
			// Act
			const resultOwnerAlice = await Ownable.owner();
			await Ownable.transferOwnership(Bob.address);
			const resultOwnerBob = await Ownable.owner();
			// Assert
			expect(resultOwnerAlice).to.equal(Alice.address);
			expect(resultOwnerBob).to.equal(Bob.address);
		});

		it("Ownable.renounceOwnership: Should emit `OwnershipTransferred` event", async () =>
		{
			// Arrange
			// Act
			const result = await Ownable.renounceOwnership();
			// Assert
			await expect(result).to.emit(Ownable, "OwnershipTransferred(address,address)").withArgs(Alice.address, ADDRESS_ZERO);
			await EmitOnlyThis(result, Ownable, "OwnershipTransferred(address,address)");
		});

		it("Ownable.renounceOwnership: Should let owner renounce ownership", async () =>
		{
			// Arrange
			// Act
			const result = await Ownable.renounceOwnership();
			// Assert
			expect(await Ownable.owner()).to.equal(ADDRESS_ZERO);
			await expect(result).to.emit(Ownable, "OwnershipTransferred(address,address)").withArgs(Alice.address, ADDRESS_ZERO);
			await EmitOnlyThis(result, Ownable, "OwnershipTransferred(address,address)");
		});

		it("Ownable.renounceOwnership: Should not let non-owner renounce ownership", async () =>
		{
			// Arrange
			// Act
			const result = Ownable.connect(Bob).renounceOwnership();
			// Assert
			await expect(result).to.revertedWith("Ownable: caller is not the owner");
			expect(await Ownable.owner()).to.equal(Alice.address);
		});

		it("Ownable.transferOwnership: Should emit `OwnershipTransferred` event", async () =>
		{
			// Arrange
			// Act
			const result = await Ownable.transferOwnership(Bob.address);
			// Assert
			await expect(result).to.emit(Ownable, "OwnershipTransferred(address,address)").withArgs(Alice.address, Bob.address);
			await EmitOnlyThis(result, Ownable, "OwnershipTransferred(address,address)");
		});

		it("Ownable.transferOwnership: Should let owner transfer ownership", async () =>
		{
			// Arrange
			// Act
			const result = await Ownable.transferOwnership(Bob.address);
			// Assert
			expect(await Ownable.owner()).to.equal(Bob.address);
			await expect(result).to.emit(Ownable, "OwnershipTransferred(address,address)").withArgs(Alice.address, Bob.address);
			await EmitOnlyThis(result, Ownable, "OwnershipTransferred(address,address)");
		});

		it("Ownable.transferOwnership: Should not let owner transfer ownership to zero address", async () =>
		{
			// Arrange
			// Act
			const result = Ownable.transferOwnership(ADDRESS_ZERO);
			// Assert
			await expect(result).to.revertedWith("Ownable: new owner is address(0)");
			expect(await Ownable.owner()).to.equal(Alice.address);
		});

		it("Ownable.transferOwnership: Should not let non-owner transfer ownership", async () =>
		{
			// Arrange
			// Act
			const result = Ownable.connect(Carol).transferOwnership(Bob.address);
			// Assert
			await expect(result).to.revertedWith("Ownable: caller is not the owner");
			expect(await Ownable.owner()).to.equal(Alice.address);
		});
	});
});
