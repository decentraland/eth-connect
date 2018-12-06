export type BigNumberValueType = string | number | BigNumber

export type BigNumberRoundingModeType = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8

export const BigNumberRoundingMode = {
  /**
   * Rounds away from zero.
   */
  ROUND_UP: 0,

  /**
   * Rounds towards zero.
   */
  ROUND_DOWN: 1,

  /**
   * Rounds towards Infinity.
   */
  ROUND_CE: 2,

  /**
   * Rounds towards -Infinity.
   */
  ROUND_FLOOR: 3,

  /**
   * Rounds towards nearest neighbour. If equidistant, rounds away from zero .
   */
  ROUND_HALF_UP: 4,

  /**
   * Rounds towards nearest neighbour. If equidistant, rounds towards zero.
   */
  ROUND_HALF_DOWN: 5,

  /**
   * Rounds towards nearest neighbour. If equidistant, rounds towards even neighbour.
   */
  ROUND_HALF_EVEN: 6,

  /**
   * Rounds towards nearest neighbour. If equidistant, rounds towards Infinity.
   */
  ROUND_HALF_CEIL: 7,

  /**
   * Rounds towards nearest neighbour. If equidistant, rounds towards -Infinity.
   */
  ROUND_HALF_FLOOR: 8
}

export interface BigNumber {
  /**
   * Returns the value of this BigNumber as a JavaScript primitive number.
   *
   * Using the unary plus operator gives the same result.
   *
   * ```ts
   * x = new BigNumber(456.789)
   * x.toNumber()                    // 456.789
   * +x                              // 456.789
   * y = new BigNumber('45987349857634085409857349856430985')
   *
   * y.toNumber()                    // 4.598734985763409e+34
   *
   * z = new BigNumber(-0)
   * 1 / z.toNumber()                // -Infinity
   * 1 / +z                          // -Infinity
   * ```
   */
  toNumber(): number

  /**
   * Returns a string representing the value of this BigNumber in base `base`, or base 10 if `base`
   * is omitted or is `null` or `undefined`.
   *
   * For bases above 10, and using the default base conversion alphabet (see `ALPHABET`), values
   * from 10 to 35 are represented by a-z (the same as `Number.prototype.toString`).
   *
   * If a base is specified the value is rounded according to the current `DECIMAL_PLACES` and
   * `ROUNDING_MODE` settings, otherwise it is not.
   *
   * If a base is not specified, and this BigNumber has a positive exponent that is equal to or
   * greater than the positive component of the current `EXPONENTIAL_AT` setting, or a negative
   * exponent equal to or less than the negative component of the setting, then exponential notation
   * is returned.
   *
   * If `base` is `null` or `undefined` it is ignored.
   *
   * Throws if `base` is invalid.
   *
   * ```ts
   * x = new BigNumber(750000)
   * x.toString()                    // '750000'
   * config({ EXPONENTIAL_AT: 5 })
   * x.toString()                    // '7.5e+5'
   *
   * y = new BigNumber(362.875)
   * y.toString(2)                   // '101101010.111'
   * y.toString(9)                   // '442.77777777777777777778'
   * y.toString(32)                  // 'ba.s'
   *
   * config({ DECIMAL_PLACES: 4 });
   * z = new BigNumber('1.23456789')
   * z.toString()                    // '1.23456789'
   * z.toString(10)                  // '1.2346'
   * ```
   *
   * @param [base] The base, integer, 2 to 36 (or `ALPHABET.length`, see `ALPHABET`).
   */
  toString(base?: number): string

  /**
   * As `toString`, but does not accept a base argument and includes the minus sign for negative
   * zero.
   *
   * ``ts
   * x = new BigNumber('-0')
   * x.toString()                    // '0'
   * x.valueOf()                     // '-0'
   * y = new BigNumber('1.777e+457')
   * y.valueOf()                     // '1.777e+457'
   * ```
   */
  valueOf(): string

  /**
   * Returns a BigNumber whose value is the value of this BigNumber divided by `n`, rounded
   * according to the current `DECIMAL_PLACES` and `ROUNDING_MODE` settings.
   *
   * ```ts
   * x = new BigNumber(355)
   * y = new BigNumber(113)
   * x.dividedBy(y)                  // '3.14159292035398230088'
   * x.dividedBy(5)                  // '71'
   * x.dividedBy(47, 16)             // '5'
   * ```
   *
   * @param n A numeric value.
   * @param [base] The base of n.
   */
  dividedBy(n: BigNumberValueType, base?: number): BigNumber

  /**
   * Returns a BigNumber whose value is the value of this BigNumber rounded to an integer using
   * rounding mode `rm`.
   *
   * If `rm` is omitted, or is `null` or `undefined`, `ROUNDING_MODE` is used.
   *
   * Throws if `rm` is invalid.
   *
   * ```ts
   * x = new BigNumber(123.456)
   * x.integerValue()                        // '123'
   * x.integerValue(BigNumber.ROUND_CEIL)    // '124'
   * y = new BigNumber(-12.7)
   * y.integerValue()                        // '-13'
   * x.integerValue(BigNumber.ROUND_DOWN)    // '-12'
   * ```
   *
   * @param {BigNumber.RoundingMode} [rm] The roundng mode, an integer, 0 to 8.
   */
  integerValue(rm?: BigNumberRoundingModeType): BigNumber

  /**
   * Returns `true` if the value of this BigNumber is less than the value of `n`, otherwise returns
   * `false`.
   *
   * ```ts
   * (0.3 - 0.2) < 0.1                       // true
   * x = new BigNumber(0.3).minus(0.2)
   * x.isLessThan(0.1)                       // false
   * BigNumber(0).isLessThan(x)              // true
   * BigNumber(11.1, 2).isLessThan(11, 3)    // true
   * ```
   *
   * @param n A numeric value.
   * @param [base] The base of n.
   */
  isLessThan(n: BigNumberValueType, base?: number): boolean

  /**
   * Returns a BigNumber whose value is the value of this BigNumber multiplied by `n`.
   *
   * The return value is always exact and unrounded.
   *
   * ```ts
   * 0.6 * 3                         // 1.7999999999999998
   * x = new BigNumber(0.6)
   * y = x.times(3)                  // '1.8'
   * BigNumber('7e+500').times(y)    // '1.26e+501'
   * x.times('-a', 16)               // '-6'
   * ```
   *
   * @param n A numeric value.
   * @param [base] The base of n.
   */
  times(n: BigNumberValueType, base?: number): BigNumber
}
