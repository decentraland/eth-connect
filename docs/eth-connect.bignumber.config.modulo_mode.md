<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [eth-connect](./eth-connect.md) &gt; [BigNumber](./eth-connect.bignumber.md) &gt; [Config](./eth-connect.bignumber.config.md) &gt; [MODULO\_MODE](./eth-connect.bignumber.config.modulo_mode.md)

## BigNumber.Config.MODULO\_MODE property

An integer, 0, 1, 3, 6 or 9. Default value: `BigNumber.ROUND_DOWN` (1).

The modulo mode used when calculating the modulus: `a mod n`<!-- -->. The quotient, `q = a / n`<!-- -->, is calculated according to the `ROUNDING_MODE` that corresponds to the chosen `MODULO_MODE`<!-- -->. The remainder, `r`<!-- -->, is calculated as: `r = a - n * q`<!-- -->.

The modes that are most commonly used for the modulus/remainder operation are shown in the following table. Although the other rounding modes can be used, they may not give useful results.

Property \| Value \| Description :\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\|:\-\-\-\-\-\-\|:\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\- `ROUND_UP` \| 0 \| The remainder is positive if the dividend is negative. `ROUND_DOWN` \| 1 \| The remainder has the same sign as the dividend. \| \| Uses 'truncating division' and matches JavaScript's `%` operator . `ROUND_FLOOR` \| 3 \| The remainder has the same sign as the divisor. \| \| This matches Python's `%` operator. `ROUND_HALF_EVEN` \| 6 \| The IEEE 754 remainder function. `EUCLID` \| 9 \| The remainder is always positive. \| \| Euclidian division: `q = sign(n) * floor(a / abs(n))`

The rounding/modulo modes are available as enumerated properties of the BigNumber constructor.

See `modulo`<!-- -->.

```ts
BigNumber.config({ MODULO_MODE: BigNumber.EUCLID })
BigNumber.set({ MODULO_MODE: 9 })          // equivalent
```

**Signature:**

```typescript
MODULO_MODE?: BigNumber.ModuloMode;
```
