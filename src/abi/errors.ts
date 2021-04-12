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

let _permanentCensorErrors = false
let _censorErrors = false

// @TODO: Enum
export function throwError(message: string, code: string = UNKNOWN_ERROR, params: any = {}): never {
  if (_censorErrors) {
    throw new Error('unknown error')
  }

  let messageDetails: Array<string> = []
  Object.keys(params).forEach((key) => {
    try {
      messageDetails.push(key + '=' + JSON.stringify(params[key]))
    } catch (error) {
      messageDetails.push(key + '=' + JSON.stringify(params[key].toString()))
    }
  })
  messageDetails.push('version=1')

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

  throw error
}

export function checkNew(self: any, kind: any): void {
  if (!(self instanceof kind)) {
    throwError('missing new', MISSING_NEW, { name: kind.name })
  }
}

export function checkArgumentCount(count: number, expectedCount: number, suffix?: string): void {
  if (!suffix) {
    suffix = ''
  }
  if (count < expectedCount) {
    throwError('missing argument' + suffix, MISSING_ARGUMENT, { count: count, expectedCount: expectedCount })
  }
  if (count > expectedCount) {
    throwError('too many arguments' + suffix, UNEXPECTED_ARGUMENT, { count: count, expectedCount: expectedCount })
  }
}

export function setCensorship(censorship: boolean, permanent?: boolean): void {
  if (_permanentCensorErrors) {
    throwError('error censorship permanent', UNSUPPORTED_OPERATION, { operation: 'setCersorship' })
  }

  _censorErrors = !!censorship
  _permanentCensorErrors = !!permanent
}
