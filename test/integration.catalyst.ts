import 'isomorphic-fetch'
import * as expect from 'expect'
import { ContractFactory, RequestManager, RPCSendableMessage } from '../src'
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
    console.log('normal output', await CatalystContract.catalystById('0x00'))
  })

  it('batch call should not fail', async function () {
    const batch: RPCSendableMessage[] = [
      CatalystContract.catalystById.toEthCall('0x00'),
      CatalystContract.catalystById.toEthCall('0x00', 'latest')
    ]

    const output = await requestManager.sendBatchAsync(batch)
    console.log(
      'batch output',
      output.map((r: any) => CatalystContract.catalystById.unpackOutput(r))
    )
  })
}
