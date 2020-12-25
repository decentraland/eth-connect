<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [eth-connect](./eth-connect.md) &gt; [RequestManager](./eth-connect.requestmanager.md) &gt; [isFailure](./eth-connect.requestmanager.isfailure.md)

## RequestManager.isFailure() method

Expects the result of getTransactionRecepeit's geth command and returns true if the transaction failed. It'll also check for a failed status prop against TRANSACTION\_STATUS

<b>Signature:</b>

```typescript
isFailure(tx: TransactionAndReceipt): boolean;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  tx | TransactionAndReceipt | The transaction object |

<b>Returns:</b>

boolean
