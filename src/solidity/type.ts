import { AbiInput } from '../Schema'
import * as f from './formatters'
import { SolidityParam } from './param'

/**
 * SolidityType prototype is used to encode/decode solidity params of certain type
 */
export abstract class SolidityType<ValueType> {
  inputFormatter: (value: ValueType, type: AbiInput) => SolidityParam
  outputFormatter: (param: SolidityParam, type: AbiInput) => ValueType

  constructor(config: {
    inputFormatter: (value: ValueType, type: AbiInput) => SolidityParam
    outputFormatter: (param: SolidityParam, type: AbiInput) => ValueType
  }) {
    this.inputFormatter = config.inputFormatter
    this.outputFormatter = config.outputFormatter
  }

  /**
   * Should be used to determine if this SolidityType do match given name
   *
   * @method isType
   * @param {string} name
   * @return {Bool} true if type match this SolidityType, otherwise false
   */
  abstract isType(name: string): boolean

  /**
   * Should be used to determine what is the length of static part in given type
   *
   * @method staticPartLength
   * @param {string} name
   * @return {number} length of static part in bytes
   */
  staticPartLength(name: string): number {
    // If name isn't an array then treat it like a single element array.
    return (this.nestedTypes(name) || ['[1]'])
      .map(function (type) {
        // the length of the nested array
        return parseInt(type.slice(1, -1), 10) || 1
      })
      .reduce(function (previous, current) {
        return previous * current
        // all basic types are 32 bytes long
      }, 32)
  }

  /**
   * Should be used to determine if type is dynamic array
   * eg:
   * "type[]" => true
   * "type[4]" => false
   *
   * @method isDynamicArray
   * @param {string} name
   * @return {bool} true if the type is dynamic array
   */
  isDynamicArray(name: string): boolean {
    let nestedTypes = this.nestedTypes(name)
    return !!nestedTypes && !nestedTypes[nestedTypes.length - 1].match(/[0-9]{1,}/g)
  }

  /**
   * Should be used to determine if type is static array
   * eg:
   * "type[]" => false
   * "type[4]" => true
   *
   * @method isStaticArray
   * @param {string} name
   * @return {Bool} true if the type is static array
   */
  isStaticArray(name: string): boolean {
    let nestedTypes = this.nestedTypes(name)
    return !!nestedTypes && !!nestedTypes[nestedTypes.length - 1].match(/[0-9]{1,}/g)
  }

  /**
   * Should return length of static array
   * eg.
   * "int[32]" => 32
   * "int256[14]" => 14
   * "int[2][3]" => 3
   * "int" => 1
   * "int[1]" => 1
   * "int[]" => 1
   *
   * @method staticArrayLength
   * @param {string} name
   * @return {number} static array length
   */
  staticArrayLength(name: string): number {
    let nestedTypes = this.nestedTypes(name)
    if (nestedTypes) {
      const match = nestedTypes[nestedTypes.length - 1].match(/[0-9]{1,}/g)
      if (!match) throw new Error('untested path')
      return parseInt(match[match.length - 1] || '1', 10)
    }
    return 1
  }

  /**
   * Should return nested type
   * eg.
   * "int[32]" => "int"
   * "int256[14]" => "int256"
   * "int[2][3]" => "int[2]"
   * "int" => "int"
   * "int[]" => "int"
   *
   * @method nestedName
   * @param {string} name
   * @return {string} nested name
   */
  nestedName(name: string): string {
    // remove last [] in name
    let nestedTypes = this.nestedTypes(name)
    if (!nestedTypes) {
      return name
    }

    return name.substr(0, name.length - nestedTypes[nestedTypes.length - 1].length)
  }

  /**
   * Should return true if type has dynamic size by default
   * such types are "string", "bytes"
   *
   * @method isDynamicType
   * @param {string} name
   * @return {Bool} true if is dynamic, otherwise false
   */
  // tslint:disable-next-line:prefer-function-over-method
  isDynamicType(_?: string): boolean {
    return false
  }

  /**
   * Should return array of nested types
   * eg.
   * "int[2][3][]" => ["[2]", "[3]", "[]"]
   * "int[] => ["[]"]
   * "int" => null
   *
   * @method nestedTypes
   * @param {string} name
   * @return {Array} array of nested types
   */
  // tslint:disable-next-line:prefer-function-over-method
  nestedTypes(name: string): string[] | null {
    // return list of strings eg. "[]", "[3]", "[]", "[2]"
    return name.match(/(\[[0-9]*\])/g)
  }

  /**
   * Should be used to encode the value
   *
   * @method encode
   * @param {object} value
   * @param {string} inputType
   * @return {string} encoded value
   */
  encode(value: any, inputType: AbiInput): string | string[] {
    if (this.isDynamicArray(inputType.type)) {
      let length = value.length // in int
      let nestedName = this.nestedName(inputType.type)

      let result = []
      result.push(f.formatInputInt(length).encode())

      value.forEach((v: any) => {
        result.push(this.encode(v, { ...inputType, type: nestedName }))
      })

      return result
    } else if (this.isStaticArray(inputType.type)) {
      let length = this.staticArrayLength(inputType.type) // in int
      let nestedName = this.nestedName(inputType.type)

      let result: string[] = []
      for (let i = 0; i < length; i++) {
        result.push(this.encode(value[i], { ...inputType, type: nestedName }) as string)
      }

      return result
    }

    return this.inputFormatter(value, inputType).encode()
  }

  /**
   * Should be used to decode value from bytes
   *
   * @method decode
   * @param {string} bytes
   * @param {number} offset in bytes
   * @param {string} outputType type name
   * @returns {object} decoded value
   */
  decode(bytes: string, offset: number, outputType: AbiInput): any {
    if (this.isDynamicArray(outputType.type)) {
      let arrayOffset = parseInt('0x' + bytes.substr(offset * 2, 64), 16) // in bytes
      let length = parseInt('0x' + bytes.substr(arrayOffset * 2, 64), 16) // in int
      let arrayStart = arrayOffset + 32 // array starts after length; // in bytes

      let nestedName = this.nestedName(outputType.type)
      let nestedStaticPartLength = this.staticPartLength(nestedName) // in bytes
      let roundedNestedStaticPartLength = Math.floor((nestedStaticPartLength + 31) / 32) * 32
      let result = []

      for (let i = 0; i < length * roundedNestedStaticPartLength; i += roundedNestedStaticPartLength) {
        result.push(this.decode(bytes, arrayStart + i, { ...outputType, type: nestedName }))
      }

      return result
    } else if (this.isStaticArray(outputType.type)) {
      let length = this.staticArrayLength(outputType.type) // in int
      let arrayStart = offset // in bytes

      let nestedName = this.nestedName(outputType.type)
      let nestedStaticPartLength = this.staticPartLength(nestedName) // in bytes
      let roundedNestedStaticPartLength = Math.floor((nestedStaticPartLength + 31) / 32) * 32
      let result = []

      for (let i = 0; i < length * roundedNestedStaticPartLength; i += roundedNestedStaticPartLength) {
        result.push(this.decode(bytes, arrayStart + i, { ...outputType, type: nestedName }))
      }

      return result
    } else if (this.isDynamicType(outputType.type)) {
      let dynamicOffset = parseInt('0x' + bytes.substr(offset * 2, 64), 16) // in bytes
      let length = parseInt('0x' + bytes.substr(dynamicOffset * 2, 64), 16) // in bytes
      let roundedLength = Math.floor((length + 31) / 32) // in int
      let param = new SolidityParam(bytes.substr(dynamicOffset * 2, (1 + roundedLength) * 64), 0)
      return this.outputFormatter(param, outputType)
    }

    let length = this.staticPartLength(outputType.type)
    let param = new SolidityParam(bytes.substr(offset * 2, length * 2))
    return this.outputFormatter(param, outputType)
  }
}
