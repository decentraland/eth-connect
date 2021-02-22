import * as f from './formatters'
import { SolidityType } from './type'

export class SolidityTypeAddress extends SolidityType<string> {
  constructor() {
    super({
      inputFormatter: f.formatInputAddress,
      outputFormatter: f.formatOutputAddress
    })
  }

  // tslint:disable-next-line:prefer-function-over-method
  isType(name: string) {
    return !!name.match(/address(\[([0-9]*)\])?/)
  }
}
