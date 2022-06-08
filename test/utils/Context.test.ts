/* eslint-disable node/no-unpublished-import */
// import { ethers } from "hardhat";
import { expect } from "chai";
// import { ContractFactory } from "ethers";
// import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

// Proof of concept
describe("Context", () =>
{
	before(async() =>
	{
		console.log("Before");
	});

	context("this", async() =>
	{
		beforeEach(async() =>
		{
			console.log("beforeEach");
		});

		it("Test 1", async() =>
		{
			// Assert
			expect(1).to.equal(1);
		});
	});
});
