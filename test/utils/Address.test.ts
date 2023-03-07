import { expect } from "chai";
import { ethers } from "hardhat";
import { BigNumber } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { AddressMock, ICallReceiverMock } from "../../typechain-types";

describe("Address", () =>
{
	let Alice:SignerWithAddress;
	let Address:AddressMock;

	before(async () =>
	{
		const signers = await ethers.getSigners();
		Alice = signers[0];

		const addressFactory = await ethers.getContractFactory("AddressMock");
		Address = await addressFactory.deploy();
	});

	context("this", () =>
	{
		it("Address.isContract: Should return false for account address", async () =>
		{
			expect(await Address.isContract(Alice.address)).to.equal(false);
		});

		it("Address.isContract: Should returns true for contract address", async () =>
		{
			expect(await Address.isContract(Address.address)).to.equal(true);
		});

		it("Address.functionCall: Should call the requested function", async () =>
		{
			const CallReceiverMockFactory = await ethers.getContractFactory("CallReceiverMock");
			const CallReceiverMock = (await CallReceiverMockFactory.deploy()) as ICallReceiverMock;
			await CallReceiverMock.deployed();
			const encodedData = CallReceiverMock.interface.encodeFunctionData("mockFunction");

			const receipt = await Address["functionCall(address,bytes)"](CallReceiverMock.address, encodedData);

			expect(receipt).to.emit(Address, "MockFunctionCalled()");
			await expect(receipt).to.emit(Address, "CallReturnValue(string)").withArgs("0x1234");
		});

		it("Address.functionCall: Should revert with custom message on fail.", async () =>
		{
			const CallReceiverMockFactory = await ethers.getContractFactory("CallReceiverMock");
			const CallReceiverMock = (await CallReceiverMockFactory.deploy()) as ICallReceiverMock;
			await CallReceiverMock.deployed();
			const encodedData = CallReceiverMock.interface.encodeFunctionData("mockFunctionRevertsNoReason");

			const receipt = Address["functionCall(address,bytes,string)"](CallReceiverMock.address, encodedData, "Custom Error: Works!");

			await expect(receipt).to.revertedWith("Custom Error: Works!");
		});

		it("Address.functionCall: Should not succeed when the called function reverts with no reason", async () =>
		{
			const CallReceiverMockFactory = await ethers.getContractFactory("CallReceiverMock");
			const CallReceiverMock = (await CallReceiverMockFactory.deploy()) as ICallReceiverMock;
			await CallReceiverMock.deployed();
			const encodedData = CallReceiverMock.interface.encodeFunctionData("mockFunctionRevertsNoReason");

			const receipt = Address["functionCall(address,bytes)"](CallReceiverMock.address, encodedData);

			await expect(receipt).to.revertedWith("Address: call failed");
		});

		it("Address.functionCall: Should not succeed when the called function reverts with reason", async () =>
		{
			const CallReceiverMockFactory = await ethers.getContractFactory("CallReceiverMock");
			const CallReceiverMock = (await CallReceiverMockFactory.deploy()) as ICallReceiverMock;
			await CallReceiverMock.deployed();
			const encodedData = CallReceiverMock.interface.encodeFunctionData("mockFunctionRevertsReason");

			const receipt = Address["functionCall(address,bytes)"](CallReceiverMock.address, encodedData);

			await expect(receipt).to.revertedWith("CallReceiverMock: reverting");
		});

		// Creates timeouts and crashes WSL when running during code coverage.
		it("Address.functionCall: Should not succeed when the called function runs out of gas [ @skip-on-coverage ]", async () =>
		{
			const CallReceiverMockFactory = await ethers.getContractFactory("CallReceiverMock");
			const CallReceiverMock = (await CallReceiverMockFactory.deploy()) as ICallReceiverMock;
			await CallReceiverMock.deployed();
			const encodedData = CallReceiverMock.interface.encodeFunctionData("mockFunctionOutOfGas");

			const receipt = Address["functionCall(address,bytes)"](CallReceiverMock.address, encodedData);

			await expect(receipt).to.revertedWith("Address: call failed");
		});

		it("Address.functionCall: Should not succeed when the called function throws", async () =>
		{
			const CallReceiverMockFactory = await ethers.getContractFactory("CallReceiverMock");
			const CallReceiverMock = (await CallReceiverMockFactory.deploy()) as ICallReceiverMock;
			await CallReceiverMock.deployed();
			const encodedData = CallReceiverMock.interface.encodeFunctionData("mockFunctionThrows");

			const receipt = Address["functionCall(address,bytes)"](CallReceiverMock.address, encodedData);

			await expect(receipt).to.revertedWithPanic("0x01");
		});

		it("Address.functionCall: Should not succeed when function does not exist", async () =>
		{
			const CallReceiverMockFactory = await ethers.getContractFactory("CallReceiverMock");
			const CallReceiverMock = (await CallReceiverMockFactory.deploy()) as ICallReceiverMock;
			await CallReceiverMock.deployed();
			const encodedData = "0xef083e19"; // { name: 'mockFunctionDoesNotExist', type: 'function', inputs: [] }

			const receipt = Address["functionCall(address,bytes)"](CallReceiverMock.address, encodedData);

			await expect(receipt).to.revertedWith("Address: call failed");
		});

		it("Address.functionCall: Should not succeed when address is not a contract", async () =>
		{
			const CallReceiverMockFactory = await ethers.getContractFactory("CallReceiverMock");
			const CallReceiverMock = (await CallReceiverMockFactory.deploy()) as ICallReceiverMock;
			await CallReceiverMock.deployed();
			const encodedData = CallReceiverMock.interface.encodeFunctionData("mockFunction");

			const receipt = Address["functionCall(address,bytes)"](Alice.address, encodedData);

			await expect(receipt).to.revertedWith("Address: call to non-contract");
		});

		it("Address.functionCallWithValue: Should call the requested function", async () =>
		{
			const CallReceiverMockFactory = await ethers.getContractFactory("CallReceiverMock");
			const CallReceiverMock = (await CallReceiverMockFactory.deploy()) as ICallReceiverMock;
			await CallReceiverMock.deployed();
			const encodedData = CallReceiverMock.interface.encodeFunctionData("mockFunction");

			const receipt = Address["functionCallWithValue(address,bytes,uint256)"](CallReceiverMock.address, encodedData, 0);

			expect(receipt).to.emit(Address, "MockFunctionCalled()");
			await expect(receipt).to.emit(Address, "CallReturnValue(string)").withArgs("0x1234");
		});

		it("Address.functionCallWithValue: Should revert with custom message on fail.", async () =>
		{
			const CallReceiverMockFactory = await ethers.getContractFactory("CallReceiverMock");
			const CallReceiverMock = (await CallReceiverMockFactory.deploy()) as ICallReceiverMock;
			await CallReceiverMock.deployed();
			const encodedData = CallReceiverMock.interface.encodeFunctionData("mockFunctionRevertsNoReason");

			const receipt = Address["functionCallWithValue(address,bytes,uint256,string)"](CallReceiverMock.address, encodedData, 0, "Custom Error: Works!");

			await expect(receipt).to.revertedWith("Custom Error: Works!");
		});

		it("Address.functionCallWithValue: Should call the requested function with existing value", async () =>
		{
			const amount: BigNumber = BigNumber.from(10).pow(17).mul(12);
			// const amount:number = (10 ** 17) * 12;
			const CallReceiverMockFactory = await ethers.getContractFactory("CallReceiverMock");
			const CallReceiverMock = (await CallReceiverMockFactory.deploy()) as ICallReceiverMock;
			await CallReceiverMock.deployed();
			const encodedData = CallReceiverMock.interface.encodeFunctionData("mockFunction");
			await Alice.sendTransaction({ to: Address.address, value: amount });

			const receipt = await Address["functionCallWithValue(address,bytes,uint256)"](CallReceiverMock.address, encodedData, amount);

			const ethAmountAddress = await Address.provider.getBalance(Address.address);
			const ethAmountCallReceiver = await Address.provider.getBalance(CallReceiverMock.address);
			expect(ethAmountAddress).to.equal(0);
			expect(ethAmountCallReceiver).to.equal(amount);
			expect(receipt).to.emit(Address, "MockFunctionCalled()");
			await expect(receipt).to.emit(Address, "CallReturnValue(string)").withArgs("0x1234");
		});

		it("Address.functionCallWithValue: Should call the requested function with transaction funds", async () =>
		{
			const amount: BigNumber = BigNumber.from(10).pow(17).mul(12);
			// const amount: number = (10 ** 17) * 12;
			const CallReceiverMockFactory = await ethers.getContractFactory("CallReceiverMock");
			const CallReceiverMock = (await CallReceiverMockFactory.deploy()) as ICallReceiverMock;
			await CallReceiverMock.deployed();
			const encodedData = CallReceiverMock.interface.encodeFunctionData("mockFunction");
			const startAmount = await Address.provider.getBalance(Alice.address);

			const receipt = await Address["functionCallWithValue(address,bytes,uint256)"](
				CallReceiverMock.address,
				encodedData, amount,
				{ from: Alice.address, value: amount });

			const newAmount = await Address.provider.getBalance(Alice.address);
			const ethAmountAddress = await Address.provider.getBalance(Address.address);
			const ethAmountCallReceiver = await Address.provider.getBalance(CallReceiverMock.address);

			// Fuzzy check. The difference should be `amount`+transaction costs.
			expect(startAmount.sub(amount).gt(newAmount)).to.equal(true);
			expect(ethAmountAddress).to.equal(0);
			expect(ethAmountCallReceiver).to.equal(amount);
			expect(receipt).to.emit(Address, "MockFunctionCalled()");
			await expect(receipt).to.emit(Address, "CallReturnValue(string)").withArgs("0x1234");
		});

		it("Address.functionCallWithValue: Should not succeed when reverts if insufficient sender balance", async () =>
		{
			const amount: BigNumber = BigNumber.from(10).pow(17).mul(12);
			// const amount: number = (10 ** 17) * 12;
			const CallReceiverMockFactory = await ethers.getContractFactory("CallReceiverMock");
			const CallReceiverMock = (await CallReceiverMockFactory.deploy()) as ICallReceiverMock;
			await CallReceiverMock.deployed();
			const encodedData = CallReceiverMock.interface.encodeFunctionData("mockFunction");

			const receipt = Address["functionCallWithValue(address,bytes,uint256)"](CallReceiverMock.address, encodedData, amount);

			await expect(receipt).to.revertedWith("Address: balance to low for call");
		});

		it("Address.functionCallWithValue: Should not succeed when calling non-payable functions", async () =>
		{
			const amount: BigNumber = BigNumber.from(10).pow(17).mul(12);
			// const amount: number = (10 ** 17) * 12;
			const CallReceiverMockFactory = await ethers.getContractFactory("CallReceiverMock");
			const CallReceiverMock = (await CallReceiverMockFactory.deploy()) as ICallReceiverMock;
			await CallReceiverMock.deployed();
			const encodedData = CallReceiverMock.interface.encodeFunctionData("mockFunctionNonPayable");
			await Alice.sendTransaction({ to: Address.address, value: amount });

			const receipt = Address["functionCallWithValue(address,bytes,uint256)"](CallReceiverMock.address, encodedData, amount);
			await expect(receipt).to.revertedWith("Address: call with value failed");
		});
	});
});
