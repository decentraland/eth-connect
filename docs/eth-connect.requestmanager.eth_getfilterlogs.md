[Home](./index) &gt; [eth-connect](./eth-connect.md) &gt; [RequestManager](./eth-connect.requestmanager.md) &gt; [eth\_getFilterLogs](./eth-connect.requestmanager.eth_getfilterlogs.md)

# RequestManager.eth\_getFilterLogs property

Returns an array of all logs matching filter with given id.

**Signature:**
```javascript
eth_getFilterLogs: (filterId: Data) => Promise<Array<TxHash> | Array<FilterChange>>
```
