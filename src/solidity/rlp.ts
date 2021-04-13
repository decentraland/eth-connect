import { bytesToHex, concatBytes, hexToBytes } from '../utils/utils'
import { BigNumber } from '../utils/BigNumber'

export type Input = string | number | bigint | Uint8Array | BigNumber | List | null | boolean

// Use interface extension instead of type alias to
// make circular declaration possible.
export interface List extends Array<Input> {}

export interface Decoded {
  data: Uint8Array | Uint8Array[]
  remainder: Uint8Array
}

/**
 * RLP Encoding based on: https://github.com/ethereum/wiki/wiki/%5BEnglish%5D-RLP
 * This function takes in a data, convert it to Uint8Array if not, and a length for recursion
 * @param input - will be converted to Uint8Array
 * @returns returns Uint8Array of encoded data
 **/
export function encode(input: Input): Uint8Array {
  if (Array.isArray(input)) {
    const output: Uint8Array[] = []
    for (let i = 0; i < input.length; i++) {
      output.push(encode(input[i]))
    }
    return concatBytes(encodeLength(output.length, 192), ...output)
  } else {
    const inputBuf = toUint8Array(input)
    return inputBuf.length === 1 && inputBuf[0] < 128
      ? inputBuf
      : concatBytes(encodeLength(inputBuf.length, 128), inputBuf)
  }
}

/**
 * Parse integers. Check if there is no leading zeros
 * @param v The value to parse
 * @param base The base to parse the integer into
 */
function safeParseInt(v: string, base: number): number {
  if (v.slice(0, 2) === '00') {
    throw new Error('invalid RLP: extra zeros')
  }

  return parseInt(v, base)
}

function encodeLength(len: number, offset: number): Uint8Array {
  if (len < 56) {
    return Uint8Array.from([len + offset])
  } else {
    const hexLength = intToHex(len)
    const lLength = hexLength.length / 2
    const firstByte = intToHex(offset + 55 + lLength)
    return hexToBytes(firstByte + hexLength)
  }
}

/**
 * RLP Decoding based on: {@link https://github.com/ethereum/wiki/wiki/%5BEnglish%5D-RLP|RLP}
 * @param input - will be converted to Uint8Array
 * @param stream - Is the input a stream (false by default)
 * @returns - returns decode Array of Uint8Arrays containg the original message
 **/
export function decode(input: Uint8Array, stream?: boolean): Uint8Array
export function decode(input: Uint8Array[], stream?: boolean): Uint8Array[]
export function decode(input: Input, stream?: boolean): Uint8Array[] | Uint8Array | Decoded
export function decode(input: Input, stream: boolean = false): Uint8Array[] | Uint8Array | Decoded {
  if (!input || (<any>input).length === 0) {
    return Uint8Array.from([])
  }

  const inputUint8Array = toUint8Array(input)
  const decoded = _decode(inputUint8Array)

  if (stream) {
    return decoded
  }
  if (decoded.remainder.length !== 0) {
    throw new Error('invalid remainder')
  }

  return decoded.data
}

/**
 * Get the length of the RLP input
 * @param input
 * @returns The length of the input or an empty Uint8Array if no input
 */
export function getLength(input: Input): Uint8Array | number {
  if (!input || (<any>input).length === 0) {
    return Uint8Array.from([])
  }

  const inputUint8Array = toUint8Array(input)
  const firstByte = inputUint8Array[0]

  if (firstByte <= 0x7f) {
    return inputUint8Array.length
  } else if (firstByte <= 0xb7) {
    return firstByte - 0x7f
  } else if (firstByte <= 0xbf) {
    return firstByte - 0xb6
  } else if (firstByte <= 0xf7) {
    // a list between  0-55 bytes long
    return firstByte - 0xbf
  } else {
    // a list  over 55 bytes long
    const llength = firstByte - 0xf6
    const length = safeParseInt(bytesToHex(inputUint8Array.slice(1, llength)), 16)
    return llength + length
  }
}

/** Decode an input with RLP */
function _decode(input: Uint8Array): Decoded {
  let length, llength, data, innerRemainder, d
  const decoded = []
  const firstByte = input[0]

  if (firstByte <= 0x7f) {
    // a single byte whose value is in the [0x00, 0x7f] range, that byte is its own RLP encoding.
    return {
      data: input.slice(0, 1),
      remainder: input.slice(1)
    }
  } else if (firstByte <= 0xb7) {
    // string is 0-55 bytes long. A single byte with value 0x80 plus the length of the string followed by the string
    // The range of the first byte is [0x80, 0xb7]
    length = firstByte - 0x7f

    // set 0x80 null to 0
    if (firstByte === 0x80) {
      data = Uint8Array.from([])
    } else {
      data = input.slice(1, length)
    }

    if (length === 2 && data[0] < 0x80) {
      throw new Error('invalid rlp encoding: byte must be less 0x80')
    }

    return {
      data: data,
      remainder: input.slice(length)
    }
  } else if (firstByte <= 0xbf) {
    // string is greater than 55 bytes long. A single byte with the value (0xb7 plus the length of the length),
    // followed by the length, followed by the string
    llength = firstByte - 0xb6
    if (input.length - 1 < llength) {
      throw new Error('invalid RLP: not enough bytes for string length')
    }
    length = safeParseInt(bytesToHex(input.slice(1, llength)), 16)
    if (length <= 55) {
      throw new Error('invalid RLP: expected string length to be greater than 55')
    }
    data = input.slice(llength, length + llength)
    if (data.length < length) {
      throw new Error('invalid RLP: not enough bytes for string')
    }

    return {
      data: data,
      remainder: input.slice(length + llength)
    }
  } else if (firstByte <= 0xf7) {
    // a list between  0-55 bytes long
    length = firstByte - 0xbf
    innerRemainder = input.slice(1, length)
    while (innerRemainder.length) {
      d = _decode(innerRemainder)
      decoded.push(d.data as Uint8Array)
      innerRemainder = d.remainder
    }

    return {
      data: decoded,
      remainder: input.slice(length)
    }
  } else {
    // a list  over 55 bytes long
    llength = firstByte - 0xf6
    length = safeParseInt(bytesToHex(input.slice(1, llength)), 16)
    const totalLength = llength + length
    if (totalLength > input.length) {
      throw new Error('invalid rlp: total length is larger than the data')
    }

    innerRemainder = input.slice(llength, totalLength)
    if (innerRemainder.length === 0) {
      throw new Error('invalid rlp, List has a invalid length')
    }

    while (innerRemainder.length) {
      d = _decode(innerRemainder)
      decoded.push(d.data as Uint8Array)
      innerRemainder = d.remainder
    }
    return {
      data: decoded,
      remainder: input.slice(totalLength)
    }
  }
}

/** Check if a string is prefixed by 0x */
function isHexPrefixed(str: string): boolean {
  return str.slice(0, 2) === '0x'
}

/** Removes 0x from a given String */
function stripHexPrefix(str: string): string {
  if (typeof str !== 'string') {
    return str
  }
  return isHexPrefixed(str) ? str.slice(2) : str
}

/** Transform an integer into its hexadecimal value */
function intToHex(integer: number | bigint): string {
  if (integer < 0) {
    throw new Error('Invalid integer as argument, must be unsigned!')
  }
  const hex = integer.toString(16)
  return hex.length % 2 ? `0${hex}` : hex
}

/** Pad a string to be even */
function padToEven(a: string): string {
  return a.length % 2 ? `0${a}` : a
}

/** Transform an integer into a Uint8Array */
function intToUint8Array(integer: number | bigint): Uint8Array {
  const hex = intToHex(integer)
  return hexToBytes(hex)
}

/** Transform anything into a Uint8Array */
function toUint8Array(v: Input): Uint8Array {
  if (!(v instanceof Uint8Array)) {
    if (typeof v === 'string') {
      if (isHexPrefixed(v)) {
        return hexToBytes(padToEven(stripHexPrefix(v)))
      } else {
        throw new Error('NOT IMPLEMENTED 2')
        // return Uint8Array.from(v)
      }
    } else if (typeof v === 'number' || typeof v === 'bigint') {
      if (!v) {
        return Uint8Array.from([])
      } else {
        return intToUint8Array(v)
      }
    } else if (v === null || v === undefined) {
      return Uint8Array.from([])
    } else if (v === true || v === false) {
      return hexToBytes('000000000000000000000000000000000000000000000000000000000000000' + (v ? '1' : '0'))
    } else if (v instanceof Uint8Array) {
      return Uint8Array.from(v as any)
    } else if (BigNumber.isBigNumber(v)) {
      // converts a BN to a Uint8Array
      // return Uint8Array.from(v.toArray())
      throw new Error('NOT IMPLEMENTED 1')
    } else {
      throw new Error('toUint8Array: invalid type for value ' + JSON.stringify(v))
    }
  }
  return v
}
