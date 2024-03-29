<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [eth-connect](./eth-connect.md) &gt; [BigNumber](./eth-connect.bignumber.md) &gt; [Config](./eth-connect.bignumber.config.md) &gt; [EXPONENTIAL\_AT](./eth-connect.bignumber.config.exponential_at.md)

## BigNumber.Config.EXPONENTIAL\_AT property

An integer, 0 to 1e+9, or an array, \[-1e+9 to 0, 0 to 1e+9\]. Default value: `[-7, 20]`<!-- -->.

The exponent value(s) at which `toString` returns exponential notation.

If a single number is assigned, the value is the exponent magnitude.

If an array of two numbers is assigned then the first number is the negative exponent value at and beneath which exponential notation is used, and the second number is the positive exponent value at and above which exponential notation is used.

For example, to emulate JavaScript numbers in terms of the exponent values at which they begin to use exponential notation, use `[-7, 20]`<!-- -->.

```ts
BigNumber.config({ EXPONENTIAL_AT: 2 })
new BigNumber(12.3)         // '12.3'        e is only 1
new BigNumber(123)          // '1.23e+2'
new BigNumber(0.123)        // '0.123'       e is only -1
new BigNumber(0.0123)       // '1.23e-2'

BigNumber.config({ EXPONENTIAL_AT: [-7, 20] })
new BigNumber(123456789)    // '123456789'   e is only 8
new BigNumber(0.000000123)  // '1.23e-7'

// Almost never return exponential notation:
BigNumber.config({ EXPONENTIAL_AT: 1e+9 })

// Always return exponential notation:
BigNumber.config({ EXPONENTIAL_AT: 0 })
```
Regardless of the value of `EXPONENTIAL_AT`<!-- -->, the `toFixed` method will always return a value in normal notation and the `toExponential` method will always return a value in exponential form. Calling `toString` with a base argument, e.g. `toString(10)`<!-- -->, will also always return normal notation.

**Signature:**

```typescript
EXPONENTIAL_AT?: number | [number, number];
```
