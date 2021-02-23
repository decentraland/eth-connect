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

import * as utils from '../utils/utils'
import * as config from '../utils/config'
import { SolidityParam } from './param'
import { BigNumber } from '../utils/BigNumber'
import { inputAddressFormatter } from '../utils/formatters'

/**
 * Formats input value to byte representation of int
 * If value is negative, return it's two's complement
 * If the value is floating point, round it down
 */
export function formatInputInt(value: BigNumber.Value) {
  BigNumber.config(config.ETH_BIGNUMBER_ROUNDING_MODE)

  let result = utils.padLeft(utils.toTwosComplement(value).toString(16), 64)

  const ret = new SolidityParam(result)

  if (ret.value.indexOf('NaN') != -1) {
    throw new Error(`The number ${JSON.stringify(value)} can't be parsed.`)
  }

  return ret
}

export function formatInputAddress(value: string) {
  if (typeof value != 'string') throw new Error('The input must be a valid address, got: ' + JSON.stringify(value))
  return formatInputInt(inputAddressFormatter(value.trim()))
}

/**
 * Formats input bytes
 */
export function formatInputBytes(value: string) {
  let result = utils.toHex(value).substr(2)
  let l = Math.floor((result.length + 63) / 64)
  result = utils.padRight(result, l * 64)
  return new SolidityParam(result)
}

/**
 * Formats input bytes
 */
export function formatInputDynamicBytes(value: string) {
  let result = utils.toHex(value).substr(2)
  let length = result.length / 2
  let l = Math.floor((result.length + 63) / 64)
  result = utils.padRight(result, l * 64)
  return new SolidityParam(formatInputInt(length).value + result)
}

/**
 * Formats input value to byte representation of string
 */
export function formatInputString(value: string) {
  let result = utils.fromUtf8(value).substr(2)
  let length = result.length / 2
  let l = Math.floor((result.length + 63) / 64)
  result = utils.padRight(result, l * 64)
  return new SolidityParam(formatInputInt(length).value + result)
}

/**
 * Formats input value to byte representation of bool
 */
export function formatInputBool(value: boolean) {
  let result = '000000000000000000000000000000000000000000000000000000000000000' + (value ? '1' : '0')
  return new SolidityParam(result)
}

/**
 * Formats input value to byte representation of real
 * Values are multiplied by 2^m and encoded as integers
 */
export function formatInputReal(value: BigNumber.Value) {
  return formatInputInt(new BigNumber(value).times(new BigNumber(2).pow(128)))
}

/**
 * Check if input value is negative
 *
 * @param value - The value is hex format
 */
export function signedIsNegative(value: string) {
  return new BigNumber(value.substr(0, 1), 16).toString(2).substr(0, 1) === '1'
}

/**
 * Formats right-aligned output bytes to int
 */
export function formatOutputInt(param: SolidityParam): BigNumber {
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
 */
export function formatOutputUInt(param: SolidityParam) {
  let value = param.staticPart()
  return new BigNumber(value, 16)
}

/**
 * Formats right-aligned output bytes to real
 */
export function formatOutputReal(param: SolidityParam) {
  return formatOutputInt(param).dividedBy(new BigNumber(2).pow(128))
}

/**
 * Formats right-aligned output bytes to ureal
 */
export function formatOutputUReal(param: SolidityParam) {
  return formatOutputUInt(param).dividedBy(new BigNumber(2).pow(128))
}

/**
 * Should be used to format output bool
 */
export function formatOutputBool(param: SolidityParam) {
  return param.staticPart() === '0000000000000000000000000000000000000000000000000000000000000001' ? true : false
}

/**
 * Should be used to format output bytes
 *
 * @param param - The left-aligned hex representation of string
 * @param name - The type name
 */
export function formatOutputBytes(param: SolidityParam, name: string) {
  let matches = name.match(/^bytes([0-9]*)/)
  if (!matches) throw new Error('Type is not bytes')
  let size = parseInt(matches[1], 10)
  return '0x' + param.staticPart().slice(0, 2 * size)
}

/**
 * Should be used to format output bytes
 *
 * @param param - The left-aligned hex representation of string
 */
export function formatOutputDynamicBytes(param: SolidityParam) {
  let length = new BigNumber(param.dynamicPart().slice(0, 64), 16).toNumber() * 2
  return '0x' + param.dynamicPart().substr(64, length)
}

/**
 * Should be used to format output string
 *
 * @param param - The left-aligned hex representation of string
 */
export function formatOutputString(param: SolidityParam) {
  let length = new BigNumber(param.dynamicPart().slice(0, 64), 16).toNumber() * 2
  return utils.toUtf8(param.dynamicPart().substr(64, length))
}

/**
 * Should be used to format output address
 *
 * @param param - The right-aligned input bytes
 */
export function formatOutputAddress(param: SolidityParam) {
  let value = param.staticPart()
  return '0x' + value.slice(value.length - 40, value.length)
}
