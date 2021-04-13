'use strict'

// See: https://github.com/ethereum/wiki/wiki/Ethereum-Contract-ABI

import * as errors from './errors'

import { getAddress } from './address'
import { BigNumber } from '../utils/BigNumber'
import { arrayify, concat, hexlify } from './bytes'
import { toUtf8Bytes, toUtf8String } from './utf8'
import { defineReadOnly } from './properties'

///////////////////////////////
// Imported Types

import { Arrayish } from './bytes'
import {
  bytesToHex,
  fromTwosComplement,
  hexToBytes,
  isAddress,
  padLeft,
  toBigNumber,
  toTwosComplement
} from '../utils/utils'
import { inputAddressFormatter } from '../utils/formatters'
import { AbiInput, AbiOutput } from '../Schema'
import { MaxUint256, NegativeOne, One, Zero } from './constants'

///////////////////////////////
// Exported Types

export type CoerceFunc = (type: string, value: any) => any

// @TODO: should this just be a combined Fragment?

export type EventFragment = {
  type: string
  name: string

  anonymous: boolean

  inputs: Array<AbiInput>
}

export type FunctionFragment = {
  type: string
  name: string

  constant: boolean

  inputs: Array<AbiInput>
  outputs: Array<AbiOutput>

  payable: boolean
  stateMutability: string | null

  gas: BigNumber | null
}

///////////////////////////////

const paramTypeBytes = new RegExp(/^bytes([0-9]*)$/)
const paramTypeNumber = new RegExp(/^(u?int)([0-9]*)$/)
const paramTypeArray = new RegExp(/^(.*)\[([0-9]*)\]$/)

export const defaultCoerceFunc: CoerceFunc = function (type: string, value: any): any {
  var match = type.match(paramTypeNumber)
  if (match && parseInt(match[2]) <= 48) {
    return value.toNumber()
  }
  return value
}

///////////////////////////////////
// Parsing for Solidity Signatures

const regexParen = new RegExp('^([^)(]*)\\((.*)\\)([^)(]*)$')
const regexIdentifier = new RegExp('^[A-Za-z_][A-Za-z0-9_]*$')

function verifyType(type: string): string {
  // These need to be transformed to their full description
  if (type.match(/^uint($|[^1-9])/)) {
    type = 'uint256' + type.substring(4)
  } else if (type.match(/^int($|[^1-9])/)) {
    type = 'int256' + type.substring(3)
  }

  return type
}

type ParseState = {
  allowArray?: boolean
  allowName?: boolean
  allowParams?: boolean
  allowType?: boolean
  readArray?: boolean
}

type ParseNode = {
  parent?: any
  type?: string
  name?: string
  state?: ParseState
  indexed?: boolean
  components?: Array<any>
}

function parseParam(param: string, allowIndexed?: boolean): AbiInput {
  function throwError(i: number) {
    throw new Error('unexpected character "' + param[i] + '" at position ' + i + ' in "' + param + '"')
  }

  var parent: ParseNode = { type: '', name: '', state: { allowType: true } }
  var node: any = parent

  for (var i = 0; i < param.length; i++) {
    var c = param[i]
    switch (c) {
      case '(':
        if (!node.state.allowParams) {
          throwError(i)
        }
        node.state.allowType = false
        node.type = verifyType(node.type)
        node.components = [{ type: '', name: '', parent: node, state: { allowType: true } }]
        node = node.components[0]
        break

      case ')':
        delete node.state
        if (allowIndexed && node.name === 'indexed') {
          node.indexed = true
          node.name = ''
        }
        node.type = verifyType(node.type)

        var child = node
        node = node.parent
        if (!node) {
          throwError(i)
        }
        delete child.parent
        node.state.allowParams = false
        node.state.allowName = true
        node.state.allowArray = true
        break

      case ',':
        delete node.state
        if (allowIndexed && node.name === 'indexed') {
          node.indexed = true
          node.name = ''
        }
        node.type = verifyType(node.type)

        var sibling: ParseNode = { type: '', name: '', parent: node.parent, state: { allowType: true } }
        node.parent.components.push(sibling)
        delete node.parent
        node = sibling
        break

      // Hit a space...
      case ' ':
        // If reading type, the type is done and may read a param or name
        if (node.state.allowType) {
          if (node.type !== '') {
            node.type = verifyType(node.type)
            delete node.state.allowType
            node.state.allowName = true
            node.state.allowParams = true
          }
        }

        // If reading name, the name is done
        if (node.state.allowName) {
          if (node.name !== '') {
            if (allowIndexed && node.name === 'indexed') {
              node.indexed = true
              node.name = ''
            } else {
              node.state.allowName = false
            }
          }
        }

        break

      case '[':
        if (!node.state.allowArray) {
          throwError(i)
        }

        node.type += c

        node.state.allowArray = false
        node.state.allowName = false
        node.state.readArray = true
        break

      case ']':
        if (!node.state.readArray) {
          throwError(i)
        }

        node.type += c

        node.state.readArray = false
        node.state.allowArray = true
        node.state.allowName = true
        break

      default:
        if (node.state.allowType) {
          node.type += c
          node.state.allowParams = true
          node.state.allowArray = true
        } else if (node.state.allowName) {
          node.name += c
          delete node.state.allowArray
        } else if (node.state.readArray) {
          node.type += c
        } else {
          throwError(i)
        }
    }
  }

  if (node.parent) {
    throw new Error('unexpected eof')
  }

  delete parent.state

  if (allowIndexed && node.name === 'indexed') {
    node.indexed = true
    node.name = ''
  }

  parent.type = verifyType(parent.type!)

  return parent as AbiInput
}

// @TODO: Better return type
function parseSignatureEvent(fragment: string): EventFragment {
  var abi: EventFragment = {
    anonymous: false,
    inputs: [],
    name: '',
    type: 'event'
  }

  var match = fragment.match(regexParen)
  if (!match) {
    throw new Error('invalid event: ' + fragment)
  }

  abi.name = match[1].trim()

  splitNesting(match[2]).forEach(function (param) {
    param = parseParam(param, true)
    param.indexed = !!param.indexed
    abi.inputs.push(param)
  })

  match[3].split(' ').forEach(function (modifier) {
    switch (modifier) {
      case 'anonymous':
        abi.anonymous = true
        break
      case '':
        break
      default:
        console.log('unknown modifier: ' + modifier)
    }
  })

  if (abi.name && !abi.name.match(regexIdentifier)) {
    throw new Error('invalid identifier: "' + abi.name + '"')
  }

  return abi
}

function parseSignatureFunction(fragment: string): FunctionFragment {
  var abi: FunctionFragment = {
    constant: false,
    gas: null,
    inputs: [],
    name: '',
    outputs: [],
    payable: false,
    stateMutability: null, // @TODO: Should this be initialized to 'nonpayable'?
    type: 'function'
  }

  let comps = fragment.split('@')
  if (comps.length !== 1) {
    if (comps.length > 2) {
      throw new Error('invalid signature')
    }
    if (!comps[1].match(/^[0-9]+$/)) {
      throw new Error('invalid signature gas')
    }
    abi.gas = new BigNumber(comps[1])
    fragment = comps[0]
  }

  comps = fragment.split(' returns ')
  var left = comps[0].match(regexParen)
  if (!left) {
    throw new Error('invalid signature')
  }

  abi.name = left[1].trim()
  if (!abi.name.match(regexIdentifier)) {
    throw new Error('invalid identifier: "' + left[1] + '"')
  }

  splitNesting(left[2]).forEach(function (param) {
    abi.inputs.push(parseParam(param))
  })

  left[3].split(' ').forEach(function (modifier) {
    switch (modifier) {
      case 'constant':
        abi.constant = true
        break
      case 'payable':
        abi.payable = true
        abi.stateMutability = 'payable'
        break
      case 'pure':
        abi.constant = true
        abi.stateMutability = 'pure'
        break
      case 'view':
        abi.constant = true
        abi.stateMutability = 'view'
        break
      case 'external':
      case 'public':
      case '':
        break
      default:
        console.log('unknown modifier: ' + modifier)
    }
  })

  // We have outputs
  if (comps.length > 1) {
    var right = comps[1].match(regexParen)
    if (!right || right[1].trim() != '' || right[3].trim() != '') {
      throw new Error('unexpected tokens')
    }

    splitNesting(right[2]).forEach(function (param) {
      abi.outputs.push(parseParam(param))
    })
  }

  if (abi.name === 'constructor') {
    abi.type = 'constructor'

    if (abi.outputs.length) {
      throw new Error('constructor may not have outputs')
    }

    // delete abi.name
    // delete abi.outputs
  }

  return abi
}

export function parseParamType(type: string): AbiInput {
  return parseParam(type, true)
}

// @TODO: Allow a second boolean to expose names
export function formatParamType(paramType: Readonly<AbiInput>): string {
  return getParamCoder(defaultCoerceFunc, paramType).type
}

// @TODO: Allow a second boolean to expose names and modifiers
export function formatSignature(fragment: EventFragment | FunctionFragment): string {
  return fragment.name + '(' + fragment.inputs.map((i) => formatParamType(i)).join(',') + ')'
}

export function parseSignature(fragment: string): EventFragment | FunctionFragment {
  if (typeof fragment === 'string') {
    // Make sure the "returns" is surrounded by a space and all whitespace is exactly one space
    fragment = fragment.replace(/\(/g, ' (').replace(/\)/g, ') ').replace(/\s+/g, ' ')
    fragment = fragment.trim()

    if (fragment.substring(0, 6) === 'event ') {
      return parseSignatureEvent(fragment.substring(6).trim())
    } else {
      if (fragment.substring(0, 9) === 'function ') {
        fragment = fragment.substring(9)
      }
      return parseSignatureFunction(fragment.trim())
    }
  }

  throw new Error('unknown signature')
}

///////////////////////////////////
// Coders

type DecodedResult<T = any> = { consumed: number; value: T }
abstract class Coder {
  readonly coerceFunc: CoerceFunc
  readonly name: string
  readonly type: string
  readonly localName: string
  readonly dynamic: boolean
  constructor(coerceFunc: CoerceFunc, name: string, type: string, localName: string = '', dynamic: boolean) {
    this.coerceFunc = coerceFunc
    this.name = name
    this.type = type
    this.localName = localName
    this.dynamic = dynamic
  }

  abstract encode(value: any): Uint8Array
  abstract decode(data: Uint8Array, offset: number): DecodedResult
}

// Clones the functionality of an existing Coder, but without a localName
class CoderAnonymous extends Coder {
  private coder!: Coder
  constructor(coder: Coder) {
    super(coder.coerceFunc, coder.name, coder.type, undefined, coder.dynamic)
    defineReadOnly(this, 'coder', coder)
  }
  encode(value: any): Uint8Array {
    return this.coder.encode(value)
  }
  decode(data: Uint8Array, offset: number): DecodedResult {
    return this.coder.decode(data, offset)
  }
}

class CoderNull extends Coder {
  constructor(coerceFunc: CoerceFunc, localName: string) {
    super(coerceFunc, 'null', '', localName, false)
  }

  encode(_value: any): Uint8Array {
    return arrayify([])
  }

  decode(data: Uint8Array, offset: number): DecodedResult {
    if (offset > data.length) {
      throw new Error('invalid null')
    }
    return {
      consumed: 0,
      value: this.coerceFunc('null', undefined)
    }
  }
}

function maskn(v: BigNumber, bits: number): BigNumber {
  return new BigNumber(v.toString(2).substr(-bits), 2)
}

class CoderNumber extends Coder {
  readonly size: number
  readonly signed: boolean
  constructor(coerceFunc: CoerceFunc, size: number, signed: boolean, localName: string) {
    const name = (signed ? 'int' : 'uint') + size * 8
    super(coerceFunc, name, name, localName, false)

    this.size = size
    this.signed = signed
  }

  encode(value: BigNumber.Value): Uint8Array {
    try {
      let v = toBigNumber(value)

      if (this.signed) {
        let bounds = maskn(MaxUint256, this.size * 8 - 1)
        if (v.gt(bounds)) {
          throw new Error('out-of-bounds')
        }
        bounds = bounds.plus(One).multipliedBy(NegativeOne)
        if (v.lt(bounds)) {
          throw new Error('out-of-bounds')
        }
      } else if (v.lt(Zero) || v.gt(maskn(MaxUint256, this.size * 8))) {
        throw new Error('out-of-bounds')
      }

      v = maskn(toTwosComplement(v, this.size * 8), this.size * 8)

      if (this.signed) {
        v = toTwosComplement(fromTwosComplement(v, this.size * 8), 256)
      }

      let result = padLeft(toTwosComplement(v).toString(16), 64)

      if (result.indexOf('NaN') != -1) {
        return errors.throwError('invalid number value, NaN', errors.INVALID_ARGUMENT, {
          arg: this.localName,
          coderType: this.name,
          value: value,
          v,
          twosComplement: toTwosComplement(v),
          twosComplement16: toTwosComplement(v).toString(16),
          pad: padLeft(toTwosComplement(v).toString(16), 64),
          size: this.size
        })
      }

      return hexToBytes(result)
    } catch (error) {
      return errors.throwError('invalid number value', errors.INVALID_ARGUMENT, {
        arg: this.localName,
        coderType: this.name,
        value: value,
        message: error.toString()
      })
    }
  }

  decode(data: Uint8Array, offset: number): DecodedResult {
    if (data.length < offset + 32) {
      errors.throwError('insufficient data for ' + this.name + ' type', errors.INVALID_ARGUMENT, {
        arg: this.localName,
        coderType: this.name,
        value: hexlify(data.slice(offset, offset + 32))
      })
    }
    var junkLength = 32 - this.size
    var value = new BigNumber(bytesToHex(data.slice(offset + junkLength, offset + 32)), 16)

    if (this.signed) {
      value = fromTwosComplement(value, this.size * 8)
    } else {
      value = maskn(value, this.size * 8)
    }

    return {
      consumed: 32,
      value: this.coerceFunc(this.name, value)
    }
  }
}
var uint256Coder = new CoderNumber(
  function (_type: string, value: any) {
    return value
  },
  32,
  false,
  'none'
)

class CoderBoolean extends Coder {
  constructor(coerceFunc: CoerceFunc, localName: string) {
    super(coerceFunc, 'bool', 'bool', localName, false)
  }

  encode(value: boolean): Uint8Array {
    return uint256Coder.encode(!!value ? 1 : 0)
  }

  decode(data: Uint8Array, offset: number): DecodedResult {
    try {
      var result = uint256Coder.decode(data, offset)
    } catch (error) {
      if (error.reason === 'insufficient data for uint256 type') {
        errors.throwError('insufficient data for boolean type', errors.INVALID_ARGUMENT, {
          arg: this.localName,
          coderType: 'boolean',
          value: error.value
        })
      }
      throw error
    }
    return {
      consumed: result.consumed,
      value: this.coerceFunc('bool', !result.value.isZero())
    }
  }
}

class CoderFixedBytes extends Coder {
  readonly length: number
  constructor(coerceFunc: CoerceFunc, length: number, localName: string) {
    const name = 'bytes' + length
    super(coerceFunc, name, name, localName, false)
    this.length = length
  }

  encode(value: Arrayish): Uint8Array {
    var result = new Uint8Array(32)

    try {
      if (typeof value == 'string') {
        if (value.length % 2 !== 0) {
          throw new Error(`hex string cannot be odd-length`)
        }
      }

      let data = arrayify(value)

      if (data.length > this.length) {
        throw new Error(`incorrect data length`)
      }

      result.set(data)
    } catch (error) {
      errors.throwError('invalid ' + this.name + ' value. Use hex strings or Uint8Array', errors.INVALID_ARGUMENT, {
        arg: this.localName,
        coderType: this.name,
        value: error.value || value,
        details: error.message
      })
    }

    return result
  }

  decode(data: Uint8Array, offset: number): DecodedResult<Uint8Array> {
    if (data.length < offset + 32) {
      errors.throwError('insufficient data for ' + name + ' type', errors.INVALID_ARGUMENT, {
        arg: this.localName,
        coderType: this.name,
        value: hexlify(data.slice(offset, offset + 32))
      })
    }

    return {
      consumed: 32,
      value: this.coerceFunc(this.name, data.slice(offset, offset + this.length))
    }
  }
}

class CoderAddress extends Coder {
  constructor(coerceFunc: CoerceFunc, localName: string) {
    super(coerceFunc, 'address', 'address', localName, false)
  }
  encode(inputAddress: string): Uint8Array {
    let result = new Uint8Array(32)
    const address = inputAddress.trim()
    if (!isAddress(address)) {
      errors.throwError(`invalid address format`, errors.INVALID_ARGUMENT, {
        arg: this.localName,
        coderType: 'address',
        value: inputAddress
      })
    }
    try {
      result.set(hexToBytes(inputAddressFormatter(address)), 12)
    } catch (error) {
      errors.throwError(`invalid address (${error.message})`, errors.INVALID_ARGUMENT, {
        arg: this.localName,
        coderType: 'address',
        value: inputAddress
      })
    }
    return result
  }
  decode(data: Uint8Array, offset: number): DecodedResult {
    if (data.length < offset + 32) {
      errors.throwError('insufficuent data for address type', errors.INVALID_ARGUMENT, {
        arg: this.localName,
        coderType: 'address',
        value: hexlify(data.slice(offset, offset + 32))
      })
    }
    return {
      consumed: 32,
      value: this.coerceFunc('address', getAddress(hexlify(data.slice(offset + 12, offset + 32))))
    }
  }
}

function _encodeDynamicBytes(value: Uint8Array): Uint8Array {
  var dataLength = 32 * Math.ceil(value.length / 32)
  var padding = new Uint8Array(dataLength - value.length)

  return concat([uint256Coder.encode(value.length), value, padding])
}

function _decodeDynamicBytes(data: Uint8Array, offset: number, localName: string): DecodedResult {
  if (data.length < offset + 32) {
    errors.throwError('insufficient data for dynamicBytes length', errors.INVALID_ARGUMENT, {
      arg: localName,
      coderType: 'dynamicBytes',
      value: hexlify(data.slice(offset, offset + 32))
    })
  }

  var length = uint256Coder.decode(data, offset).value
  try {
    length = length.toNumber()
  } catch (error) {
    errors.throwError('dynamic bytes count too large', errors.INVALID_ARGUMENT, {
      arg: localName,
      coderType: 'dynamicBytes',
      value: length.toString()
    })
  }

  if (data.length < offset + 32 + length) {
    errors.throwError('insufficient data for dynamicBytes type', errors.INVALID_ARGUMENT, {
      arg: localName,
      coderType: 'dynamicBytes',
      value: hexlify(data.slice(offset, offset + 32 + length))
    })
  }

  return {
    consumed: 32 + 32 * Math.ceil(length / 32),
    value: data.slice(offset + 32, offset + 32 + length)
  }
}

class CoderDynamicBytes extends Coder {
  constructor(coerceFunc: CoerceFunc, localName: string) {
    super(coerceFunc, 'bytes', 'bytes', localName, true)
  }
  encode(value: Arrayish): Uint8Array {
    try {
      return _encodeDynamicBytes(arrayify(value))
    } catch (error) {
      return errors.throwError('invalid bytes value', errors.INVALID_ARGUMENT, {
        arg: this.localName,
        coderType: 'bytes',
        value: error.value
      })
    }
  }

  decode(data: Uint8Array, offset: number): DecodedResult {
    var result = _decodeDynamicBytes(data, offset, this.localName)
    result.value = this.coerceFunc('bytes', result.value)
    return result
  }
}

class CoderString extends Coder {
  constructor(coerceFunc: CoerceFunc, localName: string) {
    super(coerceFunc, 'string', 'string', localName, true)
  }

  encode(value: string): Uint8Array {
    if (typeof value !== 'string') {
      errors.throwError('invalid string value', errors.INVALID_ARGUMENT, {
        arg: this.localName,
        coderType: 'string',
        value: value
      })
    }
    return _encodeDynamicBytes(toUtf8Bytes(value))
  }

  decode(data: Uint8Array, offset: number): DecodedResult {
    var result = _decodeDynamicBytes(data, offset, this.localName)
    result.value = this.coerceFunc('string', toUtf8String(result.value))
    return result
  }
}

function alignSize(size: number): number {
  return 32 * Math.ceil(size / 32)
}

function pack(coders: Array<Coder>, values: Array<any>): Uint8Array {
  if (Array.isArray(values)) {
    // do nothing
  } else if (values && typeof values === 'object') {
    var arrayValues: Array<any> = []
    coders.forEach(function (coder) {
      arrayValues.push((<any>values)[coder.localName])
    })
    values = arrayValues
  } else {
    errors.throwError('invalid tuple value', errors.INVALID_ARGUMENT, {
      coderType: 'tuple',
      value: values
    })
  }

  if (coders.length !== values.length) {
    errors.throwError('types/value length mismatch', errors.INVALID_ARGUMENT, {
      coderType: 'tuple',
      value: values
    })
  }

  var parts: Array<{ dynamic: boolean; value: any }> = []

  coders.forEach(function (coder, index) {
    parts.push({ dynamic: coder.dynamic, value: coder.encode(values[index]) })
  })

  var staticSize = 0,
    dynamicSize = 0
  parts.forEach(function (part) {
    if (part.dynamic) {
      staticSize += 32
      dynamicSize += alignSize(part.value.length)
    } else {
      staticSize += alignSize(part.value.length)
    }
  })

  var offset = 0,
    dynamicOffset = staticSize
  var data = new Uint8Array(staticSize + dynamicSize)

  parts.forEach(function (part) {
    if (part.dynamic) {
      //uint256Coder.encode(dynamicOffset).copy(data, offset);
      data.set(uint256Coder.encode(dynamicOffset), offset)
      offset += 32

      //part.value.copy(data, dynamicOffset);  @TODO
      data.set(part.value, dynamicOffset)
      dynamicOffset += alignSize(part.value.length)
    } else {
      //part.value.copy(data, offset);  @TODO
      data.set(part.value, offset)
      offset += alignSize(part.value.length)
    }
  })

  return data
}

export class Tuple extends Array<any> {
  [key: string]: any
}

function unpack(coders: Array<Coder>, data: Uint8Array, offset: number): DecodedResult {
  var baseOffset = offset
  var consumed = 0

  var value: any[] = []
  coders.forEach(function (coder) {
    if (coder.dynamic) {
      var dynamicOffset = uint256Coder.decode(data, offset)
      var result = coder.decode(data, baseOffset + dynamicOffset.value.toNumber())
      // The dynamic part is leap-frogged somewhere else; doesn't count towards size
      result.consumed = dynamicOffset.consumed
    } else {
      var result = coder.decode(data, offset)
    }

    if (result.value != undefined) {
      value.push(result.value)
    }

    offset += result.consumed
    consumed += result.consumed
  })

  return {
    value: value,
    consumed: consumed
  }
}

function unpackWithNames(coders: Array<Coder>, data: Uint8Array, offset: number): DecodedResult {
  var baseOffset = offset
  var consumed = 0
  var value = new Tuple()
  coders.forEach(function (coder) {
    if (coder.dynamic) {
      var dynamicOffset = uint256Coder.decode(data, offset)
      var result = coder.decode(data, baseOffset + dynamicOffset.value.toNumber())
      // The dynamic part is leap-frogged somewhere else; doesn't count towards size
      result.consumed = dynamicOffset.consumed
    } else {
      var result = coder.decode(data, offset)
    }

    if (result.value != undefined) {
      value.push(result.value)
    }

    offset += result.consumed
    consumed += result.consumed
  })

  coders.forEach(function (coder: Coder, index: number) {
    let name: string = coder.localName
    if (!name) {
      return
    }

    if (name === 'length') {
      name = '_length'
    }

    if (value[name] != null) {
      return
    }

    value[name] = value[index]
  })

  return {
    value: value,
    consumed: consumed
  }
}

class CoderArray extends Coder {
  readonly coder: Coder
  readonly length: number
  constructor(coerceFunc: CoerceFunc, coder: Coder, length: number, localName: string) {
    const type = coder.type + '[' + (length >= 0 ? length : '') + ']'
    const dynamic = length === -1 || coder.dynamic
    super(coerceFunc, 'array', type, localName, dynamic)

    this.coder = coder
    this.length = length
  }

  encode(value: Array<any>): Uint8Array {
    if (!Array.isArray(value)) {
      errors.throwError('expected array value', errors.INVALID_ARGUMENT, {
        arg: this.localName,
        coderType: 'array',
        value: value
      })
    }

    var count = this.length

    var result = new Uint8Array(0)
    if (count === -1) {
      count = value.length
      result = uint256Coder.encode(count)
    }

    errors.checkArgumentCount(count, value.length, 'in coder array' + (this.localName ? ' ' + this.localName : ''))

    var coders: Coder[] = []
    for (var i = 0; i < value.length; i++) {
      coders.push(this.coder)
    }

    return concat([result, pack(coders, value)])
  }

  decode(data: Uint8Array, offset: number) {
    // @TODO:
    //if (data.length < offset + length * 32) { throw new Error('invalid array'); }

    var consumed = 0

    var count = this.length

    if (count === -1) {
      try {
        var decodedLength = uint256Coder.decode(data, offset)
      } catch (error) {
        return errors.throwError('insufficient data for dynamic array length', errors.INVALID_ARGUMENT, {
          arg: this.localName,
          coderType: 'array',
          value: error.value
        })
      }
      try {
        count = decodedLength.value.toNumber()
      } catch (error) {
        errors.throwError('array count too large', errors.INVALID_ARGUMENT, {
          arg: this.localName,
          coderType: 'array',
          value: decodedLength.value.toString()
        })
      }
      consumed += decodedLength.consumed
      offset += decodedLength.consumed
    }

    var coders: Coder[] = []
    for (var i = 0; i < count; i++) {
      coders.push(new CoderAnonymous(this.coder))
    }

    var result = unpack(coders, data, offset)
    result.consumed += consumed
    result.value = this.coerceFunc(this.type, result.value)
    return result
  }
}

class CoderTuple extends Coder {
  readonly coders: Array<Coder>
  constructor(coerceFunc: CoerceFunc, coders: Array<Coder>, localName: string) {
    var dynamic = false
    var types: Array<string> = []
    coders.forEach(function (coder) {
      if (coder.dynamic) {
        dynamic = true
      }
      types.push(coder.type)
    })
    var type = 'tuple(' + types.join(',') + ')'

    super(coerceFunc, 'tuple', type, localName, dynamic)
    this.coders = coders
  }

  encode(value: Array<any>): Uint8Array {
    return pack(this.coders, value)
  }

  decode(data: Uint8Array, offset: number): DecodedResult {
    var result = unpackWithNames(this.coders, data, offset)
    result.value = this.coerceFunc(this.type, result.value)
    return result
  }
}
/*
function getTypes(coders) {
    var type = coderTuple(coders).type;
    return type.substring(6, type.length - 1);
}
*/
function splitNesting(value: string): Array<any> {
  value = value.trim()

  var result: string[] = []
  var accum = ''
  var depth = 0
  for (var offset = 0; offset < value.length; offset++) {
    var c = value[offset]
    if (c === ',' && depth === 0) {
      result.push(accum)
      accum = ''
    } else {
      accum += c
      if (c === '(') {
        depth++
      } else if (c === ')') {
        depth--
        if (depth === -1) {
          throw new Error('unbalanced parenthsis')
        }
      }
    }
  }
  if (accum) {
    result.push(accum)
  }

  return result
}

// @TODO: Is there a way to return "class"?
const paramTypeSimple: { [key: string]: any } = {
  address: CoderAddress,
  bool: CoderBoolean,
  string: CoderString,
  bytes: CoderDynamicBytes
}

function getTupleParamCoder(
  coerceFunc: CoerceFunc,
  components: ReadonlyArray<Readonly<AbiInput>>,
  localName: string
): CoderTuple {
  if (!components) {
    components = []
  }
  var coders = components.map((component) => getParamCoder(coerceFunc, component))

  return new CoderTuple(coerceFunc, coders, localName)
}

function getParamCoder(coerceFunc: CoerceFunc, param: Readonly<AbiInput>): Coder {
  var coder = paramTypeSimple[param.type]
  if (coder) {
    return new coder(coerceFunc, param.name)
  }
  var match = param.type.match(paramTypeNumber)
  if (match) {
    let size = parseInt(match[2] || '256')
    if (size === 0 || size > 256 || size % 8 !== 0) {
      return errors.throwError('invalid ' + match[1] + ' bit length', errors.INVALID_ARGUMENT, {
        arg: 'param',
        value: param
      })
    }
    return new CoderNumber(coerceFunc, size / 8, match[1] === 'int', param.name!)
  }

  var match = param.type.match(paramTypeBytes)
  if (match) {
    let size = parseInt(match[1])
    if (size === 0 || size > 32) {
      errors.throwError('invalid bytes length', errors.INVALID_ARGUMENT, {
        arg: 'param',
        value: param
      })
    }
    return new CoderFixedBytes(coerceFunc, size, param.name!)
  }

  var match = param.type.match(paramTypeArray)

  if (match) {
    const newParam = { ...param }
    let size = parseInt(match[2] || '-1')
    newParam.type = match[1]
    return new CoderArray(coerceFunc, getParamCoder(coerceFunc, newParam), size, param.name!)
  }

  if (param.type.substring(0, 5) === 'tuple') {
    return getTupleParamCoder(coerceFunc, param.components!, param.name!)
  }

  if (param.type === '') {
    return new CoderNull(coerceFunc, param.name!)
  }

  return errors.throwError('invalid type', errors.INVALID_ARGUMENT, {
    arg: 'type',
    value: param.type,
    fullType: param
  })
}

export class AbiCoder {
  readonly coerceFunc!: CoerceFunc
  constructor(coerceFunc?: CoerceFunc) {
    errors.checkNew(this, AbiCoder)

    if (!coerceFunc) {
      coerceFunc = defaultCoerceFunc
    }

    defineReadOnly(this, 'coerceFunc', coerceFunc)
  }

  encode(types: ReadonlyArray<Readonly<AbiInput>>, values: Array<any>): Uint8Array {
    if (types.length !== values.length) {
      errors.throwError('types/values length mismatch', errors.INVALID_ARGUMENT, {
        count: { types: types.length, values: values.length },
        value: { types: types, values: values }
      })
    }

    const coders = types.map((type) => getParamCoder(this.coerceFunc, type))
    return new CoderTuple(this.coerceFunc, coders, '_').encode(values)
  }

  decode(types: ReadonlyArray<Readonly<AbiOutput>>, data: Uint8Array): any {
    const coders = types.map((type) => getParamCoder(this.coerceFunc, type))
    return new CoderTuple(this.coerceFunc, coders, '_').decode(data, 0).value
  }
}
