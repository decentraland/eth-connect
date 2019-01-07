[Home](./index) &gt; [eth-connect](./eth-connect.md) &gt; [RequestManager](./eth-connect.requestmanager.md) &gt; [personal\_lockAccount](./eth-connect.requestmanager.personal_lockaccount.md)

# RequestManager.personal\_lockAccount property

Removes the private key with given address from memory. The account can no longer be used to send transactions.

**Signature:**
```javascript
personal_lockAccount: (address: Address) => Promise<boolean>
```
