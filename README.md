# eth-connect, a revisioned version of web3 built in typescript [![Build Status](https://travis-ci.org/decentraland/web3-ts.svg?branch=master)](https://travis-ci.org/decentraland/web3-ts)

> Published as `eth-connect`

## Inspiration

Most of our daily work requires interacting with web3; it is usually a pain in the rear. This project provides a well tested, revisioned version of web3; it was built entirely using Typescript, and modern patterns like `async/await`, getting rid of the strange code patterns introduced by the old days Javascript.

The version we all use of web3 was made three years ago, it was patched several times to fix inconsistencies, but it has no active professional maintenance.

## What it does

Replaces web3. It has some differences with the original implementation mostly because we fixed broken interfaces.

We removed some conventions over configurations to avoid creating opinionated code:

* now all the Ethereum methods are called the same as the RPC implementation.
* there is no built-in provider; we try to follow the single responsibility principle to make the library that does one thing well
* no more sync calls, because it made no sense at all
* works with MetaMask, WebSocket, IPC ledger and any other provider because it uses the standard Ethereum provider interface

**Everything has documentation** that works with VSCode and typescript-enabled editors see [the docs](src/RequestManager.ts)

## Challenges we ran into

Decrypt what the original developers tried to do

## Accomplishments that we're proud of

Test coverage, cleaner interface

## What we learned

How many millons of dollars, ether, alt coins are running on this?!

## What's next for web3-ts

Publish and use it!

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
