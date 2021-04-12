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

import * as formatter from './formatters'

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
import { SolidityTypeTuple } from './tuple'
import { AbiInput } from '../Schema'

function isDynamic(solidityType: SolidityType<any>, type: AbiInput) {
  return solidityType.isDynamicType(type.type) || solidityType.isDynamicArray(type.type)
}

/**
 * SolidityCoder prototype should be used to encode/decode solidity params of any type
 */
export class SolidityCoder {
  constructor(public types: SolidityType<any>[]) {}

  /**
   * This method should be used to transform type to SolidityType
   *
   * @param {string} requiredType
   * @returns {SolidityType}
   * @throws {Error} throws if no matching type is found
   */
  private _requireType(requiredType: AbiInput): SolidityType<unknown> {
    for (let t of this.types) {
      if (t.isType(requiredType.type)) {
        return t
      }
    }

    throw Error('invalid solidity type!: ' + JSON.stringify(requiredType))
  }

  /**
   * Should be used to encode plain param
   *
   * @method encodeParam
   * @param {string} type
   * @param {object} plain param
   * @return {string} encoded plain param
   */
  encodeParam(type: AbiInput, param: any): string {
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
  encodeParams(types: AbiInput[], params: any[]): string {
    let solidityTypes = this.getSolidityTypes(types)

    let encodeds = params.map(function (value, index) {
      return solidityTypes[index].encode(value, types[index])
    })

    let dynamicOffset = solidityTypes.reduce(function (acc, solidityType, index) {
      let staticPartLength = solidityType.staticPartLength(types[index].type)
      let roundedStaticPartLength = Math.floor((staticPartLength + 31) / 32) * 32

      return acc + (isDynamic(solidityTypes[index], types[index]) ? 32 : roundedStaticPartLength)
    }, 0)

    console.dir({ types, params, encodeds, dynamicOffset })
    let result = this.encodeMultiWithOffset(types, solidityTypes, encodeds, dynamicOffset)

    return result
  }

  encodeMultiWithOffset(
    types: AbiInput[],
    solidityTypes: SolidityType<any>[],
    encodeds: (string | string[])[],
    _dynamicOffset: number
  ): string {
    let dynamicOffset = _dynamicOffset
    let results: string[] = []

    encodeds.forEach((_, i) => {
      if (isDynamic(solidityTypes[i], types[i])) {
        results.push(formatter.formatInputInt(dynamicOffset).encode())
        let e = this.encodeWithOffset(types[i].type, solidityTypes[i], encodeds[i], dynamicOffset)
        dynamicOffset += e.length / 2
      } else {
        // don't add length to dynamicOffset. it's already counted
        results.push(this.encodeWithOffset(types[i].type, solidityTypes[i], encodeds[i], dynamicOffset))
      }

      // TODO: figure out nested arrays
    })

    types.forEach((_, i) => {
      if (isDynamic(solidityTypes[i], types[i])) {
        let e = this.encodeWithOffset(types[i].type, solidityTypes[i], encodeds[i], dynamicOffset)
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
    enum EncodingMode {
      dynamic,
      static,
      other
    }

    let mode = solidityType.isDynamicArray(type)
      ? EncodingMode.dynamic
      : solidityType.isStaticArray(type)
      ? EncodingMode.static
      : EncodingMode.other



    if (mode !== EncodingMode.other) {
      let nestedName = solidityType.nestedName(type)
      let nestedStaticPartLength = solidityType.staticPartLength(nestedName)
      let results: string[] = []

      if (mode === EncodingMode.dynamic) {
        results.push(encoded[0] as string)
      }

      if (solidityType.isDynamicArray(nestedName)) {
        let previousLength = mode === EncodingMode.dynamic ? 2 : 0
        for (let i = 0; i < encoded.length; i++) {
          // calculate length of previous item
          if (mode === EncodingMode.dynamic) {
            previousLength += +encoded[i - 1][0] || 0
          } else if (mode === EncodingMode.static) {
            previousLength += +(encoded[i - 1] || [])[0] || 0
          }
          results.push(formatter.formatInputInt(offset + i * nestedStaticPartLength + previousLength * 32).encode())
        }
      }

      let len = mode === EncodingMode.dynamic ? encoded.length - 1 : encoded.length
      for (let c = 0; c < len; c++) {
        let additionalOffset = results.join('').length / 2
        if (mode === EncodingMode.dynamic) {
          results.push(this.encodeWithOffset(nestedName, solidityType, encoded[c + 1], offset + additionalOffset))
        } else if (mode === EncodingMode.static) {
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
  decodeParam(type: AbiInput, bytes: string): any {
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
  decodeParams(types: AbiInput[], bytes: string): any[] {
    // NACHO: return decodeParametersWith(types, bytes)

    let solidityTypes = this.getSolidityTypes(types)
    let offsets = this.getOffsets(
      types.map((_) => _.type),
      solidityTypes
    )

    return solidityTypes.map(function (solidityType, index) {
      return solidityType.decode(bytes, offsets[index], types[index])
    })
  }

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

  getSolidityTypes(types: AbiInput[]): SolidityType<any>[] {
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
  new SolidityTypeUReal(),
  new SolidityTypeTuple()
])
