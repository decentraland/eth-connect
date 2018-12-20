# eth-connect

[![NPM version](https://badge.fury.io/js/eth-connect.svg)](https://npmjs.org/package/eth-connect)
[![Build Status](https://travis-ci.org/decentraland/eth-connect.svg?branch=master)](https://travis-ci.org/decentraland/eth-connect)
[![codecov](https://codecov.io/gh/decentraland/eth-connect/branch/master/graph/badge.svg)](https://codecov.io/gh/decentraland/eth-connect)
[![Install Size](https://packagephobia.now.sh/badge?p=eth-connect)](https://packagephobia.now.sh/result?p=eth-connect)

_eth-connect_ is a TypeScript-based [web3](https://github.com/ethereum/web3.js) library alternative which implements the [Generic JSON RPC](https://github.com/ethereum/wiki/wiki/JSON-RPC) spec as well.

You can follow the same [JavaScript API documentation](https://github.com/ethereum/wiki/wiki/JavaScript-API) until TypeScript docs are released.

# Installation

From NPM:

```bash
npm i eth-connect
```

As a browser module:

```html
<script src="https://unpkg.com/eth-connect@4.0.0/eth-connect.js"></script>
```

# Examples

The best examples are in the integration tests folder, anyway here are some simple examples:

### Initializing with a provider

```ts
import { RequestManager } from 'eth-connect'

// using the injected MetaMask provider
const requestManager = new RequestManager(web3.currentProvider)

const myBalance = await requestManager.eth_getBalance(myAddress)
```

or

```ts
import { RequestManager, providers } from 'eth-connect'

const provider = 'my-own-RPC-url'
const providerInstance = new providers.HTTPProvider(provider)
const requestManager = new RequestManager(providerInstance)

const someBalance = await requestManager.eth_getBalance(someAddress)
```

### Initializing a contract

```ts
import { RequestManager, ContractFactory } from 'eth-connect'

const abi = require('./some-contract-abi.json')
// using the injected MetaMask provider
const requestManager = new RequestManager(web3.currentProvider)

const factory = new ContractFactory(requestManager, abi)
const instance = await factory.at(address)

console.log('Calling a method', await instance.mint(myAddress))
```

### Getting the accounts

```ts
import { RequestManager } from 'eth-connect'

const requestManager = new RequestManager(web3.currentProvider)

const accounts = await requestManager.eth_accounts()
```

# How to build project

Clone the project and run in terminal:

```bash
make build
```

# How to run tests

```bash
make test-local
```

# Project Status

You may find some issues using this library since is still under development.
