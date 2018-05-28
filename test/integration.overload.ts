import chai = require('chai')
// tslint:disable

const expect = chai.expect

import { ContractFactory, RequestManager } from '../dist'
import { testAllProviders } from './helpers/testAllProviders'

/*

  pragma solidity ^0.4.20;

  contract OverloadTest {
    function test() pure public returns(uint256 d) {
      d = 1;
    }

    function test(uint256 _a) pure public returns(uint256 d) {
      d = _a;
    }

    function test(uint256 _aa, uint256 _bb) pure public returns(uint256 d) {
      d = _aa + _bb;
    }
  }

*/

const contract = {
  bytecode:
    '608060405234801561001057600080fd5b5061015f806100206000396000f300608060405260043610610057576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff16806329e99f071461005c578063eb8ac9211461009d578063f8a8fd6d146100e8575b600080fd5b34801561006857600080fd5b5061008760048036038101908080359060200190929190505050610113565b6040518082815260200191505060405180910390f35b3480156100a957600080fd5b506100d2600480360381019080803590602001909291908035906020019092919050505061011d565b6040518082815260200191505060405180910390f35b3480156100f457600080fd5b506100fd61012a565b6040518082815260200191505060405180910390f35b6000819050919050565b6000818301905092915050565b600060019050905600a165627a7a72305820953de19bbb769ef842170abcc6f068de2aee7051889799e56c88cabe03d481b60029',
  abi: [
    {
      constant: true,
      inputs: [
        {
          name: '_a',
          type: 'uint256'
        }
      ],
      name: 'test',
      outputs: [
        {
          name: 'd',
          type: 'uint256'
        }
      ],
      payable: false,
      stateMutability: 'pure',
      type: 'function'
    },
    {
      constant: true,
      inputs: [
        {
          name: '_aa',
          type: 'uint256'
        },
        {
          name: '_bb',
          type: 'uint256'
        }
      ],
      name: 'test',
      outputs: [
        {
          name: 'd',
          type: 'uint256'
        }
      ],
      payable: false,
      stateMutability: 'pure',
      type: 'function'
    },
    {
      constant: true,
      inputs: [],
      name: 'test',
      outputs: [
        {
          name: 'd',
          type: 'uint256'
        }
      ],
      payable: false,
      stateMutability: 'pure',
      type: 'function'
    }
  ]
}

describe('integration.overload', function() {
  testAllProviders(doTest)
})

function doTest(requestManager: RequestManager) {
  it('should get the addresses', async () => {
    const accounts = await requestManager.eth_accounts()
    const account = accounts[0]

    console.log(`> Using account ${account}`)
    // tslint:disable-next-line:no-unused-expression
    expect(account).to.be.string
    expect(account.length).to.gt(0)
  })

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

  let TestContract = null

  it('deploys a new contract', async function() {
    this.timeout(100000)
    const accounts = await requestManager.eth_accounts()
    const account = accounts[0]

    const factory = new ContractFactory(requestManager, contract.abi)
    TestContract = await factory.deploy({ data: contract.bytecode, from: account, to: null })

    console.log(`> Tx: ${TestContract.transactionHash}`)
  })

  it('gets the receipt', async () => {
    const txRecipt = await requestManager.eth_getTransactionReceipt(TestContract.transactionHash)

    expect(typeof txRecipt.contractAddress).to.eq('string')
    expect(txRecipt.contractAddress.length).to.be.greaterThan(0)
  })

  it('gets the trasaction', async () => {
    const x = await requestManager.eth_getTransactionByHash(TestContract.transactionHash)
    expect(typeof x).eq('object')
    expect(x.hash).eq(TestContract.transactionHash)
  })

  it('test() == 1', async () => {
    const balance = await TestContract.test.void()
    expect(balance.toString()).eq('1')
  })

  it('test(uint256) == 222', async () => {
    const balance = await TestContract.test.uint256(222)
    expect(balance.toString()).eq('222')
  })

  it('test(uint256,uint256) == 333', async () => {
    const balance = await TestContract.test['uint256,uint256'](222, 111)
    expect(balance.toString()).eq('333')
  })
}
