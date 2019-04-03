[Home](./index) &gt; [eth-connect](./eth-connect.md) &gt; [RequestManager](./eth-connect.requestmanager.md) &gt; [getTransaction](./eth-connect.requestmanager.gettransaction.md)

# RequestManager.getTransaction method

Returns a transaction in any of the possible states.

**Signature:**
```javascript
getTransaction(hash: string): Promise<Transaction | null>;
```
**Returns:** `Promise<Transaction | null>`

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  `hash` | `string` | The transaction hash |

