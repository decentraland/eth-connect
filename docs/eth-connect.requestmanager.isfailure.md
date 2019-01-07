[Home](./index) &gt; [eth-connect](./eth-connect.md) &gt; [RequestManager](./eth-connect.requestmanager.md) &gt; [isFailure](./eth-connect.requestmanager.isfailure.md)

# RequestManager.isFailure method

Expects the result of getTransactionRecepeit's geth command and returns true if the transaction failed. It'll also check for a failed status prop against TRANSACTION\_STATUS

**Signature:**
```javascript
isFailure(tx: TransactionAndReceipt): boolean;
```
**Returns:** `boolean`

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  `tx` | `TransactionAndReceipt` | The transaction object |

