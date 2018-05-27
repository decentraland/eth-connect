import chai = require('chai')
// tslint:disable

const expect = chai.expect

import { NodeConnectionFactory } from './helpers/NodeConnectionFactory'
import { ContractFactory, RequestManager } from '../dist'
import { future } from '../dist/utils/future'
import BigNumber from 'bignumber.js'
declare var require

describe('integration.erc20', function() {
  const nodeConnectionFactory = new NodeConnectionFactory()
  const rm = new RequestManager(nodeConnectionFactory.createProvider())
  rm.debug = false

  it('should return no instantiated contracts', async () => {
    try {
      await new ContractFactory(rm, []).at('')
      throw new Error('x')
    } catch (e) {
      if (e.message == 'x') throw new Error("The test didn't fail")
    }
  })

  describe('ETH using provider', function() {
    doTest(rm)
  })
})

function doTest(requestManager: RequestManager) {
  it('should get the network', async () => {
    // this should not fail, that's all
    await requestManager.net_version()
  })

  it('should get the balance', async () => {
    const coinbase = await requestManager.eth_coinbase()
    console.log(`> Coinbase`, coinbase)
    const balance = await requestManager.eth_getBalance(coinbase, 'latest')
    console.log(`> Balance ${balance}`)
    expect(balance.toString()).to.eq('100012300001')
  })

  it('should unlock the account', async () => {
    const accounts = await requestManager.eth_accounts()
    const account = accounts[0]
    const accountUnlocked = await requestManager.personal_unlockAccount(account)
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
  })

  it('gets the trasaction', async () => {
    const x = await requestManager.eth_getTransactionByHash(ERC20Contract.transactionHash)
    expect(typeof x).eq('object')
    expect(x.hash).eq(ERC20Contract.transactionHash)
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

  it('should fail by pointing to a contract to wrong address', async function() {
    this.timeout(100000)

    const address = '0xebc757b8bfd562158b1bfded4e1cafe332d9845a'
    const fakeMANAFacade: any = await new ContractFactory(requestManager, require('./fixtures/ERC20.json').abi).at(
      address
    )

    const x = future()

    fakeMANAFacade
      .balanceOf(address)
      .then(() => x.reject(new Error('didnt fail')))
      .catch(() => x.resolve(void 0))

    await x
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
    }
    {
      const mintResult = await ERC20Contract.mint(account, 10, { from: account })
      expect(typeof mintResult).eq('string')
    }
    {
      const totalSupply = await ERC20Contract.totalSupply()
      expect(totalSupply.toNumber()).eq(20)
    }
  })
}
