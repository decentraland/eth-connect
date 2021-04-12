import * as f from './formatters'
import { SolidityType } from './type'

export class SolidityTypeDynamicBytes extends SolidityType<string> {
  constructor() {
    super({
      inputFormatter: f.formatInputDynamicBytes,
      outputFormatter: f.formatOutputDynamicBytes
    })
  }

  // tslint:disable-next-line:prefer-function-over-method
  isType(name: string) {
    return !!name.match(/^bytes(\[([0-9]*)\])*$/)
  }

  // tslint:disable-next-line:prefer-function-over-method
  isDynamicType() {
    return true
  }
}
