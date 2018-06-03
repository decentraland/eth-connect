# eth-connect, a TypeScript-based web3 library

[![Build Status](https://travis-ci.org/decentraland/eth-connect.svg?branch=master)](https://travis-ci.org/decentraland/eth-connect)

[![codecov](https://codecov.io/gh/decentraland/eth-connect/branch/master/graph/badge.svg)](https://codecov.io/gh/decentraland/eth-connect)

# Not ready for production!

We are still developing this tool. Watch the project to receive updates.

    npm i eth-connect

# Examples

The best examples are in the integration tests folder, anyway here are some simple examples:

### Initializing with a provider

```ts
// using the injected MetaMask provider
const requestManager = new RequestManager(web3.currentProvider)

const myBalance = await requestManager.eth_getBalance(myAddress)
```

### Initializing a contract

```ts
const abi = [...]
// using the injected MetaMask provider
const requestManager = new RequestManager(web3.currentProvider)

const factory = new ContractFactory(requestManager, abi)
const instance = await factory.at(address)

console.log('Calling a method', await instance.mint(myAddress))
```

### Getting the accounts

```ts
const requestManager = new RequestManager(web3.currentProvider)

const accounts = await requestManager.eth_accounts()
```

# How to build project

Run: `npm run build`

or if you are on dev mode

`npm run build -- --watch`

Take in consideration that this will only build src files, if you also want to run build test
files just for fun do:

`./node_modules/.bin/tsc --watch`

# How to run tests

On one terminal run:

`./start-local-node.sh` It starts a geth node using Docker

On a second terminal run:

`npm run test` or `npm run test -- --watch`
