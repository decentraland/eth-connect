import { RequestManager } from './RequestManager'
import { SolidityFunction } from './SolidityFunction'
import { SolidityEvent } from './SolidityEvent'
import { AllSolidityEvents } from './AllSolidityEvents'
import { EthFilter } from './Filter'
import { AbiEvent, AbiFunction, AbiItem, FilterOptions } from './Schema'

/**
 * Should be called to add functions to contract object
 *
 * @param contract - The contract instance
 */
function addFunctionsToContract(contract: Contract) {
  contract.abi
    .filter(function (json): json is AbiFunction {
      return json.type === 'function'
    })
    .map(function (json) {
      return new SolidityFunction(json)
    })
    .forEach(function (f) {
      f.attachToContract(contract)
    })
}

/**
 * Should be called to add events to contract object
 *
 * @param contract - The contract instance
 */
function addEventsToContract(contract: Contract) {
  const events = contract.abi.filter(function (json): json is AbiEvent {
    return json.type === 'event'
  })

  const allEvents = new AllSolidityEvents(contract.requestManager, events, contract.address)

  events
    .map(function (json) {
      return new SolidityEvent(contract.requestManager, json, contract.address)
    })
    .forEach(function (e) {
      e.attachToContract(contract)
    })

  return allEvents.getAllEventsFunction()
}

/**
 * @public
 */
export type EventFilterCreator = (indexed: { [key: string]: any }, options?: FilterOptions) => Promise<EthFilter>

/**
 * @public
 * Should be called to create new contract instance
 */
export class Contract {
  allEvents: (options: FilterOptions) => Promise<EthFilter>

  events: { [key: string]: EventFilterCreator } = {}

  transactionHash: string | null = null

  constructor(public requestManager: RequestManager, public abi: AbiItem[], public address: string) {
    this.address = address
    this.abi = abi

    // this functions are not part of prototype,
    // because we dont want to spoil the interface
    addFunctionsToContract(this)
    this.allEvents = addEventsToContract(this)
  }
}
