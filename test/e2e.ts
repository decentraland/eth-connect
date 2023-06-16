import 'isomorphic-fetch'
import * as EthConnect from '../dist/eth-connect'
import { createGanacheProvider } from './helpers/ganache'
import { abi, bytecode } from './fixtures/ERC20.json'

describe('e2e.erc20', function () {
  const provider = createGanacheProvider()

  before(async () => {
    await provider.initialize()
  })

  doTest(new EthConnect.RequestManager(provider))
})

function doTest(requestManager: EthConnect.RequestManager) {
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

  let ERC20Contract = null

  it('deploys a new contract', async function () {
    this.timeout(100000)
    const accounts = await requestManager.eth_accounts()
    const account = accounts[0]

    const factory = new EthConnect.ContractFactory(requestManager, abi)
    ERC20Contract = await factory.deploy({ data: bytecode, from: account, to: null })

    console.log(`> Tx: ${ERC20Contract.transactionHash}`)
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
    console.log(x.gasPrice)
    expect(EthConnect.isBigNumber(x.gasPrice)).toEqual(true)
    expect(EthConnect.isBigNumber(x.value)).toEqual(true)
    expect(typeof x.gas).toEqual('number')
    expect(typeof x.blockNumber).toEqual('number')
    expect(typeof x.blockHash).toEqual('string')
    expect(typeof x.hash).toEqual('string')
    expect(typeof x.transactionIndex).toEqual('number')
  })

  it('gets the transaction ', async () => {
    const { receipt, ...tx } = (await requestManager.getTransaction(ERC20Contract.transactionHash)) as any

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

    for (let i = 0; i < transactionFields.length; i++) {
      const key = transactionFields[i]
      expect(tx[key]).toBeDefined()
      expect(tx[key]).not.toEqual('undefined')
    }

    for (let i = 0; i < receiptFields.length; i++) {
      const key = receiptFields[i]
      expect(receipt[key]).toBeDefined()
      expect(receipt[key]).not.toEqual('undefined')
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
      expect(EthConnect.isBigNumber(balance)).toEqual(true)
    }
    {
      const balance = await ERC20Contract.balanceOf('0x0000000000000000000000000000000000000001')
      expect(balance.toString()).toEqual('0')
    }
    {
      const balance = await ERC20Contract.balanceOf('0000000000000000000000000000000000000001')
      expect(balance.toString()).toEqual('0')
    }
  })

  it('should work with injected methods from ABI', async function () {
    this.timeout(1000000)
    const mintingFinished = ERC20Contract.mintingFinished()
    expect(mintingFinished).toHaveProperty('then')

    const result = await mintingFinished
    expect(typeof result).toEqual('boolean')
  })

  it('total supply 0', async function () {
    this.timeout(1000000)
    const totalSupply = await ERC20Contract.totalSupply()
    expect(totalSupply.toNumber()).toEqual(0)
  })

  it('mint 10', async function () {
    this.timeout(1000000)
    const account = (await requestManager.eth_accounts())[0]
    const mintResult = await ERC20Contract.mint(account, 10, { from: account })
    expect(typeof mintResult).toEqual('string')
    const tx = await requestManager.getConfirmedTransaction(mintResult)
    expect(tx.status).toEqual('confirmed')
    expect(typeof tx.receipt).toEqual('object')
    expect(tx.receipt.status).toEqual(1)
  })

  it('mint 11', async function () {
    this.timeout(1000000)
    const account = (await requestManager.eth_accounts())[0]
    const mintResult = await ERC20Contract.mint(account, 11, { from: account })
    expect(typeof mintResult).toEqual('string')
    await requestManager.waitForCompletion(mintResult)
  })

  it('balanceof 2', async function () {
    this.timeout(1000000)
    const account = (await requestManager.eth_accounts())[0]
    const mintResult = await ERC20Contract.balanceOf(account)
    expect(mintResult).toEqual(EthConnect.toBigNumber(21))
  })

  it('total supply 21', async function () {
    this.timeout(1000000)
    const totalSupply = await ERC20Contract.totalSupply()
    expect(totalSupply.toNumber()).toEqual(21)
  })
}
