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

// Unknown Error
export const UNKNOWN_ERROR = 'UNKNOWN_ERROR'

// Not implemented
export const NOT_IMPLEMENTED = 'NOT_IMPLEMENTED'

// Missing new operator to an object
//  - name: The name of the class
export const MISSING_NEW = 'MISSING_NEW'

// Call exception
//  - transaction: the transaction
//  - address?: the contract address
//  - args?: The arguments passed into the function
//  - method?: The Solidity method signature
//  - errorSignature?: The EIP848 error signature
//  - errorArgs?: The EIP848 error parameters
//  - reason: The reason (only for EIP848 "Error(string)")
export const CALL_EXCEPTION = 'CALL_EXCEPTION'

// Invalid argument (e.g. value is incompatible with type) to a function:
//   - arg: The argument name that was invalid
//   - value: The value of the argument
export const INVALID_ARGUMENT = 'INVALID_ARGUMENT'

// Missing argument to a function:
//   - count: The number of arguments received
//   - expectedCount: The number of arguments expected
export const MISSING_ARGUMENT = 'MISSING_ARGUMENT'

// Too many arguments
//   - count: The number of arguments received
//   - expectedCount: The number of arguments expected
export const UNEXPECTED_ARGUMENT = 'UNEXPECTED_ARGUMENT'

// Numeric Fault
//   - operation: the operation being executed
//   - fault: the reason this faulted
export const NUMERIC_FAULT = 'NUMERIC_FAULT'

// Insufficien funds (< value + gasLimit * gasPrice)
//   - transaction: the transaction attempted
export const INSUFFICIENT_FUNDS = 'INSUFFICIENT_FUNDS'

// Nonce has already been used
//   - transaction: the transaction attempted
export const NONCE_EXPIRED = 'NONCE_EXPIRED'

// The replacement fee for the transaction is too low
//   - transaction: the transaction attempted
export const REPLACEMENT_UNDERPRICED = 'REPLACEMENT_UNDERPRICED'

// Unsupported operation
//   - operation
export const UNSUPPORTED_OPERATION = 'UNSUPPORTED_OPERATION'

export function InvalidNumberOfSolidityArgs(given: number, expected: number) {
  return new Error(`Invalid number of arguments to Solidity function. given: ${given}, expected: ${expected}`)
}

export function InvalidNumberOfRPCParams(methodName: string, given: number, expected: number) {
  return new Error(
    `Invalid number of input parameters to RPC method "${methodName}" given: ${given}, expected: ${expected}`
  )
}

export function InvalidConnection(host: string) {
  return new Error("CONNECTION ERROR: Couldn't connect to node " + host + '.')
}

export function InvalidProvider() {
  return new Error('Provider not set or invalid')
}

export function InvalidResponse(result: any) {
  let message =
    !!result && !!result.error && !!result.error.message
      ? result.error.message
      : 'Invalid JSON RPC response: ' + JSON.stringify(result)
  return new Error(message)
}

export function ConnectionTimeout(ms: number) {
  return new Error('CONNECTION TIMEOUT: timeout of ' + ms + ' ms achived')
}

let _permanentCensorErrors = false
let _censorErrors = false

export function error(message: string, code: string = UNKNOWN_ERROR, params: any = {}): Error {
  if (_censorErrors) {
    return new Error('unknown error')
  }

  let messageDetails: Array<string> = []
  Object.keys(params).forEach((key) => {
    try {
      messageDetails.push(key + '=' + JSON.stringify(params[key]))
    } catch (error) {
      messageDetails.push(key + '=' + JSON.stringify(params[key].toString()))
    }
  })

  let reason = message
  if (messageDetails.length) {
    message += ' (' + messageDetails.join(', ') + ')'
  }

  // @TODO: Any??
  let error: any = new Error(message)
  error.reason = reason
  error.code = code

  Object.keys(params).forEach(function (key) {
    error[key] = params[key]
  })

  return error
}

export function checkNew(self: any, kind: any): void {
  if (!(self instanceof kind)) {
    throw error('missing new', MISSING_NEW, { name: kind.name })
  }
}

export function checkArgumentCount(count: number, expectedCount: number, suffix?: string): void {
  if (!suffix) {
    suffix = ''
  }
  if (count < expectedCount) {
    throw error('missing argument' + suffix, MISSING_ARGUMENT, { count: count, expectedCount: expectedCount })
  }
  if (count > expectedCount) {
    throw error('too many arguments' + suffix, UNEXPECTED_ARGUMENT, { count: count, expectedCount: expectedCount })
  }
}

export function setCensorship(censorship: boolean, permanent?: boolean): void {
  if (_permanentCensorErrors) {
    throw error('error censorship permanent', UNSUPPORTED_OPERATION, { operation: 'setCersorship' })
  }

  _censorErrors = !!censorship
  _permanentCensorErrors = !!permanent
}
