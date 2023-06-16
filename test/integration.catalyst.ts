import 'isomorphic-fetch'
import expect from 'expect'
import { RequestManager, ContractFactory } from '../dist/eth-connect'
import { abi, bytecode } from './fixtures/Catalyst.json'

export function doCatalystTest(requestManager: RequestManager) {
  it('should unlock the account', async () => {
    const accounts = await requestManager.eth_accounts()
    const account = accounts[0]
    const accountUnlocked = await requestManager.personal_unlockAccount(account, '', 300)
    console.log(`> Unlocking account status=${accountUnlocked}`)
    expect(accountUnlocked).toEqual(true)
  })

  let CatalystContract = null

  it('deploys a new contract', async function () {
    this.timeout(100000)
    const accounts = await requestManager.eth_accounts()
    const account = accounts[0]

    console.log(`> Account: ${account}`)
    const factory = new ContractFactory(requestManager, abi)
    CatalystContract = await factory.deploy({ data: bytecode, from: account, to: null })

    console.log(`> Tx: ${CatalystContract.transactionHash}`)
  })

  it('getCatalyst uint8array(32)', async function () {
    const t = await CatalystContract.catalystById(new Uint8Array(32))
    console.log('getCatalyst => ', t)
  })

  it('getCatalyst 0x0{64}', async function () {
    const t = await CatalystContract.catalystById('0x0000000000000000000000000000000000000000000000000000000000000000')
    console.log('getCatalyst => ', t)
  })

  it('getCatalyst 0x0 should fail', async function () {
    await expect(() => CatalystContract.catalystById('0x0')).rejects.toThrow()
  })

  it('getCatalyst 0x00 should not fail', async function () {
    await CatalystContract.catalystById('0x00')
  })
}
