# Exoda contracts

**A library for secure smart contract development.** Strongly inspired by the OpenZeppelin contracts [here](https://github.com/OpenZeppelin/openzeppelin-contracts).

* Based on OpenZeppelin contracts.
* Contracts are implemented based on our own coding standards.
* Reusable to build custom contracs.

## Overview

We only implement contracts we need for our own projects, there is currently no efford to mimic all contracs available at OpenZeppelin.
For all contracts we are publishing we want to be as safe as OpenZeppelin but more economical with gas costs.

### Differences to OpenZeppelin

The main reason we make our own contracs is that we strongly belive that every contract should have an interface.
This is not the case in the OpenZeppelin code base, therefore we decided modify the OpenZeppen contracs with interfaces whenever they are missing.
We also want to keep gas usage to a minimum and have decided to remove some features like transaction hooks that we won't be using in the foreseeable future.

### Installation

TBD

### Usage

TBD

### Security

TBD

### Contribute

TBD

### Licence

Exoda contracts is released under the [MIT License](LICENSE).
