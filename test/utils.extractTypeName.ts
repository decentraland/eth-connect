import * as expect from 'expect'
import * as utils from '../src/utils/utils'

describe('lib/utils/utils', function () {
  describe('extractTypeName', function () {
    it('should extract type name from method with no params', function () {
      // given
      let test = 'helloworld()'

      // when
      let typeName = utils.extractTypeName(test)

      // then
      expect(typeName).toEqual('')
    })

    it('should extract type name from method with one param', function () {
      // given
      let test = 'helloworld1(int)'

      // when
      let typeName = utils.extractTypeName(test)

      // then
      expect(typeName).toEqual('int')
    })

    it('should extract type name from method with two params', function () {
      // given
      let test = 'helloworld2(int,string)'

      // when
      let typeName = utils.extractTypeName(test)

      // then
      expect(typeName).toEqual('int,string')
    })

    it('should extract type name from method with spaces between params', function () {
      // given
      let test = 'helloworld3(int, string)'

      // when
      let typeName = utils.extractTypeName(test)

      // then
      expect(typeName).toEqual('int,string')
    })
  })
})
