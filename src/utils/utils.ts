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
import utf8 = require('utf8')

import CryptoJS = require('crypto-js')
import _sha3 = require('crypto-js/sha3')

export function sha3(value: string, options?: { encoding?: 'hex' }) {
  let mutValue = value

  if (options && options.encoding === 'hex') {
    if (mutValue.length > 2 && mutValue.substr(0, 2) === '0x') {
      mutValue = mutValue.substr(2)
    }
    mutValue = CryptoJS.enc.Hex.parse(mutValue)
  }

  return _sha3(mutValue, {
    outputLength: 256
  }).toString()
}

let unitMap = {
  noether: '0',
  wei: '1',
  kwei: '1000',
  Kwei: '1000',
  babbage: '1000',
  femtoether: '1000',
  mwei: '1000000',
  Mwei: '1000000',
  lovelace: '1000000',
  picoether: '1000000',
  gwei: '1000000000',
  Gwei: '1000000000',
  shannon: '1000000000',
  nanoether: '1000000000',
  nano: '1000000000',
  szabo: '1000000000000',
  microether: '1000000000000',
  micro: '1000000000000',
  finney: '1000000000000000',
  milliether: '1000000000000000',
  milli: '1000000000000000',
  ether: '1000000000000000000',
  kether: '1000000000000000000000',
  grand: '1000000000000000000000',
  mether: '1000000000000000000000000',
  gether: '1000000000000000000000000000',
  tether: '1000000000000000000000000000000'
}

/**
 * Should be called to pad string to expected length
 *
 * @method padLeft
 * @param {string} str to be padded
 * @param {number} characters that result string should have
 * @param {string} sign, by default 0
 * @returns {string} right aligned string
 */
export function padLeft(str: string, chars: number, sign?: string) {
  return new Array(chars - str.length + 1).join(sign ? sign : '0') + str
}

/**
 * Should be called to pad string to expected length
 *
 * @method padRight
 * @param {string} str to be padded
 * @param {number} characters that result string should have
 * @param {string} sign, by default 0
 * @returns {string} right aligned string
 */
export function padRight(str: string, chars: number, sign?: string) {
  return str + new Array(chars - str.length + 1).join(sign ? sign : '0')
}

/**
 * Should be called to get utf8 from it's hex representation
 *
 * @method toUtf8
 * @param {string} string in hex
 * @returns {string} ascii string representation of hex value
 */
export function toUtf8(hex: string) {
  // Find termination
  let str = ''
  let i = 0
  let l = hex.length
  if (hex.substring(0, 2) === '0x') {
    i = 2
  }
  for (; i < l; i += 2) {
    let code = parseInt(hex.substr(i, 2), 16)
    if (code === 0) break
    str += String.fromCharCode(code)
  }

  return utf8.decode(str)
}

/**
 * Should be called to get ascii from it's hex representation
 *
 * @method toAscii
 * @param {string} string in hex
 * @returns {string} ascii string representation of hex value
 */
export function toAscii(hex: string) {
  // Find termination
  let str = ''
  let i = 0
  let l = hex.length
  if (hex.substring(0, 2) === '0x') {
    i = 2
  }
  for (; i < l; i += 2) {
    let code = parseInt(hex.substr(i, 2), 16)
    str += String.fromCharCode(code)
  }

  return str
}

/**
 * Should be called to get hex representation (prefixed by 0x) of utf8 string
 *
 * @method fromUtf8
 * @param {string} string
 * @param {Boolean} allowZero to convert code point zero to 00 instead of end of string
 * @returns {string} hex representation of input string
 */
export function fromUtf8(_str: string, allowZero = false) {
  let str = utf8.encode(_str)
  let hex = ''

  for (let i = 0; i < str.length; i++) {
    let code = str.charCodeAt(i)
    if (code === 0) {
      if (allowZero) {
        hex += '00'
      } else {
        break
      }
    } else {
      let n = code.toString(16)
      hex += n.length < 2 ? '0' + n : n
    }
  }

  return '0x' + hex
}

/**
 * Should be called to get hex representation (prefixed by 0x) of ascii string
 *
 * @method fromAscii
 * @param {string} string
 * @param {number} optional padding
 * @returns {string} hex representation of input string
 */
export function fromAscii(str: string, num: number = 0) {
  let hex = ''
  for (let i = 0; i < str.length; i++) {
    let code = str.charCodeAt(i)
    let n = code.toString(16)
    hex += n.length < 2 ? '0' + n : n
  }

  return '0x' + hex.padEnd(num, '0')
}

/**
 * Should be used to create full function/event name from json abi
 *
 * @method transformToFullName
 * @param {object} json-abi
 * @return {string} full fnction/event name
 */
export function transformToFullName(json: { name: string; inputs: any[] }) {
  if (json.name.indexOf('(') !== -1) {
    return json.name
  }

  let typeName = json.inputs
    .map(function(i) {
      return i.type
    })
    .join()
  return json.name + '(' + typeName + ')'
}

/**
 * Should be called to get display name of contract function
 *
 * @method extractDisplayName
 * @param {string} name of function/event
 * @returns {string} display name for function/event eg. multiply(uint256) -> multiply
 */
export function extractDisplayName(name: string) {
  let stBracket = name.indexOf('(')
  let endBracket = name.indexOf(')')
  return stBracket !== -1 && endBracket !== -1 ? name.substr(0, stBracket) : name
}

/**
 * Should be called to get type name of contract function
 *
 * @method extractTypeName
 * @param {string} name of function/event
 * @returns {string} type name for function/event eg. multiply(uint256) -> uint256
 */
export function extractTypeName(name: string) {
  let stBracket = name.indexOf('(')
  let endBracket = name.indexOf(')')
  return stBracket !== -1 && endBracket !== -1
    ? name.substr(stBracket + 1, endBracket - stBracket - 1).replace(' ', '')
    : ''
}

/**
 * Converts value to it's decimal representation in string
 *
 * @method toDecimal
 * @param {string|number|BigNumber}
 * @return {string}
 */
export function isHex(value: string) {
  if (typeof value === 'string') {
    return /^0x[0-9a-fA-F]+$/.test(value)
  } else return false
}

/**
 * Converts value to it's decimal representation in string
 *
 * @method toDecimal
 * @param {string|number|BigNumber}
 * @return {string}
 */
export function toNullDecimal(value: number | string | BigNumber) {
  if (value === undefined || value === null) return value
  return toBigNumber(value).toNumber()
}
/**
 * Converts value to it's decimal representation in string
 *
 * @method toDecimal
 * @param {string|number|BigNumber}
 * @return {string}
 */
export function toDecimal(value: number | string | BigNumber) {
  return toBigNumber(value).toNumber()
}

/**
 * Converts value to it's hex  representation in string
 */
export function toData(val: string | number | BigNumber) {
  if (typeof val === 'string') {
    if (!val.startsWith('0x') && /^[A-Za-z0-9]+$/.test(val)) {
      return '0x' + val
    }
  }
  return toHex(val)
}

/**
 * Converts value to it's boolean representation (x != 0)
 *
 * @method toBoolean
 * @param {string|number|BigNumber}
 * @return {string}
 */
export function toBoolean(value: number | string | BigNumber | boolean) {
  if (typeof value === 'boolean') return value
  return toBigNumber(value).toNumber() !== 0
}

/**
 * Converts value to it's hex representation
 *
 * @method fromDecimal
 * @param {string|number|BigNumber}
 * @return {string}
 */
export function fromDecimal(value: string | number | BigNumber) {
  let num = toBigNumber(value)
  let result = num.toString(16)

  return num.isLessThan(0) ? '-0x' + result.substr(1) : '0x' + result
}

/**
 * Auto converts any given value into it's hex representation.
 *
 * And even stringifys objects before.
 *
 * @method toHex
 * @param {string|number|BigNumber|Object}
 * @return {string}
 */
export function toHex(val: string | number | BigNumber) {
  /*jshint maxcomplexity: 8 */

  if (isBoolean(val)) return fromDecimal(+val)

  if (isBigNumber(val)) return fromDecimal(val)

  if (typeof val === 'object') return fromUtf8(JSON.stringify(val))

  // if its a negative number, pass it through fromDecimal
  if (isString(val)) {
    const valStr = val as string
    if (valStr.indexOf('-0x') === 0) return fromDecimal(valStr)
    else if (valStr.indexOf('0x') === 0) return valStr
    else if (!isFinite(valStr as any)) return fromUtf8(valStr, true)
  }

  return fromDecimal(val)
}

/**
 * Returns value of unit in Wei
 *
 * @method getValueOfUnit
 * @param {string} unit the unit to convert to, default ether
 * @returns {BigNumber} value of the unit (in Wei)
 * @throws error if the unit is not correct:w
 */
export function getValueOfUnit(_unit: string) {
  let unit = _unit ? _unit.toLowerCase() : 'ether'
  let unitValue = unitMap[unit]
  if (unitValue === undefined) {
    throw new Error(
      "This unit doesn't exists, please use the one of the following units" + JSON.stringify(unitMap, null, 2)
    )
  }
  return new BigNumber(unitValue, 10)
}

/**
 * Takes a number of wei and converts it to any other ether unit.
 *
 * Possible units are:
 *   SI Short   SI Full        Effigy       Other
 * - kwei       femtoether     babbage
 * - mwei       picoether      lovelace
 * - gwei       nanoether      shannon      nano
 * - --         microether     szabo        micro
 * - --         milliether     finney       milli
 * - ether      --             --
 * - kether                    --           grand
 * - mether
 * - gether
 * - tether
 *
 * @method fromWei
 * @param {Number|String} num can be a number, number string or a HEX of a decimal
 * @param {string} unit the unit to convert to, default ether
 * @return {String|Object} When given a BigNumber object it returns one as well, otherwise a number
 */
export function fromWei(num: number | string, unit: string) {
  let returnValue = toBigNumber(num).dividedBy(getValueOfUnit(unit))

  return isBigNumber(num) ? returnValue : returnValue.toString(10)
}

/**
 * Takes a number of a unit and converts it to wei.
 *
 * Possible units are:
 *   SI Short   SI Full        Effigy       Other
 * - kwei       femtoether     babbage
 * - mwei       picoether      lovelace
 * - gwei       nanoether      shannon      nano
 * - --         microether     szabo        micro
 * - --         milliether     finney       milli
 * - ether      --             --
 * - kether                    --           grand
 * - mether
 * - gether
 * - tether
 *
 * @method toWei
 * @param {Number|String|BigNumber} num can be a number, number string or a HEX of a decimal
 * @param {string} unit the unit to convert from, default ether
 * @return {String|Object} When given a BigNumber object it returns one as well, otherwise a number
 */
export function toWei(num: number | string, unit: string) {
  let returnValue = toBigNumber(num).times(getValueOfUnit(unit))

  return isBigNumber(num) ? returnValue : returnValue.toString(10)
}

/**
 * Takes an input and transforms it into an bignumber
 *
 * @method toBigNumber
 * @param {Number|String|BigNumber} a number, string, HEX string or BigNumber
 * @return {BigNumber} BigNumber
 */
export function toBigNumber(_num: number | string | BigNumber): BigNumber {
  let num: any = _num || 0

  if (isBigNumber(num)) {
    return num as BigNumber
  }

  if (typeof num === 'string' && (num.indexOf('0x') === 0 || num.indexOf('-0x') === 0)) {
    return new BigNumber(num.replace('0x', ''), 16)
  }

  return new BigNumber(num.toString(10), 10)
}

/**
 * Takes and input transforms it into bignumber and if it is negative value, into two's complement
 *
 * @method toTwosComplement
 * @param {Number|String|BigNumber}
 * @return {BigNumber}
 */
export function toTwosComplement(num: number | string | BigNumber) {
  let bigNumber = toBigNumber(num).integerValue()

  if (bigNumber.isLessThan(0)) {
    return new BigNumber('ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff', 16).plus(bigNumber).plus(1)
  }

  return bigNumber
}

/**
 * Checks if the given string is strictly an address
 *
 * @method isStrictAddress
 * @param {string} address the given HEX adress
 * @return {Boolean}
 */
export function isStrictAddress(address) {
  return /^0x[0-9a-f]{40}$/i.test(address)
}

/**
 * Checks if the given string is an address
 *
 * @method isAddress
 * @param {string} address the given HEX adress
 * @return {Boolean}
 */
export function isAddress(address) {
  if (!/^(0x)?[0-9a-f]{40}$/i.test(address)) {
    // check if it has the basic requirements of an address
    return false
  } else if (/^(0x)?[0-9a-f]{40}$/.test(address) || /^(0x)?[0-9A-F]{40}$/.test(address)) {
    // If it's all small caps or all all caps, return true
    return true
  } else {
    // Otherwise check each case
    return isChecksumAddress(address)
  }
}

/**
 * Checks if the given string is a checksummed address
 *
 * @method isChecksumAddress
 * @param {string} address the given HEX adress
 * @return {Boolean}
 */
export function isChecksumAddress(_address: string) {
  // Check each case
  const address = _address.replace('0x', '')
  let addressHash = sha3(address.toLowerCase())

  for (let i = 0; i < 40; i++) {
    // the nth letter should be uppercase if the nth digit of casemap is 1
    if (
      (parseInt(addressHash[i], 16) > 7 && address[i].toUpperCase() !== address[i]) ||
      (parseInt(addressHash[i], 16) <= 7 && address[i].toLowerCase() !== address[i])
    ) {
      return false
    }
  }
  return true
}

/**
 * Makes a checksum address
 *
 * @method toChecksumAddress
 * @param {string} address the given HEX adress
 * @return {string}
 */
export function toChecksumAddress(_address: string) {
  if (typeof _address === 'undefined') return ''

  const address = _address.toLowerCase().replace('0x', '')
  const addressHash = sha3(address)
  let checksumAddress = '0x'

  for (let i = 0; i < address.length; i++) {
    // If ith character is 9 to f then make it uppercase
    if (parseInt(addressHash[i], 16) > 7) {
      checksumAddress += address[i].toUpperCase()
    } else {
      checksumAddress += address[i]
    }
  }
  return checksumAddress
}

/**
 * Transforms given string to valid 20 bytes-length addres with 0x prefix
 *
 * @method toAddress
 * @param {string} address
 * @return {string} formatted address
 */
export function toAddress(address) {
  if (isStrictAddress(address)) {
    return address
  }

  if (/^[0-9a-f]{40}$/.test(address)) {
    return '0x' + address
  }

  return '0x' + padLeft(toHex(address).substr(2), 40)
}

/**
 * Returns true if object is BigNumber, otherwise false
 *
 * @method isBigNumber
 * @param {object}
 * @return {Boolean}
 */
export function isBigNumber(object) {
  return object instanceof BigNumber || (object && object.constructor && object.constructor.name === 'BigNumber')
}

/**
 * Returns true if object is string, otherwise false
 *
 * @method isString
 * @param {object}
 * @return {Boolean}
 */
export function isString(object: string): true
export function isString(object: any): false
export function isString(object: any): boolean {
  return typeof object === 'string' || (object && object.constructor && object.constructor.name === 'String')
}

/**
 * Returns true if object is function, otherwise false
 *
 * @method isFunction
 * @param {object}
 * @return {Boolean}
 */
export function isFunction(object) {
  return typeof object === 'function'
}

/**
 * Returns true if object is Objet, otherwise false
 *
 * @method isObject
 * @param {object}
 * @return {Boolean}
 */
export function isObject(object) {
  return object !== null && !Array.isArray(object) && typeof object === 'object'
}

/**
 * Returns true if object is boolean, otherwise false
 *
 * @method isBoolean
 * @param {object}
 * @return {Boolean}
 */
export function isBoolean(object) {
  return typeof object === 'boolean'
}

/**
 * Returns true if object is array, otherwise false
 *
 * @method isArray
 * @param {object}
 * @return {Boolean}
 */
export function isArray(object) {
  return Array.isArray(object)
}

/**
 * Returns true if given string is valid json object
 *
 * @method isJson
 * @param {string}
 * @return {Boolean}
 */
export function isJson(str) {
  try {
    return !!JSON.parse(str)
  } catch (e) {
    return false
  }
}

/**
 * Returns true if given string is a valid Ethereum block header bloom.
 *
 * @method isBloom
 * @param {string} hex encoded bloom filter
 * @return {Boolean}
 */
export function isBloom(bloom) {
  if (!/^(0x)?[0-9a-f]{512}$/i.test(bloom)) {
    return false
  } else if (/^(0x)?[0-9a-f]{512}$/.test(bloom) || /^(0x)?[0-9A-F]{512}$/.test(bloom)) {
    return true
  }
  return false
}

/**
 * Returns true if given string is a valid log topic.
 *
 * @method isTopic
 * @param {string} hex encoded topic
 * @return {Boolean}
 */
export function isTopic(topic) {
  if (!/^(0x)?[0-9a-f]{64}$/i.test(topic)) {
    return false
  } else if (/^(0x)?[0-9a-f]{64}$/.test(topic) || /^(0x)?[0-9A-F]{64}$/.test(topic)) {
    return true
  }
  return false
}
