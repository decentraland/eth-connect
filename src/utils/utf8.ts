import { hexToBytes } from './utils'

/**
 * Converts a string into a Uint8Array encoded with UTF-8
 * @public
 */
export function stringToUtf8Bytes(str: string): Uint8Array {
  return new TextEncoder().encode(str)
}

/**
 * Decodes an Uint8Array or hex string into a UTF-8 string
 * @public
 */
export function bytesToUtf8String(bytesOrHexString: Uint8Array | string): string {
  if (typeof bytesOrHexString === 'string') {
    return bytesToUtf8String(hexToBytes(bytesOrHexString))
  }
  return new TextDecoder().decode(bytesOrHexString)
}
