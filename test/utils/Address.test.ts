/* eslint-disable node/no-unpublished-import */
import { ethers } from "hardhat";
import { expect } from "chai";
import { BigNumber, Contract, ContractFactory } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { IAddressMock, ICallReceiverMock } from "../../typechain-types";
import { PANIC_CODES } from "../helpers";
import { receiveMessageOnPort } from "worker_threads";

// * Unit tests are grouped in contexts.
// * Ever group represents an derived class or interface.
// * Contexts are named after the imported class or interface.
// * Unit tests covering class specific functionality are put in the context "this".
// * Contexts are ordered alphabetically.
// * Tests are ordered by the function name. After that the order should be "Should emit->Should allow->Should not allow".
describe("Address", () =>
{
	let AddressFactory: ContractFactory;
	let Signers: SignerWithAddress[];
	let Alice: SignerWithAddress;
	let Contract: Contract;
	// Only Mock methods needs to be available everywhere.
	const AddressMock = () => Contract as IAddressMock;

	before(async () =>
	{
		AddressFactory = await ethers.getContractFactory("AddressMock");
		Signers = await ethers.getSigners();
		Alice = Signers[0];
	});

	context("this", async () =>
	{
		beforeEach(async () =>
		{
			Contract = await AddressFactory.deploy();
			await Contract.deployed();
		});

		it("Address.isContract: Should return false for account address", async function ()
		{
			expect(await AddressMock().isContract(Alice.address)).to.equal(false);
		});

		it("Address.isContract: Should returns true for contract address", async function ()
		{
			expect(await AddressMock().isContract(Contract.address)).to.equal(true);
		});

		it("Address.functionCall: Should call the requested function", async function ()
		{
			const CallReceiverMockFactory = await ethers.getContractFactory("CallReceiverMock");
			const CallReceiverMock = (await CallReceiverMockFactory.deploy()) as ICallReceiverMock;
			await CallReceiverMock.deployed();
			const encodedData = CallReceiverMock.interface.encodeFunctionData("mockFunction");

			const receipt = await AddressMock()["functionCall(address,bytes)"](CallReceiverMock.address, encodedData);

			expect(receipt).to.emit(Contract, "MockFunctionCalled()");
			await expect(receipt).to.emit(Contract, "CallReturnValue(string)").withArgs("0x1234");
		});

		it("Address.functionCall: Should revert with custom message on fail.", async function ()
		{
			const CallReceiverMockFactory = await ethers.getContractFactory("CallReceiverMock");
			const CallReceiverMock = (await CallReceiverMockFactory.deploy()) as ICallReceiverMock;
			await CallReceiverMock.deployed();
			const encodedData = CallReceiverMock.interface.encodeFunctionData("mockFunctionRevertsNoReason");

			const receipt = AddressMock()["functionCall(address,bytes,string)"](CallReceiverMock.address, encodedData, "Custom Error: Works!");

			await expect(receipt).to.revertedWith("Custom Error: Works!");
		});

		it("Address.functionCall: Should not succeed when the called function reverts with no reason", async function ()
		{
			const CallReceiverMockFactory = await ethers.getContractFactory("CallReceiverMock");
			const CallReceiverMock = (await CallReceiverMockFactory.deploy()) as ICallReceiverMock;
			await CallReceiverMock.deployed();
			const encodedData = CallReceiverMock.interface.encodeFunctionData("mockFunctionRevertsNoReason");

			const receipt = AddressMock()["functionCall(address,bytes)"](CallReceiverMock.address, encodedData);

			await expect(receipt).to.revertedWith("Address: call failed");
		});

		it("Address.functionCall: Should not succeed when the called function reverts with reason", async function ()
		{
			const CallReceiverMockFactory = await ethers.getContractFactory("CallReceiverMock");
			const CallReceiverMock = (await CallReceiverMockFactory.deploy()) as ICallReceiverMock;
			await CallReceiverMock.deployed();
			const encodedData = CallReceiverMock.interface.encodeFunctionData("mockFunctionRevertsReason");

			const receipt = AddressMock()["functionCall(address,bytes)"](CallReceiverMock.address, encodedData);

			await expect(receipt).to.revertedWith("CallReceiverMock: reverting");
		});

		// Creates timeouts and crashes WSL when running during code coverage.
		it("Address.functionCall: Should not succeed when the called function runs out of gas [ @skip-on-coverage ]", async function ()
		{
			const CallReceiverMockFactory = await ethers.getContractFactory("CallReceiverMock");
			const CallReceiverMock = (await CallReceiverMockFactory.deploy()) as ICallReceiverMock;
			await CallReceiverMock.deployed();
			const encodedData = CallReceiverMock.interface.encodeFunctionData("mockFunctionOutOfGas");

			const receipt = AddressMock()["functionCall(address,bytes)"](CallReceiverMock.address, encodedData);

			await expect(receipt).to.revertedWith("Address: call failed");
		});

		it("Address.functionCall: Should not succeed when the called function throws", async function ()
		{
			const CallReceiverMockFactory = await ethers.getContractFactory("CallReceiverMock");
			const CallReceiverMock = (await CallReceiverMockFactory.deploy()) as ICallReceiverMock;
			await CallReceiverMock.deployed();
			const encodedData = CallReceiverMock.interface.encodeFunctionData("mockFunctionThrows");

			const receipt = AddressMock()["functionCall(address,bytes)"](CallReceiverMock.address, encodedData);

			await expect(receipt).to.revertedWith(PANIC_CODES.Code_0x01);
		});

		it("Address.functionCall: Should not succeed when function does not exist", async function ()
		{
			const CallReceiverMockFactory = await ethers.getContractFactory("CallReceiverMock");
			const CallReceiverMock = (await CallReceiverMockFactory.deploy()) as ICallReceiverMock;
			await CallReceiverMock.deployed();
			const encodedData = "0xef083e19"; // { name: 'mockFunctionDoesNotExist', type: 'function', inputs: [] }

			const receipt = AddressMock()["functionCall(address,bytes)"](CallReceiverMock.address, encodedData);

			await expect(receipt).to.revertedWith("Address: call failed");
		});

		it("Address.functionCall: Should not succeed when address is not a contract", async function ()
		{
			const CallReceiverMockFactory = await ethers.getContractFactory("CallReceiverMock");
			const CallReceiverMock = (await CallReceiverMockFactory.deploy()) as ICallReceiverMock;
			await CallReceiverMock.deployed();
			const encodedData = CallReceiverMock.interface.encodeFunctionData("mockFunction");

			const receipt = AddressMock()["functionCall(address,bytes)"](Alice.address, encodedData);

			await expect(receipt).to.revertedWith("Address: call to non-contract");
		});

		it("Address.functionCallWithValue: Should call the requested function", async function ()
		{
			const CallReceiverMockFactory = await ethers.getContractFactory("CallReceiverMock");
			const CallReceiverMock = (await CallReceiverMockFactory.deploy()) as ICallReceiverMock;
			await CallReceiverMock.deployed();
			const encodedData = CallReceiverMock.interface.encodeFunctionData("mockFunction");

			const receipt = AddressMock()["functionCallWithValue(address,bytes,uint256)"](CallReceiverMock.address, encodedData, 0);

			expect(receipt).to.emit(Contract, "MockFunctionCalled()");
			await expect(receipt).to.emit(Contract, "CallReturnValue(string)").withArgs("0x1234");
		});

		it("Address.functionCallWithValue: Should revert with custom message on fail.", async function ()
		{
			const CallReceiverMockFactory = await ethers.getContractFactory("CallReceiverMock");
			const CallReceiverMock = (await CallReceiverMockFactory.deploy()) as ICallReceiverMock;
			await CallReceiverMock.deployed();
			const encodedData = CallReceiverMock.interface.encodeFunctionData("mockFunctionRevertsNoReason");

			const receipt = AddressMock()["functionCallWithValue(address,bytes,uint256,string)"](CallReceiverMock.address, encodedData, 0, "Custom Error: Works!");

			await expect(receipt).to.revertedWith("Custom Error: Works!");
		});

		it("Address.functionCallWithValue: Should call the requested function with existing value", async function ()
		{
			const amount:BigNumber = BigNumber.from(10).pow(17).mul(12);
			const CallReceiverMockFactory = await ethers.getContractFactory("CallReceiverMock");
			const CallReceiverMock = (await CallReceiverMockFactory.deploy()) as ICallReceiverMock;
			await CallReceiverMock.deployed();
			const encodedData = CallReceiverMock.interface.encodeFunctionData("mockFunction");
			await Alice.sendTransaction({ to: Contract.address, value: amount });

			const receipt = await AddressMock()["functionCallWithValue(address,bytes,uint256)"](CallReceiverMock.address, encodedData, amount);

			const ethAmountAddress = await Contract.provider.getBalance(Contract.address);
			const ethAmountCallReceiver = await Contract.provider.getBalance(CallReceiverMock.address);
			expect(ethAmountAddress).to.equal(0);
			expect(ethAmountCallReceiver).to.equal(amount);
			expect(receipt).to.emit(Contract, "MockFunctionCalled()");
			await expect(receipt).to.emit(Contract, "CallReturnValue(string)").withArgs("0x1234");
		});

		it("Address.functionCallWithValue: Should call the requested function with transaction funds", async function ()
		{
			const amount: BigNumber = BigNumber.from(10).pow(17).mul(12);
			const CallReceiverMockFactory = await ethers.getContractFactory("CallReceiverMock");
			const CallReceiverMock = (await CallReceiverMockFactory.deploy()) as ICallReceiverMock;
			await CallReceiverMock.deployed();
			const encodedData = CallReceiverMock.interface.encodeFunctionData("mockFunction");
			const startAmount = await Contract.provider.getBalance(Alice.address);

			const receipt = await AddressMock()["functionCallWithValue(address,bytes,uint256)"](
				CallReceiverMock.address,
				encodedData, amount,
				{ from: Alice.address, value: amount });

			const newAmount = await Contract.provider.getBalance(Alice.address);
			const ethAmountAddress = await Contract.provider.getBalance(Contract.address);
			const ethAmountCallReceiver = await Contract.provider.getBalance(CallReceiverMock.address);

			// Fuzzy check. The difference should be `amount`+transaction costs.
			expect(startAmount.sub(amount).gt(newAmount)).to.equal(true);
			expect(ethAmountAddress).to.equal(0);
			expect(ethAmountCallReceiver).to.equal(amount);
			expect(receipt).to.emit(Contract, "MockFunctionCalled()");
			await expect(receipt).to.emit(Contract, "CallReturnValue(string)").withArgs("0x1234");
		});

		it("Address.functionCallWithValue: Should not succeed when reverts if insufficient sender balance", async function ()
		{
			const amount: BigNumber = BigNumber.from(10).pow(17).mul(12);
			const CallReceiverMockFactory = await ethers.getContractFactory("CallReceiverMock");
			const CallReceiverMock = (await CallReceiverMockFactory.deploy()) as ICallReceiverMock;
			await CallReceiverMock.deployed();
			const encodedData = CallReceiverMock.interface.encodeFunctionData("mockFunction");

			const receipt = AddressMock()["functionCallWithValue(address,bytes,uint256)"](CallReceiverMock.address, encodedData, amount);

			await expect(receipt).to.revertedWith("Address: balance to low for call");
		});

		it("Address.functionCallWithValue: Should not succeed when calling non-payable functions", async function ()
		{
			const amount: BigNumber = BigNumber.from(10).pow(17).mul(12);
			const CallReceiverMockFactory = await ethers.getContractFactory("CallReceiverMock");
			const CallReceiverMock = (await CallReceiverMockFactory.deploy()) as ICallReceiverMock;
			await CallReceiverMock.deployed();
			const encodedData = CallReceiverMock.interface.encodeFunctionData("mockFunctionNonPayable");
			await Alice.sendTransaction({ to: Contract.address, value: amount });

			const receipt = AddressMock()["functionCallWithValue(address,bytes,uint256)"](CallReceiverMock.address, encodedData, amount);
			await expect(receipt).to.revertedWith("Address: call with value failed");
		});
	});
});
