[Home](./index) &gt; [eth-connect](./eth-connect.md) &gt; [RequestManager](./eth-connect.requestmanager.md) &gt; [shh\_getFilterChanges](./eth-connect.requestmanager.shh_getfilterchanges.md)

# RequestManager.shh\_getFilterChanges property

Polling method for whisper filters. Returns new messages since the last call of this method.

Note calling the shh\_getMessages method, will reset the buffer for this method, so that you won't receive duplicate messages.

**Signature:**
```javascript
shh_getFilterChanges: (filterId: Data) => Promise<Array<SHHFilterMessage>>
```
