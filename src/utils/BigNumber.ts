export type BigNumberRoundingModeType = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8

export enum BigNumberRoundingMode {
  /**
   * Rounds away from zero.
   */
  ROUND_UP = 0,

  /**
   * Rounds towards zero.
   */
  ROUND_DOWN = 1,

  /**
   * Rounds towards Infinity.
   */
  ROUND_CE = 2,

  /**
   * Rounds towards -Infinity.
   */
  ROUND_FLOOR = 3,

  /**
   * Rounds towards nearest neighbour. If equidistant, rounds away from zero .
   */
  ROUND_HALF_UP = 4,

  /**
   * Rounds towards nearest neighbour. If equidistant, rounds towards zero.
   */
  ROUND_HALF_DOWN = 5,

  /**
   * Rounds towards nearest neighbour. If equidistant, rounds towards even neighbour.
   */
  ROUND_HALF_EVEN = 6,

  /**
   * Rounds towards nearest neighbour. If equidistant, rounds towards Infinity.
   */
  ROUND_HALF_CEIL = 7,

  /**
   * Rounds towards nearest neighbour. If equidistant, rounds towards -Infinity.
   */
  ROUND_HALF_FLOOR = 8,
}
