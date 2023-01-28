/**
 * @public
 */
export function hexToBytes(hex: string): Uint8Array {
  if (typeof hex != 'string') throw new Error('hexToBytes only accept strings, got: ' + typeof hex)

  if (hex.substring(0, 2) === '0x') {
    return hexToBytes(hex.substring(2))
  }

  const result = new Uint8Array(Math.ceil(hex.length / 2))

  let i = 0
  for (let char = 0; char < hex.length; char += 2) {
    const n = parseInt(hex.substring(char, char + 2), 16)
    if (isNaN(n)) throw new Error('Cannot read hex string:' + JSON.stringify(hex))
    result[i] = n
    i++
  }

  return result
}
