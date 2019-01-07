[Home](./index) &gt; [eth-connect](./eth-connect.md) &gt; [RequestManager](./eth-connect.requestmanager.md) &gt; [shh\_getMessages](./eth-connect.requestmanager.shh_getmessages.md)

# RequestManager.shh\_getMessages property

Get all messages matching a filter. Unlike shh\_getFilterChanges this returns all messages.

**Signature:**
```javascript
shh_getMessages: (filterId: Data) => Promise<Array<SHHFilterMessage>>
```
