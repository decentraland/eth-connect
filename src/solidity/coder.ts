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
import * as utils from '../utils/utils'


const ethersAbiCoder = new AbiCoder(function (_, value) {
  if (utils.isObject(value) && (utils.isBigNumber(value) || (value as any)._isBigNumber || value.constructor.name === 'BigNumber')) {
    return utils.toBigNumber(value.toString())
  }

  if (!utils.isBoolean(value) && !utils.isArray(value) && (!utils.isObject(value) || value.constructor.name !== 'BN')) {
    return value.toString()
  }

  return value
})

// result method
class Result {
}

/**
 * SolidityCoder prototype should be used to encode/decode solidity params of any type
 */
export class SolidityCoder {
  /**
   * Should be used to encode plain param
   *
   * @method encodeParam
   * @param {any} type
   * @param {object} plain param
   * @return {string} encoded plain param
   */
  encodeParam(type: any, param: any): string {
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
    const self = this
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

  /**
   * Handle some formatting of params for backwards compatability with Ethers V4
   *
   * @method formatParam
   * @param {any} - type
   * @param {any} - param
   * @return {any} - The formatted param
   */
  formatParam(type: any, param: any): any {
    const paramTypeBytes = new RegExp(/^bytes([0-9]*)$/)
    const paramTypeBytesArray = new RegExp(/^bytes([0-9]*)\[\]$/)
    const paramTypeNumber = new RegExp(/^(u?int)([0-9]*)$/)
    const paramTypeNumberArray = new RegExp(/^(u?int)([0-9]*)\[\]$/)

    // Format BN to string
    // @TODO: check if we need BN here
    if (/*utils.isBN(param) ||*/ utils.isBigNumber(param)) {
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
  mapTypes(types: any[]) {
    const self = this
    const mappedTypes: any = []

    types.forEach(function (type: any) {
      // Remap `function` type params to bytes24 since Ethers does not
      // recognize former type. Solidity docs say `Function` is a bytes24
      // encoding the contract address followed by the function selector hash.
      if (typeof type === 'object' && type.type === 'function') {
        type = Object.assign({}, type, { type: "bytes24" })
      }
      if (self.isSimplifiedStructFormat(type)) {
        const structName = Object.keys(type)[0]
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

    return mappedTypes
  }

  /**
   * Maps the correct tuple type and name when the simplified format in encode/decodeParameter is used
   *
   * @method mapStructNameAndType
   * @param {string} structName
   * @return {{type: string, name: *}}
   */
  mapStructNameAndType(structName: string): { type: string, name: string } {
    let type = 'tuple'

    if (structName.indexOf('[]') > -1) {
      type = 'tuple[]'
      structName = structName.slice(0, -2)
    }

    return { type: type, name: structName }
  };

  /**
   * Maps the simplified format in to the expected format of the ABICoder
   *
   * @method mapStructToCoderFormat
   * @param {Object} struct
   * @return {Array}
   */
  mapStructToCoderFormat(struct: any): any[] {
    const self = this
    const components: any = []
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


  /**
   * Check if type is simplified struct format
   *
   * @method isSimplifiedStructFormat
   * @param {string | Object} type
   * @returns {boolean}
   */
  isSimplifiedStructFormat(type: any): boolean {
    return typeof type === 'object' && typeof type.components === 'undefined' && typeof type.name === 'undefined'
  }

  /**
   * Should be used to decode bytes to plain param
   *
   * @method decodeParam
   * @param {string} type
   * @param {string} bytes
   * @return {object} plain param
   */
  decodeParam(type: string, bytes: string): any {
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

  /**
 * Should be used to decode list of params
 *
 * @method decodeParameter
 * @param {Array} outputs
 * @param {String} bytes
 * @param {Boolean} loose
 * @return {Array} array of plain params
 */
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

    const res = ethersAbiCoder.decode(this.mapTypes(outputs), '0x' + bytes.replace(/0x/i, ''))
    const returnValue: any = new Result()
    returnValue.__length__ = 0

    outputs.forEach(function (output: any, i: any) {
      let decodedValue = res[returnValue.__length__]
      decodedValue = (decodedValue === '0x') ? null : decodedValue

      returnValue[i] = decodedValue

      if (utils.isObject(output) && (output as any).name) {
        returnValue[(output as any).name] = decodedValue
      }

      returnValue.__length__++
    })

    return returnValue
  }
}

export const coder = new SolidityCoder()
