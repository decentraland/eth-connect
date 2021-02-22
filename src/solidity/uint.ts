import BigNumber from 'bignumber.js'
import * as f from './formatters'
import { SolidityType } from './type'

/**
 * SolidityTypeUInt is a prootype that represents uint type
 * It matches:
 * uint
 * uint[]
 * uint[4]
 * uint[][]
 * uint[3][]
 * uint[][6][], ...
 * uint32
 * uint64[]
 * uint8[4]
 * uint256[][]
 * uint[3][]
 * uint64[][6][], ...
 */
export class SolidityTypeUInt extends SolidityType<BigNumber> {
  constructor() {
    super({
      inputFormatter: f.formatInputInt,
      outputFormatter: f.formatOutputUInt
    })
  }

  // tslint:disable-next-line:prefer-function-over-method
  isType(name: string) {
    return !!name.match(/^uint([0-9]*)?(\[([0-9]*)\])*$/)
  }
}
