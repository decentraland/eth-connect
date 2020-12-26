import * as f from './formatters'
import { SolidityType } from './type'

export class SolidityTypeAddress extends SolidityType {
  constructor() {
    super({
      inputFormatter: f.formatInputInt,
      outputFormatter: f.formatOutputAddress
    })
  }

  // tslint:disable-next-line:prefer-function-over-method
  isType(name) {
    return !!name.match(/address(\[([0-9]*)\])?/)
  }
}
