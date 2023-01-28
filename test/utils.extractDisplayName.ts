import expect from 'expect'
import * as utils from '../src/utils/utils'

describe('lib/utils/utils', function () {
  describe('extractDisplayName', function () {
    it('should extract display name from method with no params', function () {
      // given
      let tests = 'helloworld()'

      // when
      let displayName = utils.extractDisplayName(tests)

      // then
      expect(displayName).toEqual('helloworld')
    })

    it('should extract display name from method with one param', function () {
      // given
      let tests = 'helloworld1(int)'

      // when
      let displayName = utils.extractDisplayName(tests)

      // then
      expect(displayName).toEqual('helloworld1')
    })

    it('should extract display name from method with two params', function () {
      // given
      let tests = 'helloworld2(int,string)'

      // when
      let displayName = utils.extractDisplayName(tests)

      // then
      expect(displayName).toEqual('helloworld2')
    })
  })
})
