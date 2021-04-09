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

import * as utf8 from 'utf8'
import { keccak256 } from 'js-sha3'
import { BigNumber } from './BigNumber'
import { AbiInput, AbiItem } from '../Schema'

/**
 * @public
 */
export function hexToBytes(hex: string): Uint8Array {
  if (typeof hex != 'string') throw new Error('hexToBytes only accept strings, got: ' + typeof hex)

  if (hex.substr(0, 2) === '0x') {
    return hexToBytes(hex.substr(2))
  }

  const result = new Uint8Array(Math.ceil(hex.length / 2))

  let i = 0
  for (let char = 0; char < hex.length; char += 2) {
    const n = parseInt(hex.substr(char, 2), 16)
    if (isNaN(n)) throw new Error('Cannot read hex string:' + JSON.stringify(hex))
    result[i] = parseInt(hex.substr(char, 2), 16)
    i++
  }

  return result
}

/**
 * @public
 */
export function sha3(value: string | number[] | ArrayBuffer | Uint8Array, options?: { encoding?: 'hex' }): string {
  if (typeof value == 'string') {
    if (options && options.encoding === 'hex' && typeof value == 'string') {
      let mutValue = value
      if (mutValue.length > 2 && mutValue.substr(0, 2) === '0x') {
        mutValue = mutValue.substr(2)
      }
      const t = hexToBytes(mutValue)
      return keccak256(t)
    } else {
      return keccak256(utf8.encode(value))
    }
  }

  return keccak256(value)
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

export type Unit = keyof typeof unitMap

/**
 * @public
 * Should be called to pad string to expected length
 */
export function padLeft(str: string, chars: number, sign?: string) {
  const hasPrefix = /^0x/i.test(str) || typeof str === 'number'
  str = str.replace(/^0x/i, '')

  var padding = (chars - str.length + 1 >= 0) ? chars - str.length + 1 : 0

  return (hasPrefix ? '0x' : '') + new Array(padding).join(sign ? sign : "0") + str
}

/**
 * @public
 * Should be called to pad string to expected length
 */
export function padRight(str: string, chars: number, sign?: string) {
  var hasPrefix = /^0x/i.test(str) || typeof str === 'number'
  str = str.replace(/^0x/i, '')

  var padding = (chars - str.length + 1 >= 0) ? chars - str.length + 1 : 0

  return (hasPrefix ? '0x' : '') + str + (new Array(padding).join(sign ? sign : "0"))
}

/**
 * @public
 * Should be called to get utf8 from it's hex representation
 */
export function toUtf8(hex: string): string {
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
 * @public
 * Should be called to get ascii from it's hex representation
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
 * @public
 * Should be called to get hex representation (prefixed by 0x) of utf8 string
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
 * @public
 * Should be called to get hex representation (prefixed by 0x) of ascii string
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
 * @public
 * Should be used to create full function/event name from json abi
 */
export function transformToFullName(json: AbiItem) {
  if (isObject(json) && json.name && json.name.indexOf('(') !== -1) {
    return json.name
  }

  return json.name + '(' + _flattenTypes(false, json.inputs).join(',') + ')'
}

/**
 * Should be used to flatten json abi inputs/outputs into an array of type-representing-strings
 *
 * @method _flattenTypes
 * @param {bool} includeTuple
 * @param {Object} puts
 * @return {Array} parameters as strings
 */
function _flattenTypes(includeTuple: boolean, puts: AbiInput[]) {
  const types: string[] = []

  puts.forEach(function (param) {
    if (typeof param.components === 'object') {
      if (param.type.substring(0, 5) !== 'tuple') {
        throw new Error('components found but type is not tuple; report on GitHub')
      }
      var suffix = ''
      var arrayBracket = param.type.indexOf('[')
      if (arrayBracket >= 0) { suffix = param.type.substring(arrayBracket) }
      var result = _flattenTypes(includeTuple, param.components)
      // console.log("result should have things: " + result)
      if (isArray(result) && includeTuple) {
        // console.log("include tuple word, and its an array. joining...: " + result.types)
        types.push('tuple(' + result.join(',') + ')' + suffix)
      }
      else if (!includeTuple) {
        // console.log("don't include tuple, but its an array. joining...: " + result)
        types.push('(' + result.join(',') + ')' + suffix)
      }
      else {
        // console.log("its a single type within a tuple: " + result.types)
        types.push('(' + result + ')')
      }
    } else {
      // console.log("its a type and not directly in a tuple: " + param.type)
      types.push(param.type)
    }
  })

  return types
};

/**
 * @public
 * Should be called to get display name of contract function
 */
export function extractDisplayName(name: string) {
  let stBracket = name.indexOf('(')
  let endBracket = name.indexOf(')')
  return stBracket !== -1 && endBracket !== -1 ? name.substr(0, stBracket) : name
}

/**
 * @public
 * Should be called to get type name of contract function
 */
export function extractTypeName(name: string) {
  let stBracket = name.indexOf('(')
  let endBracket = name.indexOf(')')
  return stBracket !== -1 && endBracket !== -1
    ? name.substr(stBracket + 1, endBracket - stBracket - 1).replace(' ', '')
    : ''
}

/**
 * @public
 * Converts value to it's decimal representation in string
 */
export function isHex(value: string) {
  if (typeof value === 'string') {
    return /^0x[0-9a-fA-F]+$/.test(value)
  } else return false
}

/**
 * @public
 * Converts value to it's decimal representation in string
 */
export function toNullDecimal(value: BigNumber.Value) {
  if (value === undefined || value === null) return value
  return toBigNumber(value).toNumber()
}

/**
 * @public
 * Converts value to it's decimal representation in string
 */
export function toDecimal(value: BigNumber.Value) {
  return toBigNumber(value).toNumber()
}

/**
 * @public
 * Converts value to string
 */
export function toString(value: BigNumber.Value) {
  if (isBigNumber(value)) return (value as BigNumber).toString(10)
  return '' + value
}

/**
 * @public
 * Converts value to it's hex  representation in string
 */
export function toData(val: BigNumber.Value) {
  if (typeof val === 'string') {
    if (!val.startsWith('0x') && /^[A-Za-z0-9]+$/.test(val)) {
      return '0x' + val
    }
  }
  return toHex(val)
}

/**
 * @public
 * Converts value to it's boolean representation (x != 0)
 */
export function toBoolean(value: BigNumber.Value | boolean) {
  if (typeof value === 'boolean') return value
  return toBigNumber(value).toNumber() !== 0
}

/**
 * @public
 * Converts value to it's hex representation
 */
export function fromDecimal(value: BigNumber.Value) {
  let num = toBigNumber(value)
  let result = num.toString(16)

  return num.isLessThan(0) ? '-0x' + result.substr(1) : '0x' + result
}

/**
 * @public
 * Auto converts any given value into it's hex representation.
 *
 * And even stringifys objects before.
 */
export function toHex(val: BigNumber.Value | boolean) {
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
 * @public
 * Returns value of unit in Wei
 */
export function getValueOfUnit(_unit: Unit): BigNumber {
  let unit: Unit = _unit ? (_unit.toLowerCase() as Unit) : 'ether'
  let unitValue = unitMap[unit]
  if (unitValue === undefined) {
    throw new Error(
      "This unit doesn't exists, please use the one of the following units" + JSON.stringify(unitMap, null, 2)
    )
  }
  return new BigNumber(unitValue, 10)
}

/**
 * @public
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
 */
export function fromWei(num: BigNumber, unit: Unit): BigNumber
export function fromWei(num: string | number, unit: Unit): string
export function fromWei(num: BigNumber.Value, unit: Unit) {
  let returnValue = toBigNumber(num).dividedBy(getValueOfUnit(unit))

  return isBigNumber(num) ? returnValue : returnValue.toString(10)
}

/**
 * @public
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
 */
export function toWei(num: number | string, unit: Unit) {
  let returnValue = toBigNumber(num).times(getValueOfUnit(unit))

  return isBigNumber(num) ? returnValue : returnValue.toString(10)
}

/**
 * @public
 * Takes an input and transforms it into an bignumber
 */
export function toBigNumber(_num: BigNumber.Value): BigNumber {
  let num: any = _num || 0

  if (isBigNumber(num)) {
    return num as BigNumber
  }

  if (typeof num === 'string') {
    num = num.trim()
  }

  if (typeof num === 'string' && (num.indexOf('0x') === 0 || num.indexOf('-0x') === 0)) {
    return new BigNumber(num.replace('0x', '').toLowerCase(), 16)
  }

  return new BigNumber(num, 10)
}

/**
 * @public
 * Takes and input transforms it into bignumber and if it is negative value, into two's complement
 */
export function toTwosComplement(num: BigNumber.Value): BigNumber {
  let bigNumber = toBigNumber(num).integerValue() as BigNumber

  if (bigNumber.isLessThan(0)) {
    return new BigNumber('ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff', 16).plus(bigNumber).plus(1)
  }

  return bigNumber
}

/**
 * @public
 * Checks if the given string is strictly an address
 */
export function isStrictAddress(address: any) {
  return /^0x[0-9a-f]{40}$/i.test(address)
}

/**
 * @public
 * Checks if the given string is an address
 */
export function isAddress(address: any) {
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
 * @public
 * Checks if the given string is a checksummed address
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
 * @public
 * Makes a checksum address
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
 * @public
 * Ensures the result will be an array
 */
export function toArray(value: any): any[] {
  if (!Array.isArray(value)) {
    throw new Error(`Value was not an array: ${JSON.stringify(value)}`)
  }
  return value
}

/**
 * @public
 * Transforms given string to valid 20 bytes-length addres with 0x prefix
 */
export function toAddress(address: string) {
  if (isStrictAddress(address)) {
    return address
  }

  if (/^[0-9a-f]{40}$/.test(address)) {
    return '0x' + address
  }

  return '0x' + padLeft(toHex(address).substr(2), 40)
}

/**
 * @public
 * Returns true if object is BigNumber, otherwise false
 */
export function isBigNumber(object: any): object is BigNumber {
  return object instanceof BigNumber
}

/**
 * @public
 * Returns true if object is string, otherwise false
 */
export function isString(value: any): value is string {
  return typeof value === 'string' || (value && value.constructor && value.constructor.name === 'String')
}

/**
 * @public
 * Returns true if object is function, otherwise false
 */
export function isFunction(object: any): object is CallableFunction {
  return typeof object === 'function'
}

/**
 * @public
 * Returns true if object is Objet, otherwise false
 */
export function isObject<T extends object>(object: any): object is T {
  return object !== null && !Array.isArray(object) && typeof object === 'object'
}

/**
 * @public
 * Returns true if object is boolean, otherwise false
 */
export function isBoolean(object: any): object is boolean {
  return typeof object === 'boolean'
}

/**
 * @public
 * Returns true if object is array, otherwise false
 */
export function isArray<T extends Array<any>>(object: any): object is T {
  return Array.isArray(object)
}

/**
 * @public
 * Returns true if given string is valid json object
 */
export function isJson(str: string) {
  try {
    return !!JSON.parse(str)
  } catch (e) {
    return false
  }
}

/**
 * @public
 * Returns true if given string is a valid Ethereum block header bloom.
 */
export function isBloom(bloom: string) {
  if (!/^(0x)?[0-9a-f]{512}$/i.test(bloom)) {
    return false
  } else if (/^(0x)?[0-9a-f]{512}$/i.test(bloom)) {
    return true
  }
  return false
}

/**
 * @public
 * Returns true if given string is a valid log topic.
 */
export function isTopic(topic: string) {
  if (!/^(0x)?[0-9a-f]{64}$/i.test(topic)) {
    return false
  } else if (/^(0x)?[0-9a-f]{64}$/i.test(topic)) {
    return true
  }
  return false
}
