<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [eth-connect](./eth-connect.md) &gt; [toWei](./eth-connect.towei.md)

## toWei() function

Takes a number of a unit and converts it to wei.

Possible units are: SI Short SI Full Effigy Other - kwei femtoether babbage - mwei picoether lovelace - gwei nanoether shannon nano - -- microether szabo micro - -- milliether finney milli - ether -- -- - kether -- grand - mether - gether - tether

**Signature:**

```typescript
export declare function toWei(num: number | string, unit: Unit): string | BigNumber;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  num | number \| string |  |
|  unit | [Unit](./eth-connect.unit.md) |  |

**Returns:**

string \| [BigNumber](./eth-connect.bignumber.md)

