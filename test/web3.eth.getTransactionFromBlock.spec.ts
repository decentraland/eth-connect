import { BigNumber } from '../src/utils/BigNumber'
import * as testMethod from './helpers/test.method'

let txResult = {
  status: 'mined',
  hash: '0xc6ef2fc5426d6ad6fd9e2a26abeab0aa2411b7ab17f30a99d3cb96aed1d1055b',
  nonce: '0xb',
  blockHash: '0x6fd9e2a26ab',
  blockNumber: '0x15df',
  transactionIndex: '0x1',
  from: '0x407d73d8a49eeb85d32cf465507dd71d507100c1',
  to: '0x85h43d8a49eeb85d32cf465507dd71d507100c1',
  value: '0x7f110',
  gas: '0x7f110',
  gasPrice: '0x09184e72a000',
  input: '0x603880600c6000396000f30060'
}
let formattedTxResult = {
  status: 'mined',
  hash: '0xc6ef2fc5426d6ad6fd9e2a26abeab0aa2411b7ab17f30a99d3cb96aed1d1055b',
  nonce: 11,
  blockHash: '0x6fd9e2a26ab',
  blockNumber: 5599,
  transactionIndex: 1,
  from: '0x407d73d8a49eeb85d32cf465507dd71d507100c1',
  to: '0x85h43d8a49eeb85d32cf465507dd71d507100c1',
  value: new BigNumber(520464),
  gas: 520464,
  gasPrice: new BigNumber(10000000000000),
  input: '0x603880600c6000396000f30060'
}

testMethod.runTests(`eth_getTransactionByBlockNumberAndIndex`, [
  {
    args: [436, 11],
    formattedArgs: ['0x1b4', '0xb'],
    result: txResult,
    formattedResult: formattedTxResult,
    call: 'eth_getTransactionByBlockNumberAndIndex'
  }
])

testMethod.runTests(`eth_getTransactionByBlockHashAndIndex`, [
  {
    args: ['0x2dbab4c0612bf9caf4c195085547dc0612bf9caf4c1950855', 2],
    formattedArgs: ['0x2dbab4c0612bf9caf4c195085547dc0612bf9caf4c1950855', '0x2'],
    result: txResult,
    formattedResult: formattedTxResult,
    call: 'eth_getTransactionByBlockHashAndIndex'
  }
])
