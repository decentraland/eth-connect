import * as expect from 'expect'
import { SolidityFunction, toBigNumber } from '../src'

describe('solidityfunction', () => {
  it('works to produce an output for allowance', async () => {
    const fn = new SolidityFunction({
      inputs: [
        {
          name: '_owner',
          type: 'address'
        },
        {
          name: '_spender',
          type: 'address'
        }
      ],
      name: 'allowance',
      type: 'function'
    })

    expect(
      fn.toPayload(['0x53e4f345937cbd68295c2b9fb08aec53ae94b16b', '0x0f5d2fb29fb7d3cfee444a200298f468908cc942'])
    ).toEqual({
      to: undefined,
      data:
        '0xdd62ed3e00000000000000000000000053e4f345937cbd68295c2b9fb08aec53ae94b16b0000000000000000000000000f5d2fb29fb7d3cfee444a200298f468908cc942',
      value: undefined,
      from: undefined
    })
  })

  it('works to produce an output for transfer', async () => {
    const fn = new SolidityFunction({
      inputs: [
        {
          name: 'recipient',
          type: 'address'
        },
        {
          name: 'amount',
          type: 'uint256'
        }
      ],
      name: 'transfer',
      type: 'function'
    })

    expect(fn.toPayload(['0x337c67618968370907da31dAEf3020238D01c9de', toBigNumber('10000000000000000000')])).toEqual({
      to: undefined,
      data:
        '0xa9059cbb000000000000000000000000337c67618968370907da31daef3020238d01c9de0000000000000000000000000000000000000000000000008ac7230489e80000',
      value: undefined,
      from: undefined
    })
  })
})
