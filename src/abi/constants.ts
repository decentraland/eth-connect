import { BigNumber } from '../utils/BigNumber'

const AddressZero = '0x0000000000000000000000000000000000000000'
const HashZero = '0x0000000000000000000000000000000000000000000000000000000000000000'

// NFKD (decomposed)
//const EtherSymbol = '\uD835\uDF63';

// NFKC (composed)
const EtherSymbol = '\u039e'

const NegativeOne: BigNumber = new BigNumber(-1)
const Zero: BigNumber = new BigNumber(0)
const One: BigNumber = new BigNumber(1)
const Two: BigNumber = new BigNumber(2)
const WeiPerEther: BigNumber = new BigNumber('1000000000000000000')
const MaxUint256: BigNumber = new BigNumber('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff')

export { AddressZero, HashZero, EtherSymbol, NegativeOne, Zero, One, Two, WeiPerEther, MaxUint256 }
