[Home](./index) &gt; [eth-connect](./eth-connect.md) &gt; [RequestManager](./eth-connect.requestmanager.md) &gt; [isPending](./eth-connect.requestmanager.ispending.md)

# RequestManager.isPending method

Expects the result of getTransaction's geth command and returns true if the transaction is still pending. It'll also check for a pending status prop against TRANSACTION\_STATUS

**Signature:**
```javascript
isPending(tx: TransactionAndReceipt): boolean;
```
**Returns:** `boolean`

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  `tx` | `TransactionAndReceipt` | The transaction object |

