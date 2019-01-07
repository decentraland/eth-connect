[Home](./index) &gt; [eth-connect](./eth-connect.md) &gt; [RequestManager](./eth-connect.requestmanager.md) &gt; [waitForCompletion](./eth-connect.requestmanager.waitforcompletion.md)

# RequestManager.waitForCompletion method

Wait until a transaction finishes by either being mined or failing

**Signature:**
```javascript
waitForCompletion(txId: string, retriesOnEmpty?: number): Promise<FinishedTransactionAndReceipt>;
```
**Returns:** `Promise<FinishedTransactionAndReceipt>`

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  `txId` | `string` | Transaction id to watch |
|  `retriesOnEmpty` | `number` | Number of retries when a transaction status returns empty |

