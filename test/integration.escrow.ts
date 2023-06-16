import 'isomorphic-fetch'
import expect from 'expect'
import { RequestManager, ContractFactory, BigNumber } from '../dist/eth-connect'
import { abi, bytecode } from './fixtures/Escrow.json'

export function doEscrowTest(requestManager: RequestManager) {
  it('should unlock the account', async () => {
    const accounts = await requestManager.eth_accounts()
    const account = accounts[0]
    const accountUnlocked = await requestManager.personal_unlockAccount(account, '', 300)
    console.log(`> Unlocking account status=${accountUnlocked}`)
    expect(accountUnlocked).toEqual(true)
  })

  let EscrowContract = null

  it('deploys a new contract', async function () {
    this.timeout(100000)
    const accounts = await requestManager.eth_accounts()
    const account = accounts[0]

    console.log(`> Account: ${account}`)
    const factory = new ContractFactory(requestManager, abi)
    EscrowContract = await factory.deploy({ data: bytecode, from: account, to: null })

    console.log(`> Tx: ${EscrowContract.transactionHash}`)
  })

  it('deposit', async function () {
    this.timeout(1000000)
    const account = (await requestManager.eth_accounts())[0]
    const depositResult = await EscrowContract.deposit(account, { from: account, value: 123 })
    const tx = await requestManager.getConfirmedTransaction(depositResult)
    expect(tx.status).toEqual('confirmed')
    expect(typeof tx.receipt).toEqual('object')
    expect(tx.receipt.status).toEqual(1)
    const deposits = await EscrowContract.depositsOf(account, { from: account })
    expect(deposits).toBeInstanceOf(BigNumber)
    expect((deposits as BigNumber).eq(123)).toEqual(true)
  })
}
