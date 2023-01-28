import expect from 'expect'

import { RequestManager } from '../src'
import { FakeHttpProvider } from './helpers/FakeHttpProvider'

let tests = [
  {
    input: {
      from: '00c5496aee77c1ba1f0854206a26dda82a81d6d8',
      to: '00c5496aee77c1ba1f0854206a26dda82a81d6d8',
    },
    formattedInput: {
      from: '0x00c5496aee77c1ba1f0854206a26dda82a81d6d8',
      to: '0x00c5496aee77c1ba1f0854206a26dda82a81d6d8',
    },
    result: '0xb',
    formattedResult: '0xb',
    call: 'eth_sendTransaction',
  },
]

describe('async', function () {
  tests.forEach(function (tests, index) {
    it('tests: ' + index, async function () {
      // given
      const provider = new FakeHttpProvider()

      provider.injectValidation(async (payload) => {
        expect(payload.jsonrpc).toEqual('2.0')
        expect(payload.method).toEqual(tests.call)
        expect(payload.params).toEqual([tests.formattedInput])
        provider.injectResult(tests.result)
      })

      const rm = new RequestManager(provider)

      // when
      const result = await rm.eth_sendTransaction(tests.input as any)

      expect(tests.formattedResult).toStrictEqual(result)
    })

    it('error tests: ' + index, async function () {
      // given
      const provider = new FakeHttpProvider()

      provider.injectValidation(async (payload) => {
        expect(payload.jsonrpc).toEqual('2.0')
        expect(payload.method).toEqual(tests.call)
        expect(payload.params).toEqual([tests.formattedInput])

        provider.injectError({
          message: tests.result,
          code: -32603,
        })
      })

      const rm = new RequestManager(provider)

      // when
      try {
        await rm.eth_sendTransaction(tests.input as any)
      } catch (error) {
        expect(tests.formattedResult).toStrictEqual(error.message)
      }
    })
  })
})
