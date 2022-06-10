---
filename: /contracts/interfaces/token/ERC20/extensions/IERC20Metadata
type: interface
---

## IERC20Metadata

Interface for the optional metadata functions from the ERC20 standard.

***

### Functions

#### name

```solidity
function name() external view returns (string)
```

Returns the name of the token.

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | string | The token name. |

#### symbol

```solidity
function symbol() external view returns (string)
```

Returns the symbol of the token.

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | string | The symbol for the token. |

#### decimals

```solidity
function decimals() external pure returns (uint8)
```

Returns the decimals of the token.

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint8 | The decimals for the token. |

[Back](/index)