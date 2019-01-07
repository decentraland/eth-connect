[Home](./index) &gt; [eth-connect](./eth-connect.md) &gt; [RequestManager](./eth-connect.requestmanager.md) &gt; [personal\_sign](./eth-connect.requestmanager.personal_sign.md)

# RequestManager.personal\_sign property

The sign method calculates an Ethereum specific signature with: sign(keccack256("Ethereum Signed Message:" + len(message) + message))).

By adding a prefix to the message makes the calculated signature recognisable as an Ethereum specific signature. This prevents misuse where a malicious DApp can sign arbitrary data (e.g. transaction) and use the signature to impersonate the victim.

See ecRecover to verify the signature.

**Signature:**
```javascript
personal_sign: (data: Data, signerAddress: Address, passPhrase: Data) => Promise<Data>
```
