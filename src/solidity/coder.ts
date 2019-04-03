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

import formatter = require('./formatters')

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

function isDynamic(solidityType: SolidityType, type: string) {
  return solidityType.isDynamicType(type) || solidityType.isDynamicArray(type)
}

/**
 * SolidityCoder prototype should be used to encode/decode solidity params of any type
 */
export class SolidityCoder {
  _types: SolidityType[]

  constructor(types: SolidityType[]) {
    this._types = types
  }

  /**
   * This method should be used to transform type to SolidityType
   *
   * @method _requireType
   * @param {string} type
   * @returns {SolidityType}
   * @throws {Error} throws if no matching type is found
   */
  _requireType(type: string): SolidityType {
    let solidityType = this._types.filter(function(t) {
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
  encodeParam(type: string, param: any) {
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
  encodeParams(types: string[], params: any[]) {
    let solidityTypes = this.getSolidityTypes(types)

    let encodeds = solidityTypes.map(function(solidityType, index) {
      return solidityType.encode(params[index], types[index])
    })

    let dynamicOffset = solidityTypes.reduce(function(acc, solidityType, index) {
      let staticPartLength = solidityType.staticPartLength(types[index])
      let roundedStaticPartLength = Math.floor((staticPartLength + 31) / 32) * 32

      return acc + (isDynamic(solidityTypes[index], types[index]) ? 32 : roundedStaticPartLength)
    }, 0)

    let result = this.encodeMultiWithOffset(types, solidityTypes, encodeds, dynamicOffset)

    return result
  }

  encodeMultiWithOffset(types: string[], solidityTypes: SolidityType[], encodeds: any[][], _dynamicOffset: number) {
    let dynamicOffset = _dynamicOffset
    let result = ''

    types.forEach((_, i) => {
      if (isDynamic(solidityTypes[i], types[i])) {
        result += formatter.formatInputInt(dynamicOffset).encode()
        let e = this.encodeWithOffset(types[i], solidityTypes[i], encodeds[i], dynamicOffset)
        dynamicOffset += e.length / 2
      } else {
        // don't add length to dynamicOffset. it's already counted
        result += this.encodeWithOffset(types[i], solidityTypes[i], encodeds[i], dynamicOffset)
      }

      // TODO: figure out nested arrays
    })

    types.forEach((_, i) => {
      if (isDynamic(solidityTypes[i], types[i])) {
        let e = this.encodeWithOffset(types[i], solidityTypes[i], encodeds[i], dynamicOffset)
        dynamicOffset += e.length / 2
        result += e
      }
    })
    return result
  }

  // tslint:disable-next-line:prefer-function-over-method
  encodeWithOffset(type: string, solidityType: SolidityType, encoded: any[], offset: number) {
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
      let result = mode === encodingMode.dynamic ? encoded[0] : ''

      if (solidityType.isDynamicArray(nestedName)) {
        let previousLength = mode === encodingMode.dynamic ? 2 : 0

        for (let i = 0; i < encoded.length; i++) {
          // calculate length of previous item
          if (mode === encodingMode.dynamic) {
            previousLength += +encoded[i - 1][0] || 0
          } else if (mode === encodingMode.static) {
            previousLength += +(encoded[i - 1] || [])[0] || 0
          }
          result += formatter.formatInputInt(offset + i * nestedStaticPartLength + previousLength * 32).encode()
        }
      }

      let len = mode === encodingMode.dynamic ? encoded.length - 1 : encoded.length
      for (let c = 0; c < len; c++) {
        let additionalOffset = result / 2
        if (mode === encodingMode.dynamic) {
          result += this.encodeWithOffset(nestedName, solidityType, encoded[c + 1], offset + additionalOffset)
        } else if (mode === encodingMode.static) {
          result += this.encodeWithOffset(nestedName, solidityType, encoded[c], offset + additionalOffset)
        }
      }

      return result
    }

    return encoded
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
  decodeParams(types: string[], bytes: string) {
    let solidityTypes = this.getSolidityTypes(types)
    let offsets = this.getOffsets(types, solidityTypes)

    return solidityTypes.map(function(solidityType, index) {
      return solidityType.decode(bytes, offsets[index], types[index])
    })
  }

  // tslint:disable-next-line:prefer-function-over-method
  getOffsets(types: string[], solidityTypes: SolidityType[]) {
    let lengths = solidityTypes.map(function(solidityType, index) {
      return solidityType.staticPartLength(types[index])
    })

    for (let i = 1; i < lengths.length; i++) {
      // sum with length of previous element
      lengths[i] += lengths[i - 1]
    }

    return lengths.map(function(length, index) {
      // remove the current length, so the length is sum of previous elements
      let staticPartLength = solidityTypes[index].staticPartLength(types[index])
      return length - staticPartLength
    })
  }

  getSolidityTypes(types: string[]): SolidityType[] {
    return types.map(type => this._requireType(type))
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
