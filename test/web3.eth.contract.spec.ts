import { FakeHttpProvider } from './helpers/FakeHttpProvider'
import { RequestManager, ContractFactory } from '../src'

const provider = new FakeHttpProvider()

describe('web3.eth.contract', function () {
  it('should create simple contract with one method from abi with explicit type name', async function () {
    // given
    let description = [
      {
        name: 'test(uint256)',
        type: 'function',
        inputs: [
          {
            name: 'a',
            type: 'uint256'
          }
        ],
        outputs: [
          {
            name: 'd',
            type: 'uint256'
          }
        ]
      }
    ]

    let address = '0x1234567890123456789012345678901234567892'

    // when
    const rm = new RequestManager(provider)

    let factory = new ContractFactory(rm, description)

    let myCon: any = await factory.at(address)

    // then
    expect(typeof myCon.test).toEqual('function')
    expect(typeof myCon.test['uint256']).toEqual('function')
  })

  it('should create simple contract with one method from abi with implicit type name', async function () {
    // given
    let description = [
      {
        name: 'test',
        type: 'function',
        inputs: [
          {
            name: 'a',
            type: 'uint256'
          }
        ],
        outputs: [
          {
            name: 'd',
            type: 'uint256'
          }
        ]
      }
    ]
    let address = '0x1234567890123456789012345678901234567892'

    // when
    const rm = new RequestManager(provider)
    let myCon: any = await new ContractFactory(rm, description).at(address)

    // then
    expect(typeof myCon.test).toEqual('function')
    expect(typeof myCon.test['uint256']).toEqual('function')
  })

  it('should create contract with multiple methods', async function () {
    // given
    let description = [
      {
        name: 'test',
        type: 'function',
        inputs: [
          {
            name: 'a',
            type: 'uint256'
          }
        ],
        outputs: [
          {
            name: 'd',
            type: 'uint256'
          }
        ]
      },
      {
        name: 'test2',
        type: 'function',
        inputs: [
          {
            name: 'a',
            type: 'uint256'
          }
        ],
        outputs: [
          {
            name: 'd',
            type: 'uint256'
          }
        ]
      }
    ]
    let address = '0x1234567890123456789012345678901234567892'

    // when
    const rm = new RequestManager(provider)
    let myCon: any = await new ContractFactory(rm, description).at(address)

    // then
    expect(typeof myCon.test).toEqual('function')
    expect(typeof myCon.test2).toEqual('function')
  })

  it('should create contract with overloaded methods', async function () {
    // given
    let description = [
      {
        name: 'test',
        type: 'function',
        inputs: [
          {
            name: 'a',
            type: 'uint256'
          }
        ],
        outputs: [
          {
            name: 'd',
            type: 'uint256'
          }
        ]
      },
      {
        name: 'test',
        type: 'function',
        inputs: [
          {
            name: 'a',
            type: 'string'
          }
        ],
        outputs: [
          {
            name: 'd',
            type: 'uint256'
          }
        ]
      }
    ]
    let address = '0x1234567890123456789012345678901234567892'

    // when
    const rm = new RequestManager(provider)
    let myCon: any = await new ContractFactory(rm, description).at(address)

    // then
    expect(typeof myCon.test).toEqual('function')
    expect(typeof myCon.test['uint256']).toEqual('function')
    expect(typeof myCon.test['string']).toEqual('function')
  })

  it('should create contract with no methods', async function () {
    // given
    let description = [
      {
        name: 'test(uint256)',
        inputs: [
          {
            name: 'a',
            type: 'uint256'
          }
        ],
        outputs: [
          {
            name: 'd',
            type: 'uint256'
          }
        ]
      }
    ]
    let address = '0x1234567890123456789012345678901234567892'

    // when
    const rm = new RequestManager(provider)
    let myCon: any = await new ContractFactory(rm, description).at(address)

    // then
    expect(myCon.test).toBeUndefined()
  })

  it('should create contract with one event', async function () {
    // given
    let description = [
      {
        name: 'test',
        type: 'event',
        inputs: [
          {
            name: 'a',
            type: 'uint256'
          }
        ],
        outputs: [
          {
            name: 'd',
            type: 'uint256'
          }
        ]
      }
    ]
    let address = '0x1234567890123456789012345678901234567892'

    // when
    const rm = new RequestManager(provider)
    let myCon: any = await new ContractFactory(rm, description).at(address)

    // then
    expect(typeof myCon.events.test).toEqual('function')
    expect(typeof myCon.events.test['uint256']).toEqual('function')
  })

  it('should create contract with nondefault constructor', async function () {
    const provider = new FakeHttpProvider()

    const txHash = '0xabababababababab826a5aad13d32ddd9cb82fbc94287bababababababababab'
    const contractAddress = '0xb60e8dd61c5d32be8058bb8eb970870f07233155'
    const address = '0x1234567890123456789012345678901234567894'
    let code = '0x31241231231123123123123121cf121212i123123123123123512312412512111111'
    let description = [
      {
        name: 'test',
        type: 'constructor',
        inputs: [
          {
            name: 'a',
            type: 'uint256'
          }
        ]
      }
    ]

    const validation1 = provider.mockSendTransaction(
      txHash,
      code + '0000000000000000000000000000000000000000000000000000000000000002'
    )

    const getTransactionReceiptCalled = provider.mockGetTransactionReceipt(txHash, {
      contractAddress
    })

    const estimateGas = provider.injectHandler('eth_estimateGas', async (_) => {
      provider.injectResult('0x60016')
    })

    const getCodeCalled = provider.injectValidation(async (payload) => {
      if (payload.method === 'eth_getCode') {
        provider.injectResult(
          '0x600160008035811a818181146012578301005b601b6001356025565b8060005260206000f25b600060078202905091905056'
        )
      } else {
        return false
      }
    })

    const rm = new RequestManager(provider)
    const factory = new ContractFactory(rm, description)

    const contract = await factory.deploy(2, { data: code, from: address, gas: 0, to: null })

    expect(contract.transactionHash).toEqual(txHash)
    expect(contract.address).toEqual(contractAddress)

    await estimateGas

    await getTransactionReceiptCalled

    await getCodeCalled

    await validation1
  })
})
