/*
    This file is part of web3.js.

    web3.js is free software: you can redistribute it and/or modify
    it under the terms of the GNU Lesser General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    web3.js is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Lesser General Public License for more details.

    You should have received a copy of the GNU Lesser General Public License
    along with web3.js.  If not, see <http://www.gnu.org/licenses/>.
*/

import { BigNumber } from '../utils/BigNumber'

export const ETH_UNITS = [
  'wei',
  'kwei',
  'Mwei',
  'Gwei',
  'szabo',
  'finney',
  'femtoether',
  'picoether',
  'nanoether',
  'microether',
  'milliether',
  'nano',
  'micro',
  'milli',
  'ether',
  'grand',
  'Mether',
  'Gether',
  'Tether',
  'Pether',
  'Eether',
  'Zether',
  'Yether',
  'Nether',
  'Dether',
  'Vether',
  'Uether'
]

export const ETH_PADDING = 32
export const ETH_SIGNATURE_LENGTH = 4
export const ETH_BIGNUMBER_ROUNDING_MODE = {
  ROUNDING_MODE: BigNumber.ROUND_DOWN as BigNumber.RoundingMode
}
export const ETH_POLLING_TIMEOUT = 1000 / 2
export let defaultBlock: 'latest' = 'latest'
