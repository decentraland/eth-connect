import 'isomorphic-fetch'
import * as expect from 'expect'
import { ContractFactory, RequestManager, BigNumber } from '../src'
import { testAllProviders } from './helpers/testAllProviders'
import { ConfirmedTransaction, TxHash } from '../src/Schema'
import { testReturnType } from './unit.eth-return-types'
import { abi, bytecode } from './fixtures/ERC20.json'

describe('integration.erc20', function () {
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

  // let manaAddress = '0x0'

  let ERC20Contract = null

  it('deploys a new contract', async function () {
    this.timeout(100000)
    const accounts = await requestManager.eth_accounts()
    const account = accounts[0]

    console.log(`> Account: ${account}`)
    const factory = new ContractFactory(requestManager, abi)
    ERC20Contract = await factory.deploy({ data: bytecode, from: account, to: null })

    console.log(`> Tx: ${ERC20Contract.transactionHash}`)

    // manaAddress = txRecipt.contractAddress
  })

  it('gets the receipt', async () => {
    const txRecipt = await requestManager.eth_getTransactionReceipt(ERC20Contract.transactionHash)

    expect(typeof txRecipt.contractAddress).toEqual('string')
    expect(txRecipt.contractAddress.length).toBeGreaterThan(0)
    expect(typeof txRecipt.transactionIndex).toEqual('number')
    expect(typeof txRecipt.transactionHash).toEqual('string')
    expect(typeof txRecipt.blockHash).toEqual('string')
    expect(typeof txRecipt.blockNumber).toEqual('number')
    expect(typeof txRecipt.contractAddress).toEqual('string')
    expect(typeof txRecipt.cumulativeGasUsed).toEqual('number')
    expect(typeof txRecipt.gasUsed).toEqual('number')
    expect(typeof txRecipt.status).toEqual('number')
  })

  it('gets the trasaction by hash', async () => {
    const x = await requestManager.eth_getTransactionByHash(ERC20Contract.transactionHash)
    expect(typeof x).toEqual('object')
    expect(x.hash).toEqual(ERC20Contract.transactionHash)
    expect(x.gasPrice instanceof BigNumber).toEqual(true)
    expect(x.value instanceof BigNumber).toEqual(true)
    expect(typeof x.gas).toEqual('number')
    expect(typeof x.blockNumber).toEqual('number')
    expect(typeof x.blockHash).toEqual('string')
    expect(typeof x.hash).toEqual('string')
    expect(typeof x.transactionIndex).toEqual('number')
  })

  it('gets the transaction ', async () => {
    const { receipt, ...tx } = (await requestManager.getTransaction(
      ERC20Contract.transactionHash
    )) as ConfirmedTransaction

    const transactionFields = [
      'type',
      'hash',
      'nonce',
      'blockHash',
      'blockNumber',
      'transactionIndex',
      'from',
      'to',
      'value',
      'gas',
      'gasPrice',
      'input'
    ]

    const receiptFields = [
      'transactionHash',
      'transactionIndex',
      'blockHash',
      'blockNumber',
      'gasUsed',
      'cumulativeGasUsed',
      'contractAddress',
      'logs',
      'status',
      'logsBloom'
    ]

    for (let key of transactionFields) {
      expect(tx).toHaveProperty(key)
    }

    for (let key of receiptFields) {
      expect(receipt).toHaveProperty(key)
    }
  })

  it('getTransaction should return null for an unknown transaction', async function () {
    const tx = await requestManager.getTransaction('0xfaceb00cfaceb00cfaceb00cfaceb00cfaceb00cfaceb00cfaceb00cfaceb00c')
    expect(tx).toEqual(null)
  })

  it('should get 0 mana balance by default', async () => {
    {
      const account = (await requestManager.eth_accounts())[0]

      const balance = await ERC20Contract.balanceOf(account)

      expect(balance.toString()).toEqual('0')
      expect(balance instanceof BigNumber).toEqual(true)
    }
    {
      const balance = await ERC20Contract.balanceOf('0x0f5d2fb29fb7d3cfee444a200298f468908c0000')
      expect(balance.toString()).toEqual('0')
    }
  })

  let txHash: TxHash = null

  it('should work with injected methods from ABI', async function () {
    this.timeout(1000000)
    const mintingFinished = ERC20Contract.mintingFinished()
    expect(mintingFinished).toHaveProperty('then')

    const result = await mintingFinished
    console.log(result)
    expect(typeof result).toEqual('string')
  })

  it('total supply must be 0', async () => {
    const totalSupply = await ERC20Contract.totalSupply()
    expect(totalSupply.toNumber()).toEqual(0)
  })

  it('mint 1', async function () {
    this.timeout(1000000)
    const account = (await requestManager.eth_accounts())[0]
    const mintResult = (txHash = await ERC20Contract.mint(account, 10, { from: account }))
    expect(typeof mintResult).toEqual('string')
    const tx = await requestManager.getConfirmedTransaction(mintResult)
    expect(tx.status).toEqual('confirmed')
    expect(typeof tx.receipt).toEqual('object')
    expect(tx.receipt.status).toEqual(1)
  })

  it('total supply 10', async function () {
    this.timeout(1000000)

    const totalSupply = await ERC20Contract.totalSupply()
    expect(totalSupply.toNumber()).toEqual(10)
  })

  it('mint 2', async function () {
    this.timeout(1000000)
    const account = (await requestManager.eth_accounts())[0]
    const mintResult = await ERC20Contract.mint(account, 11, { from: account })
    expect(typeof mintResult).toEqual('string')
    await requestManager.waitForCompletion(mintResult)
  })

  it('total supply 21', async function () {
    this.timeout(1000000)

    const totalSupply = await ERC20Contract.totalSupply()
    expect(totalSupply.toNumber()).toEqual(21)
  })

  it('waits the block', async function () {
    const tx = await requestManager.waitForCompletion(txHash)

    testReturnType(requestManager, 'eth_getBlockTransactionCountByHash', 'number', tx.blockHash)
    testReturnType(requestManager, 'eth_getBlockTransactionCountByNumber', 'number', tx.blockNumber)
  })

  it('test allowance, one argument', async function () {
    this.timeout(30000)
    const accounts = await requestManager.eth_accounts()
    await expect(ERC20Contract.allowance(accounts[0])).rejects.toThrow('Invalid number of arguments')
  })

  it('test allowance, invalid address', async function () {
    this.timeout(30000)
    const accounts = await requestManager.eth_accounts()
    await expect(ERC20Contract.allowance(accounts[0], '0x1')).rejects.toThrow('invalid address (argument=\"address\", value=\"0x1\", code=INVALID_ARGUMENT, version=address/5.1.0) (argument=null, value=\"0x1\", code=INVALID_ARGUMENT, version=abi/5.1.0)')
  })

  it('test allowance', async function () {
    requestManager.provider.debug = true
    this.timeout(30000)
    const accounts = await requestManager.eth_accounts()
    const allowanceAddress = '0x0f5d2fb29fb7d3cfee444a200298f468908cc942'
    {
      console.log(`> allowance(${accounts[0]},${allowanceAddress})`)
      const allowedNumber: BigNumber = await ERC20Contract.allowance(accounts[0], allowanceAddress)
      expect(allowedNumber).toBeInstanceOf(BigNumber)
    }
  })


  it('test for allowance using DG parameters', async function () {
    this.timeout(30000)
    const account = `0x6224fe0bea79701d338cf65ebc0da0caa566c544`
    const allowanceAddress = '0xBF79cE2fbd819e5aBC2327563D02a200255B7Cb3'
    {
      console.log(`> allowance(${account},${allowanceAddress})`)
      const allowedNumber: BigNumber = await ERC20Contract.allowance(account, allowanceAddress)
      expect(allowedNumber).toBeInstanceOf(BigNumber)
    }
    requestManager.provider.debug = false
  })
}
