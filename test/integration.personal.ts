import * as chai from 'chai'
import * as expect from 'expect'
import 'isomorphic-fetch'
// tslint:disable

import { RequestManager, isStrictAddress, isArray } from '../src'
import { testAllProviders } from './helpers/testAllProviders'
import { WebSocketProvider } from '../src/providers/WebSocketProvider'

describe('integration.personal', function() {
  testAllProviders(doTest)
})

function doTest(requestManager: RequestManager) {
  let account = null

  it('should create an account', async () => {
    // this should not fail, that's all
    account = await requestManager.personal_newAccount('test')
    chai.assert(isStrictAddress(account), 'is strict address')
  })

  it('should get the list of accounts', async () => {
    // this should not fail, that's all
    let accounts = await requestManager.personal_listAccounts()
    chai.assert(isArray(accounts), 'returns an array of accounts')
    chai.assert(accounts.length > 0, 'has accounts')
    chai.assert(accounts.includes(account), 'has our created account')
  })

  it('should sign a message (geth only) and recover the signer address', async () => {
    if (requestManager.provider instanceof WebSocketProvider /* test in geth node only */) {
      const message = '0xad1231'
      const signature = await requestManager.personal_sign(message, account, 'test')
      const signerAddress = await requestManager.personal_ecRecover(message, signature)
      expect(signerAddress).toEqual(account)
    }
  })

  it('should unlock the account', async () => {
    const unlocked = await requestManager.personal_unlockAccount(account, 'test')
    chai.assert(unlocked, 'must unlock')
  })

  it('should lock the account', async () => {
    const unlocked = await requestManager.personal_lockAccount(account)
    chai.assert(unlocked, 'must lock')
  })
}
