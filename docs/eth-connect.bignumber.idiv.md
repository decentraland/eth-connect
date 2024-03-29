<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [eth-connect](./eth-connect.md) &gt; [BigNumber](./eth-connect.bignumber.md) &gt; [idiv](./eth-connect.bignumber.idiv.md)

## BigNumber.idiv() method

Returns a BigNumber whose value is the integer part of dividing the value of this BigNumber by `n`<!-- -->.

```ts
x = new BigNumber(5)
y = new BigNumber(3)
x.idiv(y)                       // '1'
x.idiv(0.7)                     // '7'
x.idiv('0.f', 16)               // '5'
```

**Signature:**

```typescript
idiv(n: BigNumber.Value, base?: number): BigNumber;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  n | [BigNumber.Value](./eth-connect.bignumber.value.md) | A numeric value. |
|  base | number | _(Optional)_ The base of n. |

**Returns:**

[BigNumber](./eth-connect.bignumber.md)

