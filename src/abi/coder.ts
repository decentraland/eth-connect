'use strict'

// See: https://github.com/ethereum/wiki/wiki/Ethereum-Contract-ABI

import { checkArgumentCount, checkNew, INVALID_ARGUMENT, createError } from '../utils/errors'
import { BigNumber } from '../utils/BigNumber'
import { arrayify } from './bytes'
import { stringToUtf8Bytes, bytesToUtf8String } from '../utils/utf8'
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
  toTwosComplement,
  concatBytes,
  toHex,
  getAddress
} from '../utils/utils'
import { inputAddressFormatter } from '../utils/formatters'
import { AbiEvent, AbiFunction, AbiInput, AbiOutput } from '../Schema'
import { MaxUint256, NegativeOne, One, Zero } from './constants'
import { parseParamType } from './parser'

///////////////////////////////
// Exported Types

export type CoerceFunc = (type: string, value: any) => any

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

export function formatParamType(paramType: Readonly<AbiInput>): string {
  return getParamCoder(defaultCoerceFunc, paramType).type
}

// @TODO: Allow a second boolean to expose names and modifiers
export function formatSignature(fragment: AbiEvent | AbiFunction): string {
  return fragment.name + '(' + (fragment.inputs || []).map((i) => formatParamType(i)).join(',') + ')'
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
        throw createError('invalid number value, NaN', INVALID_ARGUMENT, {
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
      throw createError('invalid number value', INVALID_ARGUMENT, {
        arg: this.localName,
        coderType: this.name,
        value: value,
        message: error.toString()
      })
    }
  }

  decode(data: Uint8Array, offset: number): DecodedResult {
    if (data.length < offset + 32) {
      throw createError('insufficient data for ' + this.name + ' type', INVALID_ARGUMENT, {
        arg: this.localName,
        coderType: this.name,
        value: toHex(data.slice(offset, offset + 32))
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
        throw createError('insufficient data for boolean type', INVALID_ARGUMENT, {
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
      throw createError('invalid ' + this.name + ' value. Use hex strings or Uint8Array', INVALID_ARGUMENT, {
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
      throw createError('insufficient data for ' + this.name + ' type', INVALID_ARGUMENT, {
        arg: this.localName,
        coderType: this.name,
        value: toHex(data.slice(offset, offset + 32))
      })
    }

    return {
      consumed: 32,
      value: this.coerceFunc(this.name, data.slice(offset, offset + this.length))
    }
  }
}

class CoderFunction extends CoderFixedBytes {
  constructor(coerceFunc: CoerceFunc, localName: string) {
    super(coerceFunc, 24, localName)
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
      throw createError(`invalid address format`, INVALID_ARGUMENT, {
        arg: this.localName,
        coderType: 'address',
        value: inputAddress
      })
    }
    try {
      result.set(hexToBytes(inputAddressFormatter(address)), 12)
    } catch (error) {
      throw createError(`invalid address (${error.message})`, INVALID_ARGUMENT, {
        arg: this.localName,
        coderType: 'address',
        value: inputAddress
      })
    }
    return result
  }
  decode(data: Uint8Array, offset: number): DecodedResult {
    if (data.length < offset + 32) {
      throw createError('insufficuent data for address type', INVALID_ARGUMENT, {
        arg: this.localName,
        coderType: 'address',
        value: toHex(data.slice(offset, offset + 32)),
        missingBytes: offset + 32 - data.length
      })
    }
    return {
      consumed: 32,
      value: this.coerceFunc('address', getAddress(toHex(data.slice(offset + 12, offset + 32))))
    }
  }
}

function _encodeDynamicBytes(value: Uint8Array): Uint8Array {
  var dataLength = 32 * Math.ceil(value.length / 32)
  var padding = new Uint8Array(dataLength - value.length)

  return concatBytes(uint256Coder.encode(value.length), value, padding)
}

function _decodeDynamicBytes(data: Uint8Array, offset: number, localName: string): DecodedResult {
  if (data.length < offset + 32) {
    throw createError('insufficient data for dynamicBytes length', INVALID_ARGUMENT, {
      arg: localName,
      coderType: 'dynamicBytes',
      value: toHex(data.slice(offset, offset + 32))
    })
  }

  var length = uint256Coder.decode(data, offset).value
  try {
    length = length.toNumber()
  } catch (error) {
    throw error('dynamic bytes count too large', INVALID_ARGUMENT, {
      arg: localName,
      coderType: 'dynamicBytes',
      value: length.toString()
    })
  }

  if (data.length < offset + 32 + length) {
    throw createError('insufficient data for dynamicBytes type', INVALID_ARGUMENT, {
      arg: localName,
      coderType: 'dynamicBytes',
      value: toHex(data.slice(offset, offset + 32 + length))
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
      throw error('invalid bytes value', INVALID_ARGUMENT, {
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
      throw createError('invalid string value', INVALID_ARGUMENT, {
        arg: this.localName,
        coderType: 'string',
        value: value
      })
    }
    return _encodeDynamicBytes(stringToUtf8Bytes(value))
  }

  decode(data: Uint8Array, offset: number): DecodedResult {
    var result = _decodeDynamicBytes(data, offset, this.localName)
    result.value = this.coerceFunc('string', bytesToUtf8String(result.value))
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
    throw createError('invalid tuple value', INVALID_ARGUMENT, {
      coderType: 'tuple',
      value: values
    })
  }

  if (coders.length !== values.length) {
    throw createError('types/value length mismatch', INVALID_ARGUMENT, {
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
      throw createError('expected array value', INVALID_ARGUMENT, {
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

    checkArgumentCount(count, value.length, 'in coder array' + (this.localName ? ' ' + this.localName : ''))

    var coders: Coder[] = []
    for (var i = 0; i < value.length; i++) {
      coders.push(this.coder)
    }

    return concatBytes(result, pack(coders, value))
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
        throw error('insufficient data for dynamic array length', INVALID_ARGUMENT, {
          arg: this.localName,
          coderType: 'array',
          value: error.value
        })
      }
      try {
        count = decodedLength.value.toNumber()
      } catch (error) {
        throw error('array count too large', INVALID_ARGUMENT, {
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

// @TODO: Is there a way to return "class"?
const paramTypeSimple: { [key: string]: any } = {
  address: CoderAddress,
  bool: CoderBoolean,
  string: CoderString,
  bytes: CoderDynamicBytes,
  function: CoderFunction
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
      throw createError('invalid ' + match[1] + ' bit length', INVALID_ARGUMENT, {
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
      throw createError('invalid bytes length', INVALID_ARGUMENT, {
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

  throw createError('invalid type', INVALID_ARGUMENT, {
    arg: 'type',
    value: param.type,
    fullType: param
  })
}

export class AbiCoder {
  readonly coerceFunc!: CoerceFunc
  constructor(coerceFunc?: CoerceFunc) {
    checkNew(this, AbiCoder)

    if (!coerceFunc) {
      coerceFunc = defaultCoerceFunc
    }

    defineReadOnly(this, 'coerceFunc', coerceFunc)
  }

  encode(types: ReadonlyArray<Readonly<AbiInput | string>>, values: Array<any>): Uint8Array {
    if (types.length !== values.length) {
      throw createError('types/values length mismatch', INVALID_ARGUMENT, {
        count: { types: types.length, values: values.length },
        value: { types: types, values: values }
      })
    }

    const coders = types
      .map(($) => {
        if (typeof $ === 'string') {
          return parseParamType($)
        } else {
          return $
        }
      })
      .map(($) => getParamCoder(this.coerceFunc, $))

    return new CoderTuple(this.coerceFunc, coders, '_').encode(values)
  }

  decode(types: ReadonlyArray<Readonly<AbiOutput | string>>, data: Uint8Array): any {
    const coders = types
      .map(($) => {
        if (typeof $ === 'string') {
          return parseParamType($)
        } else {
          return $
        }
      })
      .map(($) => getParamCoder(this.coerceFunc, $))

    return new CoderTuple(this.coerceFunc, coders, '_').decode(data, 0).value
  }
}
