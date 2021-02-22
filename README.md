# eth-connect

[![NPM version](https://badge.fury.io/js/eth-connect.svg)](https://npmjs.org/package/eth-connect)
[![codecov](https://codecov.io/gh/decentraland/eth-connect/branch/master/graph/badge.svg)](https://codecov.io/gh/decentraland/eth-connect)
[![Install Size](https://packagephobia.now.sh/badge?p=eth-connect)](https://packagephobia.now.sh/result?p=eth-connect)

_eth-connect_ is a TypeScript-based [web3](https://github.com/ethereum/web3.js) library alternative which implements the [Generic JSON RPC](https://github.com/ethereum/wiki/wiki/JSON-RPC) spec as well.

You can follow the [JavaScript API documentation](https://github.com/ethereum/wiki/wiki/JavaScript-API) until TypeScript docs are released.

## Design goals

- A Typed web3.js alternative
- Have as few convention-invented functions as possible (by following the RPC specs as much as possible)
- Leverage WS and HTTP providers
- Portable (support and work equally in both browser and node)
- Painless `eth` usage: Using contract factories, well-split event types (block, transaction and contracts plus topics)
- `async/await` out of the box

## Installation

Using NPM:

```bash
npm i eth-connect
```

Importing as a browser module:

```html
<script src="https://unpkg.com/eth-connect@latest/eth-connect.js"></script>
```

## Examples

Below are some simple illustrative examples.
You can also find more complete examples are in the integration `/tests` folder.

### Initialize with a provider

```ts
import { RequestManager } from 'eth-connect'

// using the injected MetaMask provider
const requestManager = new RequestManager(web3.currentProvider)

const myBalance = await requestManager.eth_getBalance(myAddress)
```

or

```ts
import { RequestManager, HTTPProvider } from 'eth-connect'

const provider = 'my-own-RPC-url'
const providerInstance = new HTTPProvider(provider)
const requestManager = new RequestManager(providerInstance)

const someBalance = await requestManager.eth_getBalance(someAddress)
```

### Initialize a contract

```ts
import { RequestManager, ContractFactory } from 'eth-connect'

const abi = require('./some-contract-abi.json')
// using the injected MetaMask provider
const requestManager = new RequestManager(web3.currentProvider)

const factory = new ContractFactory(requestManager, abi)
const instance = await factory.at(address)

console.log('Calling a method', await instance.mint(myAddress))
```

### Get the accounts

```ts
import { RequestManager } from 'eth-connect'

const requestManager = new RequestManager(web3.currentProvider)

const accounts = await requestManager.eth_accounts()
```

## Build the project

Clone this project and run the following in the terminal:

```bash
make build
```

## Run tests

```bash
make test-local
```

## Comparison

|                 |  `web3`  | `eth-connect` |
| --------------- | :------: | :-----------: |
| Browser support |    ✔     |       ✔       |
| Promise API     |    ✖     |       ✔       |
| TS/JS Docs      |    ✖     |       ✔       |
| Wiki Docs       |    ✔     |       ?       |
| Downloads       | ![][wd]  |    ![][ed]    |
| Coverage        | ![][wc]  |    ![][ec]    |
| Build           | ![][wb]  |    ![][eb]    |
| Dependents      | ![][wdp] |   ![][edp]    |
| Install size    | ![][wis] |   ![][eis]    |

<!-- DOWNLOADS -->

[wd]: https://img.shields.io/npm/dm/web3.svg
[ed]: https://img.shields.io/npm/dm/eth-connect.svg

<!-- COVERAGE -->

[wc]: https://coveralls.io/repos/ethereum/web3.js/badge.svg?branch=master
[ec]: https://codecov.io/gh/decentraland/eth-connect/branch/master/graph/badge.svg

<!-- BUILD -->

[wb]: https://travis-ci.org/ethereum/web3.js.svg
[eb]: https://travis-ci.org/decentraland/eth-connect.svg?branch=master

<!-- DEPENDENTS -->

[wdp]: https://badgen.net/npm/dependents/web3
[edp]: https://badgen.net/npm/dependents/eth-connect

<!-- INSTALL SIZE -->

[wis]: https://packagephobia.now.sh/badge?p=web3
[eis]: https://packagephobia.now.sh/badge?p=eth-connect

## Project Status

You can find full documentation [here](docs/index.md).

You may find issues while using this library, as it's still under development. Please report any issues you come accross.
