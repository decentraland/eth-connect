/*
    This file is part of web3.js.

    web3.js is free software: you can redistribute it and/or modify
    it under the terms of the GNU Lesser General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    web3.js is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Lesser General Public License for more details.

    You should have received a copy of the GNU Lesser General Public License
    along with web3.js.  If not, see <http://www.gnu.org/licenses/>.
*/

import { AbiCoder, ParamType } from '@ethersproject/abi'
import * as formatter from './formatters'
import * as utils from '../utils/utils'

import { SolidityTypeAddress } from './address'
import { SolidityTypeBool } from './bool'
import { SolidityTypeInt } from './int'
import { SolidityTypeUInt } from './uint'
import { SolidityTypeDynamicBytes } from './dynamicbytes'
import { SolidityTypeString } from './string'
import { SolidityTypeReal } from './real'
import { SolidityTypeUReal } from './ureal'
import { SolidityTypeBytes } from './bytes'
import { SolidityType } from './type'


var ethersAbiCoder = new AbiCoder(function (_, value) {
  if (utils.isObject(value) && value.constructor.name === 'BigNumber') {
    return utils.toBigNumber(value.toString())
  }

  if (!utils.isArray(value) && (!utils.isObject(value) || value.constructor.name !== 'BN')) {
    return value.toString()
  }

  return value
})

// result method
class Result {
}

function isDynamic(solidityType: SolidityType<any>, type: string) {
  return solidityType.isDynamicType(type) || solidityType.isDynamicArray(type)
}

/**
 * SolidityCoder prototype should be used to encode/decode solidity params of any type
 */
export class SolidityCoder {
  _types: SolidityType<any>[]

  constructor(types: SolidityType<any>[]) {
    this._types = types
  }

  /**
   * This method should be used to transform type to SolidityType
   *
   * @param {string} type
   * @returns {SolidityType}
   * @throws {Error} throws if no matching type is found
   */
  _requireType(type: string): SolidityType<unknown> {
    let solidityType = this._types.filter(function (t) {
      return t.isType(type)
    })[0]

    if (!solidityType) {
      throw Error('invalid solidity type!: ' + type)
    }

    return solidityType
  }

  /**
   * Should be used to encode plain param
   *
   * @method encodeParam
   * @param {string} type
   * @param {object} plain param
   * @return {string} encoded plain param
   */
  encodeParam(type: string, param: any): string {
    return this.encodeParams([type], [param])
  }

  /**
   * Should be used to encode list of params
   *
   * @method encodeParams
   * @param {Array} types
   * @param {Array} params
   * @return {string} encoded list of params
   */
  encodeParams(types: any, params: any[]): string {
    var self = this
    types = self.mapTypes(types)
    params = params.map(function (param, index) {
      let type = types[index]
      if (typeof type === 'object' && type.type) {
        // We may get a named type of shape {name, type}
        type = type.type
      }

      param = self.formatParam(type, param)

      // Format params for tuples
      if (typeof type === 'string' && type.includes('tuple')) {
        const coder = ethersAbiCoder._getCoder(ParamType.from(type))

        const modifyParams = (coder: any, param: any) => {
          if (coder.name === 'array') {
            return param.map((p: any) =>
              modifyParams(
                ethersAbiCoder._getCoder(ParamType.from(coder.type.replace('[]', ''))),
                p
              )
            )
          }
          coder.coders.forEach((c: any, i: any) => {
            if (c.name === 'tuple') {
              modifyParams(c, param[i])
            } else {
              param[i] = self.formatParam(c.name, param[i])
            }
          })
        }
        modifyParams(coder, param)
      }

      return param
    })

    return ethersAbiCoder.encode(types, params)
  }

  formatParam(type: any, param: any) {
    const paramTypeBytes = new RegExp(/^bytes([0-9]*)$/)
    const paramTypeBytesArray = new RegExp(/^bytes([0-9]*)\[\]$/)
    const paramTypeNumber = new RegExp(/^(u?int)([0-9]*)$/)
    const paramTypeNumberArray = new RegExp(/^(u?int)([0-9]*)\[\]$/)

    // @TODO: Add BN as legacy codebase
    // Format BN to string
    if (utils.isBigNumber(param)) {
      return param.toString(10)
    }

    if (type.match(paramTypeBytesArray) || type.match(paramTypeNumberArray)) {
      return param.map((p: any) => this.formatParam(type.replace('[]', ''), p))
    }

    // Format correct width for u?int[0-9]*
    let match = type.match(paramTypeNumber)
    if (match) {
      let size = parseInt(match[2] || "256")
      if (size / 8 < param.length) {
        // pad to correct bit width
        param = utils.padLeft(param, size)
      }
    }

    // Format correct length for bytes[0-9]+
    match = type.match(paramTypeBytes)
    if (match) {
      // @TODO: check if we can install Buffer
      // if (Buffer.isBuffer(param)) {
      //   param = utils.toHex(param)
      // }

      // format to correct length
      let size = parseInt(match[1])
      if (size) {
        let maxSize = size * 2
        if (param.substring(0, 2) === '0x') {
          maxSize += 2
        }
        if (param.length < maxSize) {
          // pad to correct length
          param = utils.padRight(param, size * 2)
        }
      }

      // format odd-length bytes to even-length
      if (param.length % 2 === 1) {
        param = '0x0' + param.substring(2)
      }
    }

    return param
  };


  /**
 * Map types if simplified format is used
 *
 * @method mapTypes
 * @param {Array} types
 * @return {Array}
 */
  mapTypes(types: any) {
    var self = this
    var mappedTypes: any = []

    types.forEach(function (type: any) {
      // Remap `function` type params to bytes24 since Ethers does not
      // recognize former type. Solidity docs say `Function` is a bytes24
      // encoding the contract address followed by the function selector hash.
      if (typeof type === 'object' && type.type === 'function') {
        type = Object.assign({}, type, { type: "bytes24" })
      }
      if (self.isSimplifiedStructFormat(type)) {
        var structName = Object.keys(type)[0]
        mappedTypes.push(
          Object.assign(
            self.mapStructNameAndType(structName),
            {
              components: self.mapStructToCoderFormat(type[structName])
            }
          )
        )

        return
      }

      mappedTypes.push(type)
    })

    console.log('c', mappedTypes)
    return mappedTypes
  }

  mapStructNameAndType(structName: string) {
    var type = 'tuple'

    if (structName.indexOf('[]') > -1) {
      type = 'tuple[]'
      structName = structName.slice(0, -2)
    }

    return { type: type, name: structName }
  };

  mapStructToCoderFormat(struct: any) {
    var self = this
    var components: any = []
    Object.keys(struct).forEach(function (key) {
      if (typeof struct[key] === 'object') {
        components.push(
          Object.assign(
            self.mapStructNameAndType(key),
            {
              components: self.mapStructToCoderFormat(struct[key])
            }
          )
        )

        return
      }

      components.push({
        name: key,
        type: struct[key]
      })
    })

    return components
  };


  isSimplifiedStructFormat(type: any) {
    return typeof type === 'object' && typeof type.components === 'undefined' && typeof type.name === 'undefined'
  };

  encodeMultiWithOffset(
    types: string[],
    solidityTypes: SolidityType<any>[],
    encodeds: (string | string[])[],
    _dynamicOffset: number
  ): string {
    let dynamicOffset = _dynamicOffset
    let results: string[] = []

    types.forEach((_, i) => {
      if (isDynamic(solidityTypes[i], types[i])) {
        results.push(formatter.formatInputInt(dynamicOffset).encode())
        let e = this.encodeWithOffset(types[i], solidityTypes[i], encodeds[i], dynamicOffset)
        dynamicOffset += e.length / 2
      } else {
        // don't add length to dynamicOffset. it's already counted
        results.push(this.encodeWithOffset(types[i], solidityTypes[i], encodeds[i], dynamicOffset))
      }

      // TODO: figure out nested arrays
    })

    types.forEach((_, i) => {
      if (isDynamic(solidityTypes[i], types[i])) {
        let e = this.encodeWithOffset(types[i], solidityTypes[i], encodeds[i], dynamicOffset)
        dynamicOffset += e.length / 2
        results.push(e)
      }
    })
    return results.join('')
  }

  // tslint:disable-next-line:prefer-function-over-method
  encodeWithOffset(type: string, solidityType: SolidityType<any>, encoded: string | string[], offset: number): string {
    /* jshint maxcomplexity: 17 */
    /* jshint maxdepth: 5 */

    let encodingMode = { dynamic: 1, static: 2, other: 3 }

    let mode = solidityType.isDynamicArray(type)
      ? encodingMode.dynamic
      : solidityType.isStaticArray(type)
        ? encodingMode.static
        : encodingMode.other

    if (mode !== encodingMode.other) {
      let nestedName = solidityType.nestedName(type)
      let nestedStaticPartLength = solidityType.staticPartLength(nestedName)
      let results: string[] = []

      if (mode === encodingMode.dynamic) {
        results.push(encoded[0] as string)
      }

      if (solidityType.isDynamicArray(nestedName)) {
        let previousLength = mode === encodingMode.dynamic ? 2 : 0

        for (let i = 0; i < encoded.length; i++) {
          // calculate length of previous item
          if (mode === encodingMode.dynamic) {
            previousLength += +encoded[i - 1][0] || 0
          } else if (mode === encodingMode.static) {
            previousLength += +(encoded[i - 1] || [])[0] || 0
          }
          results.push(formatter.formatInputInt(offset + i * nestedStaticPartLength + previousLength * 32).encode())
        }
      }

      let len = mode === encodingMode.dynamic ? encoded.length - 1 : encoded.length
      for (let c = 0; c < len; c++) {
        let additionalOffset = results.join('').length / 2
        if (mode === encodingMode.dynamic) {
          results.push(this.encodeWithOffset(nestedName, solidityType, encoded[c + 1], offset + additionalOffset))
        } else if (mode === encodingMode.static) {
          results.push(this.encodeWithOffset(nestedName, solidityType, encoded[c], offset + additionalOffset))
        }
      }

      return results.join('')
    }

    if (typeof encoded != 'string') {
      throw new Error('Encoded is not string')
    }

    return encoded as any
  }

  /**
   * Should be used to decode bytes to plain param
   *
   * @method decodeParam
   * @param {string} type
   * @param {string} bytes
   * @return {object} plain param
   */
  decodeParam(type: string, bytes: string) {
    return this.decodeParams([type], bytes)[0]
  }

  /**
   * Should be used to decode list of params
   *
   * @method decodeParam
   * @param {Array} types
   * @param {string} bytes
   * @return {Array} array of plain params
   */
  decodeParams(outputs: string[], bytes: string): any {
    return this.decodeParametersWith(outputs, bytes)
  }



  decodeParametersWith(outputs: any, bytes: string) {
    if (outputs.length > 0 && (!bytes || bytes === '0x' || bytes === '0X')) {
      throw new Error(
        'Returned values aren\'t valid, did it run Out of Gas? ' +
        'You might also see this error if you are not using the ' +
        'correct ABI for the contract you are retrieving data from, ' +
        'requesting data from a block number that does not exist, ' +
        'or querying a node which is not fully synced.'
      )
    }

    console.log('a', outputs)

    var res = ethersAbiCoder.decode(this.mapTypes(outputs), '0x' + bytes.replace(/0x/i, ''))
    console.log('b', res)
    var returnValue: any = new Result()
    returnValue.__length__ = 0

    outputs.forEach(function (output: any, i: any) {
      var decodedValue = res[returnValue.__length__]
      decodedValue = (decodedValue === '0x') ? null : decodedValue

      returnValue[i] = decodedValue

      if (utils.isObject(output) && (output as any).name) {
        returnValue[(output as any).name] = decodedValue
      }

      returnValue.__length__++
    })

    return returnValue
  };

  // tslint:disable-next-line:prefer-function-over-method
  getOffsets(types: string[], solidityTypes: SolidityType<any>[]): number[] {
    let lengths = solidityTypes.map(function (solidityType, index) {
      return solidityType.staticPartLength(types[index])
    })

    for (let i = 1; i < lengths.length; i++) {
      // sum with length of previous element
      lengths[i] += lengths[i - 1]
    }

    return lengths.map(function (length, index) {
      // remove the current length, so the length is sum of previous elements
      let staticPartLength = solidityTypes[index].staticPartLength(types[index])
      return length - staticPartLength
    })
  }

  getSolidityTypes(types: string[]): SolidityType<any>[] {
    return types.map((type) => this._requireType(type))
  }
}

export const coder = new SolidityCoder([
  new SolidityTypeAddress(),
  new SolidityTypeBool(),
  new SolidityTypeInt(),
  new SolidityTypeUInt(),
  new SolidityTypeDynamicBytes(),
  new SolidityTypeBytes(),
  new SolidityTypeString(),
  new SolidityTypeReal(),
  new SolidityTypeUReal()
])
