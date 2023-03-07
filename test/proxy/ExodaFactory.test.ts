import { ethers } from "hardhat";
import { expect } from "chai";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ExodaFactory, ProxyMasterMock } from "../../typechain-types";
import { BigNumber } from "ethers";
import { ADDRESS_ZERO, EmitOnlyThis } from "../helpers";

// * Unit tests are grouped in contexts.
// * Ever group represents an derived class or interface.
// * Contexts are named after the imported class or interface.
// * Unit tests covering class specific functionality are put in the context "this".
// * Contexts are ordered alphabetically.
// * Tests are ordered by the function name. After that the order should be "Should emit->Should allow/return->Should not allow".
describe("ExodaFactory", () =>
{
	let ProxyMasterMock: ProxyMasterMock;
	let ExodaFactory: ExodaFactory;
	let Alice: SignerWithAddress;

	before(async () =>
	{
		const signers = await ethers.getSigners();
		Alice = signers[0];
		const erc20Factory = await ethers.getContractFactory("ProxyMasterMock");
		ProxyMasterMock = await erc20Factory.deploy();
	});

	beforeEach(async () =>
	{
		// We need a new proxy for each test.
		const exodaFactory = await ethers.getContractFactory("ExodaFactory");
		ExodaFactory = await exodaFactory.deploy();
	});

	context("this", () =>
	{
		it("ExodaFactory.deploy: Should not deploy zero address", async () =>
		{
			// Arrange
			const data = new Uint8Array(3);
			data[0] = 0x00;
			data[1] = 0x01;
			data[2] = 0x02;
			// Act
			const result = ExodaFactory.deploy(ADDRESS_ZERO, data, false, { value: "100000000000000000" });
			// Assert
			await expect(result).to.revertedWith("ExodaFactory: No master contract");
		});

		it("ExodaFactory.deploy: Should deploy clone with create", async () =>
		{
			// Arrange
			const data = new Uint8Array(3);
			data[0] = 0x00;
			data[1] = 0x01;
			data[2] = 0x02;
			// Act
			const result = await ExodaFactory.deploy(ProxyMasterMock.address, data, false, { value: "100000000000000000" });
			// Assert
			const cloneAddresses = await ExodaFactory.clonesOf(ProxyMasterMock.address);
			await expect(result).to.emit(ExodaFactory, "LogDeploy(address,bytes,address)").withArgs(ProxyMasterMock.address, "0x000102", cloneAddresses[0]);
			await EmitOnlyThis(result, ExodaFactory, "LogDeploy(address,bytes,address)");
			expect(await ExodaFactory.clonesOfCount(ProxyMasterMock.address)).to.equal(1);
			expect(await ExodaFactory.masterOf(cloneAddresses[0])).to.equal(ProxyMasterMock.address);
		});

		it("ExodaFactory.deploy: Should deploy clone with create2", async () =>
		{
			// Arrange
			const data = new Uint8Array(3);
			data[0] = 0x00;
			data[1] = 0x01;
			data[2] = 0x02;
			// Act
			const result = await ExodaFactory.deploy(ProxyMasterMock.address, data, false, { value: "100000000000000000" });
			// Assert
			const cloneAddresses = await ExodaFactory.clonesOf(ProxyMasterMock.address);
			await expect(result).to.emit(ExodaFactory, "LogDeploy(address,bytes,address)").withArgs(ProxyMasterMock.address, "0x000102", cloneAddresses[0]);
			await EmitOnlyThis(result, ExodaFactory, "LogDeploy(address,bytes,address)");
			expect(await ExodaFactory.clonesOfCount(ProxyMasterMock.address)).to.equal(1);
			expect(await ExodaFactory.masterOf(cloneAddresses[0])).to.equal(ProxyMasterMock.address);
		});

		it("ExodaFactory.deploy: Should fail on deploy clone with create2 on same address", async () =>
		{
			// Arrange
			const data = new Uint8Array(3);
			data[0] = 0x00;
			data[1] = 0x01;
			data[2] = 0x02;
			// Act
			await ExodaFactory.deploy(ProxyMasterMock.address, data, true, { value: "100000000000000000" });
			const trans = ExodaFactory.deploy(ProxyMasterMock.address, data, true, { value: "100000000000000000" });
			// Assert
			await expect(trans).to.revertedWithoutReason();
		});

		it("ExodaFactory.deploy: Proof that init is called", async () =>
		{
			// Arrange
			const data = new Uint8Array(3);
			data[0] = 0x00;
			data[1] = 0x01;
			data[2] = 0x02;
			// Act
			await ExodaFactory.deploy(ProxyMasterMock.address, data, false, { value: "100000000000000000" });
			// Assert
			const cloneAddresses = await ExodaFactory.clonesOf(ProxyMasterMock.address);
			const clone1: ProxyMasterMock = await ethers.getContractAt("ProxyMasterMock", cloneAddresses[0]);

			expect(await ExodaFactory.clonesOfCount(ProxyMasterMock.address)).to.equal(1);
			expect(await clone1.value1()).to.equal(100);
			expect(await clone1.value2(ExodaFactory.address)).to.equal(200);
			expect(await clone1.value3()).to.equal("0x000102");
		});

		it("ExodaFactory.deploy: Proof that each create clone holds its own value", async () =>
		{
			// Arrange
			const data = new Uint8Array(3);
			data[0] = 0x00;
			data[1] = 0x01;
			data[2] = 0x02;
			await ExodaFactory.deploy(ProxyMasterMock.address, data, false, { value: "100000000000000000" });
			await ExodaFactory.deploy(ProxyMasterMock.address, data, false, { value: "200000000000000000" });
			const cloneAddresses = await ExodaFactory.clonesOf(ProxyMasterMock.address);
			const clone1: ProxyMasterMock = await ethers.getContractAt("ProxyMasterMock", cloneAddresses[0]);
			const clone2: ProxyMasterMock = await ethers.getContractAt("ProxyMasterMock", cloneAddresses[1]);
			// Act
			await clone1.setValues(10, Alice.address, 20, "0x405060");
			await clone2.setValues(70, Alice.address, 80, "0x900010");
			// Assert
			const c1Balance = await ethers.provider.getBalance(clone1.address);
			const c2Balance = await ethers.provider.getBalance(clone2.address);
			expect(c1Balance).to.equal(BigNumber.from("100000000000000000"));
			expect(c2Balance).to.equal(BigNumber.from("200000000000000000"));
			expect(await ExodaFactory.clonesOfCount(ProxyMasterMock.address)).to.equal(2);
			expect(await clone1.value1()).to.equal(10);
			expect(await clone1.value2(Alice.address)).to.equal(20);
			expect(await clone1.value2(ExodaFactory.address)).to.equal(200);
			expect(await clone1.value3()).to.equal("0x405060");
			expect(await clone2.value1()).to.equal(70);
			expect(await clone2.value2(Alice.address)).to.equal(80);
			expect(await clone2.value2(ExodaFactory.address)).to.equal(200);
			expect(await clone2.value3()).to.equal("0x900010");
		});

		it("ExodaFactory.deploy: Proof that each create2 clone holds its own value", async () =>
		{
			// Arrange
			const data = new Uint8Array(3);
			data[0] = 0x00;
			data[1] = 0x01;
			data[2] = 0x02;
			await ExodaFactory.deploy(ProxyMasterMock.address, "0x000102", true, { value: "100000000000000000" });
			await ExodaFactory.deploy(ProxyMasterMock.address, "0x000103", true, { value: "200000000000000000" });
			const cloneAddresses = await ExodaFactory.clonesOf(ProxyMasterMock.address);
			const clone1: ProxyMasterMock = await ethers.getContractAt("ProxyMasterMock", cloneAddresses[0]);
			const clone2: ProxyMasterMock = await ethers.getContractAt("ProxyMasterMock", cloneAddresses[1]);
			// Act
			await clone1.setValues(10, Alice.address, 20, "0x405060");
			await clone2.setValues(70, Alice.address, 80, "0x900010");
			// Assert
			const c1Balance = await ethers.provider.getBalance(clone1.address);
			const c2Balance = await ethers.provider.getBalance(clone2.address);
			expect(c1Balance).to.equal(BigNumber.from("100000000000000000"));
			expect(c2Balance).to.equal(BigNumber.from("200000000000000000"));
			expect(await ExodaFactory.clonesOfCount(ProxyMasterMock.address)).to.equal(2);
			expect(await clone1.value1()).to.equal(10);
			expect(await clone1.value2(Alice.address)).to.equal(20);
			expect(await clone1.value2(ExodaFactory.address)).to.equal(200);
			expect(await clone1.value3()).to.equal("0x405060");
			expect(await clone2.value1()).to.equal(70);
			expect(await clone2.value2(Alice.address)).to.equal(80);
			expect(await clone2.value2(ExodaFactory.address)).to.equal(200);
			expect(await clone2.value3()).to.equal("0x900010");
		});
	});
});
