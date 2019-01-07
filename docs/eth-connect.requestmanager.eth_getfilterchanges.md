[Home](./index) &gt; [eth-connect](./eth-connect.md) &gt; [RequestManager](./eth-connect.requestmanager.md) &gt; [eth\_getFilterChanges](./eth-connect.requestmanager.eth_getfilterchanges.md)

# RequestManager.eth\_getFilterChanges property

Polling method for a filter, which returns an array of logs which occurred since last poll.

**Signature:**
```javascript
eth_getFilterChanges: (filterId: Data) => Promise<Array<TxHash> | Array<FilterChange>>
```
