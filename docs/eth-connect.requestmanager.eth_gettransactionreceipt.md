[Home](./index) &gt; [eth-connect](./eth-connect.md) &gt; [RequestManager](./eth-connect.requestmanager.md) &gt; [eth\_getTransactionReceipt](./eth-connect.requestmanager.eth_gettransactionreceipt.md)

# RequestManager.eth\_getTransactionReceipt property

Returns the receipt of a transaction by transaction hash. Note That the receipt is not available for pending transactions.

**Signature:**
```javascript
eth_getTransactionReceipt: (hash: TxHash) => EthMethod<'eth_getTransactionReceipt'>
```
