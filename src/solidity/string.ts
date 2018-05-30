import f = require('./formatters')
import { SolidityType } from './type'

export class SolidityTypeString extends SolidityType {
  constructor() {
    super({
      inputFormatter: f.formatInputString,
      outputFormatter: f.formatOutputString
    })
  }

  // tslint:disable-next-line:prefer-function-over-method
  isType(name: string) {
    return !!name.match(/^string(\[([0-9]*)\])*$/)
  }

  // tslint:disable-next-line:prefer-function-over-method
  isDynamicType() {
    return true
  }
}
