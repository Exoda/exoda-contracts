---
filename: /contracts/interfaces/token/ERC20/extensions/IERC20Burnable
type: interface
---

## IERC20Burnable

Interface for the extension of {ERC20} that allows token holders to destroy both their own tokens
and those that they have an allowance for.

***

### Functions

#### burn

```solidity
function burn(uint256 amount) external
```

Destroys {amount} tokens from the caller.

Emits an {Transfer} event.

| Name | Type | Description |
| ---- | ---- | ----------- |
| amount | uint256 | The {amount} of tokens that should be destroyed. |

#### burnFrom

```solidity
function burnFrom(address account, uint256 amount) external
```

Destroys {amount} tokens from {account}, deducting from the caller's allowance.

Emits an {Approval} and an {Transfer} event.

| Name | Type | Description |
| ---- | ---- | ----------- |
| account | address | The {account} where the tokens should be destroyed. |
| amount | uint256 | The {amount} of tokens that should be destroyed. |

[Back](/index)