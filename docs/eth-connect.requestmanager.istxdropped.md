[Home](./index) &gt; [eth-connect](./eth-connect.md) &gt; [RequestManager](./eth-connect.requestmanager.md) &gt; [isTxDropped](./eth-connect.requestmanager.istxdropped.md)

# RequestManager.isTxDropped method

Wait retryAttemps \* TRANSACTION\_FETCH\_DELAY for a transaction status to be in the mempool

**Signature:**
```javascript
isTxDropped(txId: string, _retryAttemps?: number): Promise<boolean>;
```
**Returns:** `Promise<boolean>`

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  `txId` | `string` | Transaction id to watch |
|  `_retryAttemps` | `number` |  |

