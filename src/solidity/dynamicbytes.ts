import f = require('./formatters')
import { SolidityType } from './type'

export class SolidityTypeDynamicBytes extends SolidityType {
  constructor() {
    super({
      inputFormatter: f.formatInputDynamicBytes,
      outputFormatter: f.formatOutputDynamicBytes
    })
  }

  // tslint:disable-next-line:prefer-function-over-method
  isType(name) {
    return !!name.match(/^bytes(\[([0-9]*)\])*$/)
  }

  // tslint:disable-next-line:prefer-function-over-method
  isDynamicType() {
    return true
  }
}
