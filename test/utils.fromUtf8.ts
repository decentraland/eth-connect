import expect from 'expect'
import { stringToUtf8Bytes } from '../src/utils/utf8'
import * as utils from '../src/utils/utils'

let tests = [
  { value: 'myString', expected: '6d79537472696e67' },
  { value: 'myString\x00', expected: '6d79537472696e6700' },
  {
    value: '我能吞下玻璃而不伤身体。',
    expected: 'e68891e883bde5909ee4b88be78ebbe79283e8808ce4b88de4bca4e8baabe4bd93e38082'
  },
  {
    value: '나는 유리를 먹을 수 있어요. 그래도 아프지 않아요',
    expected:
      'eb8298eb8a9420ec9ca0eba6aceba5bc20eba8b9ec9d8420ec889820ec9e88ec96b4ec9a942e20eab7b8eb9e98eb8f8420ec9584ed9484eca78020ec958aec9584ec9a94'
  },
  { value: 'expected value\u0000\u0000\u0000', expected: '65787065637465642076616c7565000000' }
]

describe('lib/utils/utils', function () {
  describe('fromUtf8', function () {
    tests.forEach(function (tests) {
      it('should turn ' + tests.value + ' to ' + tests.expected, function () {
        expect(utils.bytesToHex(stringToUtf8Bytes(tests.value))).toEqual(tests.expected)
      })
    })
  })
})
