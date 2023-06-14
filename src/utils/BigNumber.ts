import { BigNumber } from 'bignumber.js'
export { BigNumber }

const ETH_BIGNUMBER_ROUNDING_MODE = {
  ROUNDING_MODE: BigNumber.ROUND_DOWN as BigNumber.RoundingMode
}

BigNumber.config(ETH_BIGNUMBER_ROUNDING_MODE)
