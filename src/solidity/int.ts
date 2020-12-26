import * as f from './formatters'
import { SolidityType } from './type'

/**
 * SolidityTypeInt is a prootype that represents int type
 * It matches:
 * int
 * int[]
 * int[4]
 * int[][]
 * int[3][]
 * int[][6][], ...
 * int32
 * int64[]
 * int8[4]
 * int256[][]
 * int[3][]
 * int64[][6][], ...
 */
export class SolidityTypeInt extends SolidityType {
  constructor() {
    super({
      inputFormatter: f.formatInputInt,
      outputFormatter: f.formatOutputInt
    })
  }

  // tslint:disable-next-line:prefer-function-over-method
  isType(name) {
    return !!name.match(/^int([0-9]*)?(\[([0-9]*)\])*$/)
  }
}
