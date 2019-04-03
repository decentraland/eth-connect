declare let require: any

import { Contract } from '../Contract'
import { RequestManager } from '../RequestManager'

const exchangeAbi = require('./ICAPRegistrar.json')

export interface ICAPRegistrar {
  owner(_name: string): Promise<string>
  disown(_name: string, _refund: string): Promise<any>
  addr(_name: string): Promise<string>
  reserve(_name: string): Promise<void>
  transfer(_name: string, _newOwner: string): Promise<void>
  setAddr(_name: string, _a: string): Promise<void>
  deposit(to: string): Promise<any>
}

export class ICAPRegistrar extends Contract {
  constructor(requestManager: RequestManager, address: string = '0xa1a111bc074c9cfa781f0c38e63bd51c91b8af00') {
    super(requestManager, exchangeAbi, address)
  }
}
