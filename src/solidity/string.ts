import f = require('./formatters')
import { SolidityType } from './type'

export class SolidityTypeString extends SolidityType {
  constructor() {
    super({
      inputFormatter: f.formatInputString,
      outputFormatter: f.formatOutputString
    })
  }
  isType(name: string) {
    return !!name.match(/^string(\[([0-9]*)\])*$/)
  }
  isDynamicType() {
    return true
  }
}
