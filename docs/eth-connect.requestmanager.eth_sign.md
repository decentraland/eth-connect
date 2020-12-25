<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [eth-connect](./eth-connect.md) &gt; [RequestManager](./eth-connect.requestmanager.md) &gt; [eth\_sign](./eth-connect.requestmanager.eth_sign.md)

## RequestManager.eth\_sign property

> Warning: This API is now obsolete.
> 
> see https://github.com/ethereum/go-ethereum/pull/2940
> 

The sign method calculates an Ethereum specific signature with:

sign(keccak256("Ethereum Signed Message:" + len(message) + message))).

By adding a prefix to the message makes the calculated signature recognisable as an Ethereum specific signature. This prevents misuse where a malicious DApp can sign arbitrary data (e.g. transaction) and use the signature to impersonate the victim.

Note the address to sign with must be unlocked.

<b>Signature:</b>

```typescript
eth_sign: (address: Address, message: Data) => Promise<Data>;
```