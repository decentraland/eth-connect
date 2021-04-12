import * as f from './formatters'
import { SolidityType } from './type'

/**
 * SolidityTypeBool is a prootype that represents bool type
 * It matches:
 * bool
 * bool[]
 * bool[4]
 * bool[][]
 * bool[3][]
 * bool[][6][], ...
 */
export class SolidityTypeBool extends SolidityType<boolean> {
  constructor() {
    super({
      inputFormatter: f.formatInputBool,
      outputFormatter: f.formatOutputBool
    })
  }
  isType(name: string) {
    return !!name.match(/^bool(\[([0-9]*)\])*$/)
  }
}
