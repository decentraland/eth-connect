import * as f from './formatters'
import { SolidityType } from './type'

/**
 * SolidityTypeBytes is a prototype that represents the bytes type.
 * It matches:
 * bytes
 * bytes[]
 * bytes[4]
 * bytes[][]
 * bytes[3][]
 * bytes[][6][], ...
 * bytes32
 * bytes8[4]
 * bytes[3][]
 */
export class SolidityTypeBytes extends SolidityType {
  constructor() {
    super({
      inputFormatter: f.formatInputBytes,
      outputFormatter: f.formatOutputBytes
    })
  }
  // tslint:disable-next-line:prefer-function-over-method
  isType(name) {
    return !!name.match(/^bytes([0-9]{1,})(\[([0-9]*)\])*$/)
  }
}
