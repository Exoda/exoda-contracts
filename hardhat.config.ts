/* eslint-disable node/no-unpublished-import */
import * as dotenv from "dotenv";
import { HardhatUserConfig } from "hardhat/config";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";

dotenv.config();

const accounts = {
	mnemonic:
		process.env.MNEMONIC ||
		"test test test test test test test test test test test junk"
	// accountsBalance: "990000000000000000000"
};

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

const config: HardhatUserConfig = {
	solidity: {
		compilers: [
			{
				version: "0.8.14",
				settings: {
					optimizer: {
						enabled: true,
						runs: 500000
					}
				}
			}
		]
	},
	networks: {
		ropsten: {
			url: `https://ropsten.infura.io/v3/${process.env.INFURA_API_KEY}`,
			accounts
		},
		goerli: {
			url: `https://goerli.infura.io/v3/${process.env.INFURA_API_KEY}`,
			accounts
		}
	},
	gasReporter: {
		enabled: process.env.REPORT_GAS !== undefined,
		coinmarketcap: process.env.COINMARKETCAP_API_KEY,
		currency: "EUR",
		excludeContracts: [
			"contracts/mocks/",
			"contracts/cobra/mocks/",
			"contracts/dnf libraries/"
		]
	},
	etherscan: {
		apiKey: process.env.ETHERSCAN_API_KEY
	}
};

export default config;
