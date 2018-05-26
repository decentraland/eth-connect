import { RequestManager } from './RequestManager'
import { SolidityFunction } from './SolidityFunction'
import { SolidityEvent } from './SolidityEvent'
import { AllSolidityEvents } from './AllSolidityEvents'
import { EthFilter } from './Filter'

/**
 * Should be called to add functions to contract object
 *
 * @method addFunctionsToContract
 * @param {Contract} contract
 * @param {Array} abi
 */
function addFunctionsToContract(contract: Contract) {
  contract.abi
    .filter(function(json) {
      return json.type === 'function'
    })
    .map(function(json) {
      return new SolidityFunction(contract.requestManager, json, contract.address)
    })
    .forEach(function(f) {
      f.attachToContract(contract)
    })
}

/**
 * Should be called to add events to contract object
 *
 * @method addEventsToContract
 * @param {Contract} contract
 * @param {Array} abi
 */
function addEventsToContract(contract: Contract) {
  let events = contract.abi.filter(function(json) {
    return json.type === 'event'
  })

  let allEvents = new AllSolidityEvents(contract.requestManager, events, contract.address)

  allEvents.attachToContract(contract)

  events
    .map(function(json) {
      return new SolidityEvent(contract.requestManager, json, contract.address)
    })
    .forEach(function(e) {
      e.attachToContract(contract)
    })
}

export type EventFilterCreator = (indexed, options?, callback?: (event) => void) => Promise<EthFilter>

/**
 * Should be called to create new contract instance
 *
 * @method Contract
 * @param {Array} abi
 * @param {Address} contract address
 */
export class Contract {
  events: { [key: string]: EventFilterCreator } = {}

  transactionHash: string = null

  constructor(public requestManager: RequestManager, public abi: any[], public address: string) {
    this.transactionHash = null
    this.address = address
    this.abi = abi

    // this functions are not part of prototype,
    // because we dont want to spoil the interface
    addFunctionsToContract(this)
    addEventsToContract(this)
  }
}
