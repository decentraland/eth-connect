import f = require('./formatters')
import { SolidityType } from './type'

export class SolidityTypeAddress extends SolidityType {
  constructor() {
    super({
      inputFormatter: f.formatInputInt,
      outputFormatter: f.formatOutputAddress
    })
  }

  // tslint:disable-next-line:prefer-function-over-method
  isType(name: string) {
    return !!name.match(/address(\[([0-9]*)\])?/)
  }
}
