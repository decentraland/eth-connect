[Home](./index) &gt; [eth-connect](./eth-connect.md) &gt; [RequestManager](./eth-connect.requestmanager.md) &gt; [getConfirmedTransaction](./eth-connect.requestmanager.getconfirmedtransaction.md)

# RequestManager.getConfirmedTransaction method

Waits until the transaction finishes. Returns if it was successfull. Throws if the transaction fails or if it lacks any of the supplied events

**Signature:**
```javascript
getConfirmedTransaction(txId: string): Promise<FinishedTransactionAndReceipt>;
```
**Returns:** `Promise<FinishedTransactionAndReceipt>`

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  `txId` | `string` | Transaction id to watch |

