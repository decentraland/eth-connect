[Home](./index) &gt; [eth-connect](./eth-connect.md) &gt; [RequestManager](./eth-connect.requestmanager.md) &gt; [eth\_newPendingTransactionFilter](./eth-connect.requestmanager.eth_newpendingtransactionfilter.md)

# RequestManager.eth\_newPendingTransactionFilter property

Creates a filter in the node, to notify when new pending transactions arrive. To check if the state has changed, call eth\_getFilterChanges.

**Signature:**
```javascript
eth_newPendingTransactionFilter: () => Promise<Data>
```
