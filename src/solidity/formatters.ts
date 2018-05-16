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

import { BigNumber } from 'bignumber.js'
import utils = require('../utils/utils')
import config = require('../utils/config')
import { SolidityParam } from './param'

/**
 * Formats input value to byte representation of int
 * If value is negative, return it's two's complement
 * If the value is floating point, round it down
 *
 * @method formatInputInt
 * @param {string|number|BigNumber} value that needs to be formatted
 * @returns {SolidityParam}
 */
export function formatInputInt(value) {
  BigNumber.config(config.ETH_BIGNUMBER_ROUNDING_MODE)
  let result = utils.padLeft(utils.toTwosComplement(value).toString(16), 64)
  return new SolidityParam(result)
}

/**
 * Formats input bytes
 *
 * @method formatInputBytes
 * @param {string}
 * @returns {SolidityParam}
 */
export function formatInputBytes(value) {
  let result = utils.toHex(value).substr(2)
  let l = Math.floor((result.length + 63) / 64)
  result = utils.padRight(result, l * 64)
  return new SolidityParam(result)
}

/**
 * Formats input bytes
 *
 * @method formatDynamicInputBytes
 * @param {string}
 * @returns {SolidityParam}
 */
export function formatInputDynamicBytes(value) {
  let result = utils.toHex(value).substr(2)
  let length = result.length / 2
  let l = Math.floor((result.length + 63) / 64)
  result = utils.padRight(result, l * 64)
  return new SolidityParam(formatInputInt(length).value + result)
}

/**
 * Formats input value to byte representation of string
 *
 * @method formatInputString
 * @param {string}
 * @returns {SolidityParam}
 */
export function formatInputString(value) {
  let result = utils.fromUtf8(value).substr(2)
  let length = result.length / 2
  let l = Math.floor((result.length + 63) / 64)
  result = utils.padRight(result, l * 64)
  return new SolidityParam(formatInputInt(length).value + result)
}

/**
 * Formats input value to byte representation of bool
 *
 * @method formatInputBool
 * @param {Boolean}
 * @returns {SolidityParam}
 */
export function formatInputBool(value) {
  let result = '000000000000000000000000000000000000000000000000000000000000000' + (value ? '1' : '0')
  return new SolidityParam(result)
}

/**
 * Formats input value to byte representation of real
 * Values are multiplied by 2^m and encoded as integers
 *
 * @method formatInputReal
 * @param {string|number|BigNumber}
 * @returns {SolidityParam}
 */
export function formatInputReal(value) {
  return formatInputInt(new BigNumber(value).times(new BigNumber(2).pow(128)))
}

/**
 * Check if input value is negative
 *
 * @method signedIsNegative
 * @param {string} value is hex format
 * @returns {Boolean} true if it is negative, otherwise false
 */
export function signedIsNegative(value) {
  return new BigNumber(value.substr(0, 1), 16).toString(2).substr(0, 1) === '1'
}

/**
 * Formats right-aligned output bytes to int
 *
 * @method formatOutputInt
 * @param {SolidityParam} param
 * @returns {BigNumber} right-aligned output bytes formatted to big number
 */
export function formatOutputInt(param) {
  let value = param.staticPart() || '0'

  // check if it's negative number
  // it it is, return two's complement
  if (signedIsNegative(value)) {
    return new BigNumber(value, 16)
      .minus(new BigNumber('ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff', 16))
      .minus(1)
  }
  return new BigNumber(value, 16)
}

/**
 * Formats right-aligned output bytes to uint
 *
 * @method formatOutputUInt
 * @param {SolidityParam}
 * @returns {BigNumeber} right-aligned output bytes formatted to uint
 */
export function formatOutputUInt(param) {
  let value = param.staticPart() || '0'
  return new BigNumber(value, 16)
}

/**
 * Formats right-aligned output bytes to real
 *
 * @method formatOutputReal
 * @param {SolidityParam}
 * @returns {BigNumber} input bytes formatted to real
 */
export function formatOutputReal(param) {
  return formatOutputInt(param).dividedBy(new BigNumber(2).pow(128))
}

/**
 * Formats right-aligned output bytes to ureal
 *
 * @method formatOutputUReal
 * @param {SolidityParam}
 * @returns {BigNumber} input bytes formatted to ureal
 */
export function formatOutputUReal(param) {
  return formatOutputUInt(param).dividedBy(new BigNumber(2).pow(128))
}

/**
 * Should be used to format output bool
 *
 * @method formatOutputBool
 * @param {SolidityParam}
 * @returns {Boolean} right-aligned input bytes formatted to bool
 */
export function formatOutputBool(param) {
  return param.staticPart() === '0000000000000000000000000000000000000000000000000000000000000001' ? true : false
}

/**
 * Should be used to format output bytes
 *
 * @method formatOutputBytes
 * @param {SolidityParam} left-aligned hex representation of string
 * @param {string} name type name
 * @returns {string} hex string
 */
export function formatOutputBytes(param, name) {
  let matches = name.match(/^bytes([0-9]*)/)
  let size = parseInt(matches[1], 10)
  return '0x' + param.staticPart().slice(0, 2 * size)
}

/**
 * Should be used to format output bytes
 *
 * @method formatOutputDynamicBytes
 * @param {SolidityParam} left-aligned hex representation of string
 * @returns {string} hex string
 */
export function formatOutputDynamicBytes(param) {
  let length = new BigNumber(param.dynamicPart().slice(0, 64), 16).toNumber() * 2
  return '0x' + param.dynamicPart().substr(64, length)
}

/**
 * Should be used to format output string
 *
 * @method formatOutputString
 * @param {SolidityParam} left-aligned hex representation of string
 * @returns {string} ascii string
 */
export function formatOutputString(param) {
  let length = new BigNumber(param.dynamicPart().slice(0, 64), 16).toNumber() * 2
  return utils.toUtf8(param.dynamicPart().substr(64, length))
}

/**
 * Should be used to format output address
 *
 * @method formatOutputAddress
 * @param {SolidityParam} right-aligned input bytes
 * @returns {string} address
 */
export function formatOutputAddress(param) {
  let value = param.staticPart()
  return '0x' + value.slice(value.length - 40, value.length)
}
