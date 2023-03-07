/* eslint-disable node/no-unpublished-import */
// import * as dotenv from "dotenv";
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
// import "@nomiclabs/hardhat-etherscan";
// import "@nomiclabs/hardhat-waffle";
// import "@typechain/hardhat";
// import "hardhat-gas-reporter";
// import "solidity-coverage";
import "solidity-docgen";
import "hardhat-abi-exporter";
import "hardhat-contract-sizer";

import { PageAssigner } from "solidity-docgen/dist/site";

const excludePath: RegExp[] = [/\/mocks\//];

const pa: PageAssigner = (item, file, config) =>
{
	for (const excludeMe of excludePath)
	{
		if (excludeMe.test(file.absolutePath))
		{
			return undefined;
		}
	}
	return file.absolutePath.replace(".sol", config.pageExtension);
};

// dotenv.config();

const accounts = {
	mnemonic:
		process.env.MNEMONIC ||
		"test test test test test test test test test test test junk"
		// accountsBalance: ethers.utils.parseEther("1");
};

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

const config: HardhatUserConfig = {
	abiExporter:
	[
		{
			runOnCompile: true,
			path: "./abi/json",
			clear: true,
			flat: false,
			format: "json"
		},
		{
			runOnCompile: true,
			path: "./abi/compact",
			clear: true,
			flat: false,
			format: "fullName"
		}
	],
	contractSizer:
	{
		runOnCompile: true,
		except: ["contracts/mocks/*"]
	},
	docgen: {
		pages: pa, // "files",
		templates: "doctemplates"
	},
	etherscan: { apiKey: process.env.ETHERSCAN_API_KEY },
	gasReporter:
	{
		enabled: process.env.REPORT_GAS === "true",
		coinmarketcap: process.env.COINMARKETCAP_API_KEY,
		currency: "EUR",
		excludeContracts:
			[
				"contracts/mocks/"
			]
	},
	networks:
	{
		goerli: {
			url: `https://eth-goerli.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
			accounts
		}
		// hardhat:
		// {
		// chainId: 31337,
		// forking: { url: `https://eth-goerli.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}` },
		// accounts
		// }
	},
	solidity: {
		compilers: [
			{
				version: "0.8.17",
				settings:
				{
					optimizer:
					{
						enabled: true,
						runs: 500000
					}
				}
			}
		]
	}
};

export default config;
