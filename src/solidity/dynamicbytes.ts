import f = require('./formatters')
import { SolidityType } from './type'

export class SolidityTypeDynamicBytes extends SolidityType {
  constructor() {
    super({
      inputFormatter: f.formatInputDynamicBytes,
      outputFormatter: f.formatOutputDynamicBytes
    })
  }

  isType(name) {
    return !!name.match(/^bytes(\[([0-9]*)\])*$/)
  }
  isDynamicType() {
    return true
  }
}
