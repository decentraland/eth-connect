import { assert } from 'chai'
import { FakeHttpProvider } from './helpers/FakeHttpProvider'
import { RequestManager, ContractFactory } from '../dist'

const provider = new FakeHttpProvider()

describe('web3.eth.contract', function() {
  it('should create simple contract with one method from abi with explicit type name', async function() {
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

    let myCon: any = await new ContractFactory(rm, description).at(address)

    // then
    assert.equal('function', typeof myCon.test)
    assert.equal('function', typeof myCon.test['uint256'])
  })

  it('should create simple contract with one method from abi with implicit type name', async function() {
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
    assert.equal('function', typeof myCon.test)
    assert.equal('function', typeof myCon.test['uint256'])
  })

  it('should create contract with multiple methods', async function() {
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
    assert.equal('function', typeof myCon.test)
    assert.equal('function', typeof myCon.test['uint256'])
    assert.equal('function', typeof myCon.test2)
    assert.equal('function', typeof myCon.test2['uint256'])
  })

  it('should create contract with overloaded methods', async function() {
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
    assert.equal('function', typeof myCon.test)
    assert.equal('function', typeof myCon.test['uint256'])
    assert.equal('function', typeof myCon.test['string'])
  })

  it('should create contract with no methods', async function() {
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
    assert.equal('undefined', typeof myCon.test)
  })

  it('should create contract with one event', async function() {
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
    assert.equal('function', typeof myCon.test)
    assert.equal('function', typeof myCon.test['uint256'])
  })

  it('should create contract with nondefault constructor', async function() {
    const provider = new FakeHttpProvider()

    let address = '0x1234567890123456789012345678901234567894'
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

    let steps = 1

    provider.injectResult(address)
    provider.injectValidation(function(payload) {
      if (steps === 1) {
        assert.equal(payload.jsonrpc, '2.0')
        assert.equal(payload.method, 'eth_sendTransaction')
        assert.equal(payload.params[0].data, code + '0000000000000000000000000000000000000000000000000000000000000002')
        steps++
      } else if (steps === 2) {
        assert.equal(payload.jsonrpc, '2.0')
        assert.equal(payload.method, 'eth_newBlockFilter')
        steps++
      }
    })

    const rm = new RequestManager(provider)
    const deployPromise = new ContractFactory(rm, description).deploy(2, { from: address, data: code })
    await deployPromise
  })
})
