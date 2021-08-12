import 'isomorphic-fetch'
import * as expect from 'expect'
import { ContractFactory, RequestManager } from '../src'
import { testAllProviders } from './helpers/testAllProviders'
import { abi, bytecode } from './fixtures/Catalyst.json'

describe('integration.catalyst', function () {
  testAllProviders(doTest)
})

function doTest(requestManager: RequestManager) {
  it('should get the balance', async () => {
    const coinbase = await requestManager.eth_coinbase()
    console.log(`> Coinbase`, coinbase)
    const accounts = await requestManager.eth_accounts()
    const account = accounts[0]
    const balance = await requestManager.eth_getBalance(account, 'latest')
    console.log(`> Balance ${balance}`)
    expect(balance.toNumber()).toBeGreaterThan(0)
  })

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

  it('getCatalyst', async function () {
    const t = await CatalystContract.catalystById(new Uint8Array(32))
    console.log('getCatalyst => ', t)
  })

}
