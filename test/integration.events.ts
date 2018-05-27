import chai = require('chai')
// tslint:disable

const expect = chai.expect

import { NodeConnectionFactory } from './helpers/NodeConnectionFactory'
import { ContractFactory, RequestManager } from '../dist'
import { EthFilter } from '../dist/Filter'

/*
pragma solidity ^0.4.21;

contract Coursetro {
  string fName;
  uint age;

  event Instructor(string name, uint age);

  function setInstructor(string _fName, uint _age) public {
    fName = _fName;
    age = _age;
  }

  function setInstructorEvent(string _fName, uint _age) public {
    fName = _fName;
    age = _age;
    emit Instructor(fName, age);
  }

  function getInstructor() view public returns (string, uint) {
    return (fName, age);
  }
}

*/

const contract = {
  bytecode:
    '608060405234801561001057600080fd5b5061045e806100206000396000f300608060405260043610610057576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff168063053c0edf1461005c57806322faf03a146100cf5780633c1b81a514610142575b600080fd5b34801561006857600080fd5b506100cd600480360381019080803590602001908201803590602001908080601f0160208091040260200160405190810160405280939291908181526020018383808284378201915050505050509192919290803590602001909291905050506101d9565b005b3480156100db57600080fd5b50610140600480360381019080803590602001908201803590602001908080601f0160208091040260200160405190810160405280939291908181526020018383808284378201915050505050509192919290803590602001909291905050506102bf565b005b34801561014e57600080fd5b506101576102e1565b6040518080602001838152602001828103825284818151815260200191508051906020019080838360005b8381101561019d578082015181840152602081019050610182565b50505050905090810190601f1680156101ca5780820380516001836020036101000a031916815260200191505b50935050505060405180910390f35b81600090805190602001906101ef92919061038d565b50806001819055507f010becc10ca1475887c4ec429def1ccc2e9ea1713fe8b0d4e9a1d009042f6b8e600060015460405180806020018381526020018281038252848181546001816001161561010002031660029004815260200191508054600181600116156101000203166002900480156102ac5780601f10610281576101008083540402835291602001916102ac565b820191906000526020600020905b81548152906001019060200180831161028f57829003601f168201915b5050935050505060405180910390a15050565b81600090805190602001906102d592919061038d565b50806001819055505050565b6060600080600154818054600181600116156101000203166002900480601f01602080910402602001604051908101604052809291908181526020018280546001816001161561010002031660029004801561037e5780601f106103535761010080835404028352916020019161037e565b820191906000526020600020905b81548152906001019060200180831161036157829003601f168201915b50505050509150915091509091565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f106103ce57805160ff19168380011785556103fc565b828001600101855582156103fc579182015b828111156103fb5782518255916020019190600101906103e0565b5b509050610409919061040d565b5090565b61042f91905b8082111561042b576000816000905550600101610413565b5090565b905600a165627a7a7230582078e6eacc2bb6ec9820b3bc32e958a7ae80b1b8091f46900f30eb68819b670ad00029',
  abi: [
    {
      constant: false,
      inputs: [
        {
          name: '_fName',
          type: 'string'
        },
        {
          name: '_age',
          type: 'uint256'
        }
      ],
      name: 'setInstructorEvent',
      outputs: [],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'function'
    },
    {
      constant: false,
      inputs: [
        {
          name: '_fName',
          type: 'string'
        },
        {
          name: '_age',
          type: 'uint256'
        }
      ],
      name: 'setInstructor',
      outputs: [],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'function'
    },
    {
      constant: true,
      inputs: [],
      name: 'getInstructor',
      outputs: [
        {
          name: '',
          type: 'string'
        },
        {
          name: '',
          type: 'uint256'
        }
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function'
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          name: 'name',
          type: 'string'
        },
        {
          indexed: false,
          name: 'age',
          type: 'uint256'
        }
      ],
      name: 'Instructor',
      type: 'event'
    }
  ]
}

describe('integration.events', function() {
  const nodeConnectionFactory = new NodeConnectionFactory()
  const rm = new RequestManager(nodeConnectionFactory.createProvider())

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

function doTest(rm: RequestManager) {
  it('should get the addresses', async () => {
    const accounts = await rm.eth_accounts()
    const account = accounts[0]

    console.log(`> Using account ${account}`)
    // tslint:disable-next-line:no-unused-expression
    expect(account).to.be.string
    expect(account.length).to.gt(0)
  })

  it('should unlock the account', async () => {
    const accounts = await rm.eth_accounts()
    const account = accounts[0]
    const accountUnlocked = await rm.personal_unlockAccount(account)
    console.log(`> Unlocking account status=${accountUnlocked}`)
    // tslint:disable-next-line:no-unused-expression
    expect(accountUnlocked).to.be.true
  })

  let TestContract = null
  let ethFilter: EthFilter = null
  let messages = []

  it('creates the filters', async () => {
    ethFilter = new EthFilter(rm, { fromBlock: 0 })
    await ethFilter.watch($ => {
      console.dir($)
      messages.push($)
    })
    await ethFilter.stop()
  })

  it('deploys a new contract', async function() {
    this.timeout(100000)
    const accounts = await rm.eth_accounts()
    const account = accounts[0]

    const factory = new ContractFactory(rm, contract.abi)
    TestContract = await factory.deploy({ data: contract.bytecode, from: account, to: null })

    console.log(`> Tx: ${TestContract.transactionHash}`)
  })

  it('gets the receipt', async () => {
    const txRecipt = await rm.eth_getTransactionReceipt(TestContract.transactionHash)

    expect(typeof txRecipt.contractAddress).to.eq('string')
    expect(txRecipt.contractAddress.length).to.be.greaterThan(0)
  })

  it('gets the trasaction', async () => {
    const x = await rm.eth_getTransactionByHash(TestContract.transactionHash)
    expect(typeof x).eq('object')
    expect(x.hash).eq(TestContract.transactionHash)
  })

  it('setInstructor("agustin", 99)', async () => {
    const accounts = await rm.eth_accounts()
    const from = accounts[0]
    await TestContract.setInstructor('agustin', 99, { from })
  })

  it('getInstructor()', async () => {
    const [name, age] = await TestContract.getInstructor()
    expect(name).to.eq('agustin')
    expect(age.toNumber()).to.eq(99)
  })

  it('tears down the filters', async () => {
    await ethFilter.stop()
  })
}
