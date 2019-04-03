[Home](./index) &gt; [eth-connect](./eth-connect.md) &gt; [RequestManager](./eth-connect.requestmanager.md) &gt; [personal\_ecRecover](./eth-connect.requestmanager.personal_ecrecover.md)

# RequestManager.personal\_ecRecover property

ecRecover returns the address associated with the private key that was used to calculate the signature in personal\_sign.

**Signature:**
```javascript
personal_ecRecover: (message: Data, signature: Data) => EthMethod<'personal_ecRecover'>
```
