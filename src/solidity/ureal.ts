import * as f from './formatters'
import { SolidityType } from './type'

/**
 * SolidityTypeUReal is a prootype that represents ureal type
 * It matches:
 * ureal
 * ureal[]
 * ureal[4]
 * ureal[][]
 * ureal[3][]
 * ureal[][6][], ...
 * ureal32
 * ureal64[]
 * ureal8[4]
 * ureal256[][]
 * ureal[3][]
 * ureal64[][6][], ...
 */
export class SolidityTypeUReal extends SolidityType {
  constructor() {
    super({
      inputFormatter: f.formatInputReal,
      outputFormatter: f.formatOutputUReal
    })
  }

  // tslint:disable-next-line:prefer-function-over-method
  isType(name) {
    return !!name.match(/^ureal([0-9]*)?(\[([0-9]*)\])*$/)
  }
}
