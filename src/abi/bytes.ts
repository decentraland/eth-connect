import * as errors from './errors'

///////////////////////////////
// Exported Types

export type Arrayish = string | ArrayLike<number>

export interface Signature {
  r: string
  s: string

  /* At least one of the following MUST be specified; the other will be derived */
  recoveryParam?: number
  v?: number
}

///////////////////////////////

function addSlice(array: Uint8Array): Uint8Array {
  if ('slice' in array && array.slice) {
    return array
  }

  array.slice = function () {
    var args: any = Array.prototype.slice.call(arguments)
    return new Uint8Array(Array.prototype.slice.apply(array, args))
  }

  return array
}

export function isArrayish(value: any): value is Arrayish {
  if (!value || parseInt(String(value.length)) != value.length || typeof value === 'string') {
    return false
  }

  for (var i = 0; i < value.length; i++) {
    var v = value[i]
    if (v < 0 || v >= 256 || parseInt(String(v)) != v) {
      return false
    }
  }

  return true
}

export function arrayify(value: Arrayish): Uint8Array {
  if (value == null) {
    errors.throwError('cannot convert null value to array', errors.INVALID_ARGUMENT, { arg: 'value', value: value })
  }

  if (value instanceof Uint8Array) {
    return addSlice(new Uint8Array(value))
  }

  if (typeof value === 'string') {
    let match = value.match(/^(0x)?[0-9a-fA-F]*$/)

    if (!match) {
      return errors.throwError('invalid hexidecimal string', errors.INVALID_ARGUMENT, { arg: 'value', value: value })
    }

    if (match[1] !== '0x') {
      return errors.throwError('hex string must have 0x prefix', errors.INVALID_ARGUMENT, {
        arg: 'value',
        value: value
      })
    }

    value = value.substring(2)
    if (value.length % 2) {
      value = '0' + value
    }

    var result: any = []
    for (var i = 0; i < value.length; i += 2) {
      result.push(parseInt(value.substr(i, 2), 16))
    }

    return addSlice(new Uint8Array(result))
  }

  if (isArrayish(value)) {
    return addSlice(new Uint8Array(value))
  }

  return errors.throwError('invalid arrayify value', undefined, { arg: 'value', value: value, type: typeof value })
}
