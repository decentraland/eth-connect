<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [eth-connect](./eth-connect.md) &gt; [BigNumber](./eth-connect.bignumber.md) &gt; [dp](./eth-connect.bignumber.dp.md)

## BigNumber.dp() method

Returns a BigNumber whose value is the value of this BigNumber rounded by rounding mode `roundingMode` to a maximum of `decimalPlaces` decimal places.

If `decimalPlaces` is omitted, or is `null` or `undefined`<!-- -->, the return value is the number of decimal places of the value of this BigNumber, or `null` if the value of this BigNumber is ±`Infinity` or `NaN`<!-- -->.

If `roundingMode` is omitted, or is `null` or `undefined`<!-- -->, `ROUNDING_MODE` is used.

Throws if `decimalPlaces` or `roundingMode` is invalid.

```ts
x = new BigNumber(1234.56)
x.dp()                                 // 2
x.dp(1)                                // '1234.6'
x.dp(2)                                // '1234.56'
x.dp(10)                               // '1234.56'
x.dp(0, 1)                             // '1234'
x.dp(0, 6)                             // '1235'
x.dp(1, 1)                             // '1234.5'
x.dp(1, BigNumber.ROUND_HALF_EVEN)     // '1234.6'
x                                      // '1234.56'
y = new BigNumber('9.9e-101')
y.dp()                                 // 102
```

**Signature:**

```typescript
dp(): number | null;
```
**Returns:**

number \| null

