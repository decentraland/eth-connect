import expect from 'expect'

import { RequestManager } from '../src'
import { FakeHttpProvider } from './helpers/FakeHttpProvider'

let tests = [
  {
    input: {
      from: '00c5496aee77c1ba1f0854206a26dda82a81d6d8',
      to: '00c5496aee77c1ba1f0854206a26dda82a81d6d8'
    },
    formattedInput: {
      from: '0x00c5496aee77c1ba1f0854206a26dda82a81d6d8',
      to: '0x00c5496aee77c1ba1f0854206a26dda82a81d6d8'
    },
    result: '0xb',
    formattedResult: '0xb',
    call: 'eth_sendTransaction'
  }
]

describe('async', function () {
  tests.forEach(function (test, index) {
    it('test: ' + index, async function () {
      // given
      const provider = new FakeHttpProvider()

      provider.injectValidation(async (payload) => {
        expect(payload.jsonrpc).toEqual('2.0')
        expect(payload.method).toEqual(test.call)
        expect(payload.params).toEqual([test.formattedInput])
        provider.injectResult(test.result)
      })

      const rm = new RequestManager(provider)

      // when
      const result = await rm.eth_sendTransaction(test.input as any)

      expect(test.formattedResult).toStrictEqual(result)
    })

    it('error test: ' + index, async function () {
      // given
      const provider = new FakeHttpProvider()

      provider.injectValidation(async (payload) => {
        expect(payload.jsonrpc).toEqual('2.0')
        expect(payload.method).toEqual(test.call)
        expect(payload.params).toEqual([test.formattedInput])

        provider.injectError({
          message: test.result,
          code: -32603
        })
      })

      const rm = new RequestManager(provider)

      // when
      try {
        await rm.eth_sendTransaction(test.input as any)
      } catch (error) {
        expect(test.formattedResult).toStrictEqual(error.message)
      }
    })
  })
})
