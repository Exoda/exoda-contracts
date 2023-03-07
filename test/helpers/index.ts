import { BigNumber } from "ethers";

// export const BASE_TEN = 10;
export const ADDRESS_ZERO = "0x0000000000000000000000000000000000000000";
export const UINT256_MAX = BigNumber.from(2).pow(256).sub(1);

export * from "./mine";
export * from "./time";
export * from "./chai/emitOnly";
