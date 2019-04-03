[Home](./index) &gt; [eth-connect](./eth-connect.md) &gt; [RequestManager](./eth-connect.requestmanager.md) &gt; [eth\_estimateGas](./eth-connect.requestmanager.eth_estimategas.md)

# RequestManager.eth\_estimateGas property

Generates and returns an estimate of how much gas is necessary to allow the transaction to complete. The transaction will not be added to the blockchain. Note that the estimate may be significantly more than the amount of gas actually used by the transaction, for a variety of reasons including EVM mechanics and node performance.

**Signature:**
```javascript
eth_estimateGas: (data: Partial<TransactionCallOptions> & Partial<TransactionOptions>) => EthMethod<'eth_estimateGas'>
```
