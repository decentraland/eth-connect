import { hexToBytes } from './utils'

export function toUtf8Bytes(str: string): Uint8Array {
  return new TextEncoder().encode(str)
}

export function toUtf8String(bytesOrHexString: Uint8Array | string): string {
  if (typeof bytesOrHexString == 'string') {
    return toUtf8String(hexToBytes(bytesOrHexString))
  }
  return new TextDecoder().decode(bytesOrHexString)
}
