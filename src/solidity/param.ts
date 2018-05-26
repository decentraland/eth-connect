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

import utils = require('../utils/utils')

/**
 * SolidityParam object prototype.
 * Should be used when encoding, decoding solidity bytes
 */
export class SolidityParam {
  value
  offset: number = undefined

  constructor(value, offset: number = undefined) {
    this.value = value || ''
    this.offset = offset // offset bytes
  }

  /**
   * This method should be called to encode array of params
   *
   * @method encodeList
   * @param {Array[SolidityParam]} params
   * @returns {string}
   */
  static encodeList(params) {
    // updating offsets
    let totalOffset = params.length * 32
    let offsetParams = params.map(function(param) {
      if (!param.isDynamic()) {
        return param
      }
      let offset = totalOffset
      totalOffset += param.dynamicPartLength()
      return param.withOffset(offset)
    })

    // encode everything!
    return offsetParams.reduce(
      function(result, param) {
        return result + param.dynamicPart()
      },
      offsetParams.reduce(function(result, param) {
        return result + param.staticPart()
      }, '')
    )
  }
  /**
   * This method should be used to get length of params's dynamic part
   *
   * @method dynamicPartLength
   * @returns {number} length of dynamic part (in bytes)
   */
  dynamicPartLength() {
    return this.dynamicPart().length / 2
  }

  /**
   * This method should be used to create copy of solidity param with different offset
   *
   * @method withOffset
   * @param {number} offset length in bytes
   * @returns {SolidityParam} new solidity param with applied offset
   */
  withOffset(offset) {
    return new SolidityParam(this.value, offset)
  }

  /**
   * This method should be used to combine solidity params together
   * eg. when appending an array
   *
   * @method combine
   * @param {SolidityParam} param with which we should combine
   * @param {SolidityParam} result of combination
   */
  combine(param) {
    return new SolidityParam(this.value + param.value)
  }

  /**
   * This method should be called to check if param has dynamic size.
   * If it has, it returns true, otherwise false
   *
   * @method isDynamic
   * @returns {Boolean}
   */
  isDynamic() {
    return this.offset !== undefined
  }

  /**
   * This method should be called to transform offset to bytes
   *
   * @method offsetAsBytes
   * @returns {string} bytes representation of offset
   */
  offsetAsBytes() {
    return !this.isDynamic() ? '' : utils.padLeft(utils.toTwosComplement(this.offset).toString(16), 64)
  }

  /**
   * This method should be called to get static part of param
   *
   * @method staticPart
   * @returns {string} offset if it is a dynamic param, otherwise value
   */
  staticPart() {
    if (!this.isDynamic()) {
      return this.value
    }
    return this.offsetAsBytes()
  }

  /**
   * This method should be called to get dynamic part of param
   *
   * @method dynamicPart
   * @returns {string} returns a value if it is a dynamic param, otherwise empty string
   */
  dynamicPart() {
    return this.isDynamic() ? this.value : ''
  }

  /**
   * This method should be called to encode param
   *
   * @method encode
   * @returns {string}
   */
  encode() {
    return this.staticPart() + this.dynamicPart()
  }
}
