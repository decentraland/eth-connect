declare let require: any

import { Contract } from '../Contract'
import { RequestManager } from '../RequestManager'

const exchangeAbi = require('./GlobalRegistrar.json')

export interface GlobalRegistrar {
  name(_owner: string): Promise<string>
  owner(_name: string): Promise<string>
  content(_name: string): Promise<string>
  addr(_name: string): Promise<string>
  reserve(_name: string): Promise<void>
  subRegistrar(_name: string): Promise<string>
  transfer(_name: string, _newOwner: string): Promise<void>
  setSubRegistrar(_name: string, _registrar: string): Promise<void>
  Registrar(): Promise<void>
  setAddress(_name: string, _a: string, _primary: boolean): Promise<any>
  setContent(_name: string, _content: string): Promise<any>
  disown(_name: string): Promise<any>
}

export class GlobalRegistrar extends Contract {
  constructor(requestManager: RequestManager, address: string = '0xc6d9d2cd449a754c494264e1809c50e34d64562b') {
    super(requestManager, exchangeAbi, address)
  }
}
