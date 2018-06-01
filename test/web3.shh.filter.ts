import chai = require('chai')

const assert = chai.assert

import { FakeHttpProvider } from './helpers/FakeHttpProvider'
import { RequestManager } from '../src'
import { SHHFilter } from '../src/Filter'

describe('shh.filter', function() {
  it('test shh', async function() {
    // given
    const provider = new FakeHttpProvider()
    const rm = new RequestManager(provider)

    const didCall = provider.injectHandler('shh_newFilter', async payload => {
      assert.deepEqual(payload.params[0], { topics: ['0x32dd4f54', '0x564b4566'] })
      provider.injectResult('0xfaaa1231')
    })

    const didCallUninstall = provider.injectHandler('shh_uninstallFilter', async _ => {
      provider.injectResult(true)
    })

    const didGetChanges = provider.injectHandler('shh_getFilterChanges', async payload => {
      assert(payload.params[0] === '0xfaaa1231', 'verify forwarding filter id')
      provider.injectResult([
        {
          hash: '0x33eb2da77bf3527e28f8bf493650b1879b08c4f2a362beae4ba2f71bafcd91f9',
          from: '0x3ec052fc33..',
          to: '0x87gdf76g8d7fgdfg...',
          expiry: '0x54caa50a', // 1422566666
          sent: '0x54ca9ea2', // 1422565026
          ttl: '0x64', // 100
          topics: ['0x6578616d'],
          payload: '0x7b2274797065223a226d657373616765222c2263686...',
          workProved: '0x0'
        }
      ])
    })

    // call
    const filter = new SHHFilter(rm, { topics: ['0x32dd4f54', '0x564b4566'], test: 'asd' } as any)
    await filter.start()
    await filter.watch(() => void 0)

    await didCall
    await didGetChanges

    await filter.stop()
    await didCallUninstall
  })
})
