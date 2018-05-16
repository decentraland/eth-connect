declare let require

import { Contract } from '../Contract'
import { RequestManager } from '../RequestManager'

const exchangeAbi = require('./SmartExchange.json')

export interface SmartExchangeContract {
  transfer(from: string, to: string, value: number): Promise<void>
  icapTransfer(from: string, to: string, indirectId: string, value: number): Promise<void>
  deposit(to: string): Promise<any>
}

export class SmartExchangeContract extends Contract {
  constructor(requestManager: RequestManager, address: string) {
    super(requestManager, exchangeAbi, address)
  }
}
