<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [eth-connect](./eth-connect.md) &gt; [BigNumber](./eth-connect.bignumber.md) &gt; [div](./eth-connect.bignumber.div.md)

## BigNumber.div() method

Returns a BigNumber whose value is the value of this BigNumber divided by `n`<!-- -->, rounded according to the current `DECIMAL_PLACES` and `ROUNDING_MODE` settings.

```ts
x = new BigNumber(355)
y = new BigNumber(113)
x.div(y)                    // '3.14159292035398230088'
x.div(5)                    // '71'
x.div(47, 16)               // '5'
```

**Signature:**

```typescript
div(n: BigNumber.Value, base?: number): BigNumber;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  n | [BigNumber.Value](./eth-connect.bignumber.value.md) | A numeric value. |
|  base | number | _(Optional)_ The base of n. |

**Returns:**

[BigNumber](./eth-connect.bignumber.md)

