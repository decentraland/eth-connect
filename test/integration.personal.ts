import 'isomorphic-fetch'
import { RequestManager, isStrictAddress, isArray } from '../dist/eth-connect'
import { WebSocketProvider } from '../src/providers/WebSocketProvider'

export function doPersonalTest(requestManager: RequestManager) {
  let account = null

  it('should create an account', async function () {
    // this should not fail, that's all
    account = await requestManager.personal_newAccount('test')
    expect(isStrictAddress(account)).toEqual(true) // 'is strict address'
  })

  it('should get the list of accounts', async () => {
    // this should not fail, that's all
    let accounts = await requestManager.personal_listAccounts()
    expect(isArray(accounts)).toEqual(true) // 'returns an array of accounts'
    expect(accounts.length).toBeGreaterThan(0) // 'has accounts'
    expect(accounts.map((s) => s.toLowerCase())).toContain(account.toLowerCase()) // 'has our created account'
  })

  it('should sign a message (geth only) and recover the signer address', async () => {
    if (requestManager.provider instanceof WebSocketProvider /* test in geth node only */) {
      const message = '0xad1231'
      const signature = await requestManager.personal_sign(message, account, 'test')
      const signerAddress = await requestManager.personal_ecRecover(message, signature)
      expect(signerAddress.toLowerCase()).toEqual(account.toLowerCase())
    }
  })

  it('should sign a string message (geth only)', async () => {
    if (requestManager.provider instanceof WebSocketProvider /* test in geth node only */) {
      const message = 'TEST MESSAGE'
      await requestManager.personal_sign(message, account, 'test')
    }
  })

  it('should sign a string message (geth only) and recover the signer address', async () => {
    if (requestManager.provider instanceof WebSocketProvider /* test in geth node only */) {
      const message = 'TEST MESSAGE'
      const signature = await requestManager.personal_sign(message, account, 'test')
      const signerAddress = await requestManager.personal_ecRecover(message, signature)
      expect(signerAddress.toLowerCase()).toEqual(account.toLowerCase())
    }
  })

  it('should sign a Uint8Array message (geth only) and recover the signer address', async () => {
    if (requestManager.provider instanceof WebSocketProvider /* test in geth node only */) {
      const message = new Uint8Array([14, 15, 99]) as any
      const signature = await requestManager.personal_sign(message, account, 'test')
      const signerAddress = await requestManager.personal_ecRecover(message, signature)
      expect(signerAddress.toLowerCase()).toEqual(account.toLowerCase())
    }
  })

  it('should unlock the account', async () => {
    const unlocked = await requestManager.personal_unlockAccount(account, 'test')
    expect(unlocked).toEqual(true) // 'must unlock'
  })

  it('should lock the account', async () => {
    const unlocked = await requestManager.personal_lockAccount(account)
    expect(unlocked).toEqual(true) // 'must lock'
  })
}
