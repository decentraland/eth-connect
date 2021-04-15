import { BigNumber } from '../utils/BigNumber'

// NFKD (decomposed)
//const EtherSymbol = '\uD835\uDF63';

// NFKC (composed)
const EtherSymbol = '\u039e'

const NegativeOne: BigNumber = new BigNumber(-1)
const Zero: BigNumber = new BigNumber(0)
const One: BigNumber = new BigNumber(1)
const MaxUint256: BigNumber = new BigNumber('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff')

export { EtherSymbol, NegativeOne, Zero, One, MaxUint256 }
