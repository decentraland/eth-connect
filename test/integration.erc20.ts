import chai = require('chai')
import 'isomorphic-fetch'
// tslint:disable

const expect = chai.expect

import { ContractFactory, RequestManager } from '../dist'
import BigNumber from 'bignumber.js'
import { testAllProviders } from './helpers/testAllProviders'

declare var require

describe('integration.erc20', function() {
  testAllProviders(doTest)
})

function doTest(requestManager: RequestManager) {
  it('should get the network', async () => {
    // this should not fail, that's all
    await requestManager.net_version()
  })

  it('should get the balance', async () => {
    const coinbase = await requestManager.eth_coinbase()
    console.log(`> Coinbase`, coinbase)
    const accounts = await requestManager.eth_accounts()
    const account = accounts[0]
    const balance = await requestManager.eth_getBalance(account, 'latest')
    console.log(`> Balance ${balance}`)
    expect(balance.toNumber()).to.gt(0)
  })

  it('should unlock the account', async () => {
    const accounts = await requestManager.eth_accounts()
    const account = accounts[0]
    const accountUnlocked = await requestManager.personal_unlockAccount(account, '', 300)
    console.log(`> Unlocking account status=${accountUnlocked}`)
    // tslint:disable-next-line:no-unused-expression
    expect(accountUnlocked).to.be.true
  })

  // let manaAddress = '0x0'

  let ERC20Contract = null

  it('deploys a new contract', async function() {
    this.timeout(100000)
    const accounts = await requestManager.eth_accounts()
    const account = accounts[0]

    const abi = require('./fixtures/ERC20.json').abi
    const bytecode = require('./fixtures/ERC20.json').bytecode

    const factory = new ContractFactory(requestManager, abi)
    ERC20Contract = await factory.deploy({ data: bytecode, from: account, to: null })

    console.log(`> Tx: ${ERC20Contract.transactionHash}`)

    // manaAddress = txRecipt.contractAddress
  })

  it('gets the receipt', async () => {
    const txRecipt = await requestManager.eth_getTransactionReceipt(ERC20Contract.transactionHash)

    expect(typeof txRecipt.contractAddress).to.eq('string')
    expect(txRecipt.contractAddress.length).to.be.greaterThan(0)
    expect(typeof txRecipt.transactionIndex).to.eq('number')
    expect(typeof txRecipt.transactionHash).to.eq('string')
    expect(typeof txRecipt.blockHash).to.eq('string')
    expect(typeof txRecipt.blockNumber).to.eq('number')
    expect(typeof txRecipt.contractAddress).to.eq('string')
    expect(typeof txRecipt.cumulativeGasUsed).to.eq('number')
    expect(typeof txRecipt.gasUsed).to.eq('number')
    expect(typeof txRecipt.status).to.eq('number')
  })

  it('gets the trasaction', async () => {
    const x = await requestManager.eth_getTransactionByHash(ERC20Contract.transactionHash)
    expect(typeof x).eq('object')
    expect(x.hash).eq(ERC20Contract.transactionHash)
    expect(x.gasPrice instanceof BigNumber).to.eq(true)
    expect(x.value instanceof BigNumber).to.eq(true)
    expect(typeof x.gas).to.eq('number')
    expect(typeof x.blockNumber).to.eq('number')
    expect(typeof x.blockHash).to.eq('string')
    expect(typeof x.hash).to.eq('string')
    expect(typeof x.transactionIndex).to.eq('number')
  })

  it('should get 0 mana balance by default', async () => {
    {
      const account = (await requestManager.eth_accounts())[0]

      const balance = await ERC20Contract.balanceOf(account)

      expect(balance.toString()).eq('0')
      expect(balance instanceof BigNumber).eq(true)
    }
    {
      const balance = await ERC20Contract.balanceOf('0x0')
      expect(balance.toString()).eq('0')
    }
  })

  it('should work with injected methods from ABI', async function() {
    this.timeout(1000000)
    const account = (await requestManager.eth_accounts())[0]
    {
      const mintingFinished = ERC20Contract.mintingFinished()
      expect('then' in mintingFinished).eq(true, 'The injected methods should be thenable')

      const result = await mintingFinished
      expect(typeof result).eq('boolean', 'mintingFinished should return a boolean')
    }
    {
      const totalSupply = await ERC20Contract.totalSupply()
      expect(totalSupply.toNumber()).eq(0)
    }
    {
      const mintResult = await ERC20Contract.mint(account, 10, { from: account })
      expect(typeof mintResult).eq('string')
      const tx = await requestManager.getConfirmedTransaction(mintResult)
      expect(tx.status).to.eq('confirmed')
      expect(typeof tx.receipt).to.eq('object')
      expect(tx.receipt.status).to.eq(1)
    }
    {
      const mintResult = await ERC20Contract.mint(account, 10, { from: account })
      expect(typeof mintResult).eq('string')
      await requestManager.waitForCompletion(mintResult)
    }
    {
      const totalSupply = await ERC20Contract.totalSupply()
      expect(totalSupply.toNumber()).eq(20)
    }
  })
}
