import { AbiInput, AbiOutput } from '../Schema'
import { coder } from './coder'
import { SolidityParam } from './param'
import { SolidityType } from './type'

export type TupleValue = Array<any>

export function formatInputTuple(value: TupleValue, input: AbiInput) {
  return new SolidityParam(coder.encodeParams(input.components!, value))
}

export function formatOutputTuple(_param: SolidityParam, output: AbiOutput): TupleValue {
  return coder.decodeParams(output.components!, _param.value)
}

/**
 * SolidityTypeTuple is a prootype that represents tuple type
 * It matches:
 * tuple
 * tuple[]
 * tuple[4]
 * tuple[][]
 * tuple[3][]
 * tuple[][6][], ...
 */
export class SolidityTypeTuple extends SolidityType<TupleValue> {
  constructor() {
    super({
      inputFormatter: formatInputTuple,
      outputFormatter: formatOutputTuple
    })
  }

  // tslint:disable-next-line:prefer-function-over-method
  isType(name: string) {
    return !!name.match(/^tuple([0-9]*)?(\[([0-9]*)\])*$/)
  }
}
