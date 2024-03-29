import { INVALID_ARGUMENT, createError } from '../utils/errors'

///////////////////////////////
// Exported Types

export type Arrayish = string | ArrayLike<number>

///////////////////////////////

export function isArrayish(value: any): value is Arrayish {
  if (!value || parseInt(String(value.length)) !== value.length || typeof value === 'string') {
    return false
  }

  for (let i = 0; i < value.length; i++) {
    const v = value[i]
    if (v < 0 || v >= 256 || parseInt(String(v)) !== v) {
      return false
    }
  }

  return true
}

export function arrayify(value: Arrayish): Uint8Array {
  if (value === null) {
    throw createError('cannot convert null value to array', INVALID_ARGUMENT, { arg: 'value', value: value })
  }

  if (value instanceof Uint8Array) {
    return new Uint8Array(value)
  }

  if (typeof value === 'string') {
    const match = value.match(/^(0x)?[0-9a-fA-F]*$/)

    if (!match) {
      throw createError('invalid hexidecimal string', INVALID_ARGUMENT, { arg: 'value', value: value })
    }

    if (match[1] !== '0x') {
      throw createError('hex string must have 0x prefix', INVALID_ARGUMENT, {
        arg: 'value',
        value: value
      })
    }

    value = value.substring(2)
    if (value.length % 2) {
      value = '0' + value
    }

    const result: any = []
    for (let i = 0; i < value.length; i += 2) {
      result.push(parseInt(value.substr(i, 2), 16))
    }

    return new Uint8Array(result)
  }

  if (isArrayish(value)) {
    return new Uint8Array(value)
  }

  throw createError('invalid arrayify value', undefined, { arg: 'value', value: value, type: typeof value })
}
