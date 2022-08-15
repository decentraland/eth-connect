import * as expect from 'expect'
import * as utf8 from '../src/utils/utf8'

describe('lib/utils/utf8', function () {
  describe('stringToUtf8Bytes', function () {
    it('should encode str as Uint8Array', function () {
      // given
      let test = 'helloworld'
      let expected = new Uint8Array([
        104, 101, 108, 108,
        111, 119, 111, 114,
        108, 100
      ])

      // when
      let encoded = utf8.stringToUtf8Bytes(test)

      // then
      expect(encoded).toEqual(expected)
    })
  })

  describe('stringToUtf8Bytes', function () {

    it('should decode Uint8Array as str', function () {
      // given
      let test = new Uint8Array([
        104, 101, 108, 108,
        111, 119, 111, 114,
        108, 100
      ])
      let expected = 'helloworld'

      // when
      let encoded = utf8.bytesToUtf8String(test)

      // then
      expect(encoded).toEqual(expected)
    })
  })
})
