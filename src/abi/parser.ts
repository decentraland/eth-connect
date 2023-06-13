///////////////////////////////////
// Parsing for Solidity Signatures

import { AbiEvent, AbiFunction, AbiInput } from '../Schema'
import { formatSignature } from './coder'

export function parseParamType(type: string): AbiInput {
  return parseParam(type, true)
}

export function parseSignatureFunction(fragment: string): AbiFunction {
  const abi: AbiFunction = {
    constant: false,
    inputs: [],
    name: '',
    outputs: [],
    payable: false,
    type: 'function'
  }

  let comps = fragment.split('@')
  if (comps.length !== 1) {
    if (comps.length > 2) {
      throw new Error('invalid signature')
    }
    if (!comps[1].match(/^[0-9]+$/)) {
      throw new Error('invalid signature gas')
    }
    abi.gas = parseFloat(comps[1])
    fragment = comps[0]
  }

  comps = fragment.split(' returns ')
  const left = comps[0].match(regexParen)
  if (!left) {
    throw new Error('invalid signature')
  }

  abi.name = left[1].trim()
  if (!abi.name.match(regexIdentifier)) {
    throw new Error('invalid identifier: "' + left[1] + '"')
  }

  splitNesting(left[2]).forEach(function (param) {
    abi.inputs!.push(parseParam(param))
  })

  left[3].split(' ').forEach(function (modifier) {
    switch (modifier) {
      case 'constant':
        abi.constant = true
        break
      case 'payable':
        abi.payable = true
        abi.stateMutability = 'payable'
        break
      case 'pure':
        abi.constant = true
        abi.stateMutability = 'pure'
        break
      case 'view':
        abi.constant = true
        abi.stateMutability = 'view'
        break
      case 'external':
      case 'public':
      case '':
        break
    }
  })

  // We have outputs
  if (comps.length > 1) {
    const right = comps[1].match(regexParen)
    if (!right || right[1].trim() != '' || right[3].trim() != '') {
      throw new Error('unexpected tokens')
    }

    splitNesting(right[2]).forEach(function (param) {
      abi.outputs!.push(parseParam(param))
    })
  }

  if (abi.name === 'constructor') {
    ;(abi as any).type = 'constructor'

    if (abi.outputs!.length) {
      throw new Error('constructor may not have outputs')
    }

    // delete abi.name
    // delete abi.outputs
  }

  return abi
}

const regexParen = new RegExp('^([^)(]*)\\((.*)\\)([^)(]*)$')
const regexIdentifier = new RegExp('^[A-Za-z_][A-Za-z0-9_]*$')

function verifyType(type: string): string {
  // These need to be transformed to their full description
  if (type.match(/^uint($|[^1-9])/)) {
    type = 'uint256' + type.substring(4)
  } else if (type.match(/^int($|[^1-9])/)) {
    type = 'int256' + type.substring(3)
  }

  return type
}

type ParseState = {
  allowArray?: boolean
  allowName?: boolean
  allowParams?: boolean
  allowType?: boolean
  readArray?: boolean
}

type ParseNode = {
  parent?: any
  type?: string
  name?: string
  state?: ParseState
  indexed?: boolean
  components?: Array<any>
}

function parseParam(param: string, allowIndexed?: boolean): AbiInput {
  function throwError(i: number) {
    return new Error('unexpected character "' + param[i] + '" at position ' + i + ' in "' + param + '"')
  }

  const parent: ParseNode = { type: '', name: '', state: { allowType: true } }
  let node: any = parent

  for (let i = 0; i < param.length; i++) {
    const c = param[i]
    switch (c) {
      case '(':
        if (!node.state.allowParams) {
          throw throwError(i)
        }
        node.state.allowType = false
        node.type = verifyType(node.type)
        node.components = [{ type: '', name: '', parent: node, state: { allowType: true } }]
        node = node.components[0]
        break

      case ')':
        delete node.state
        if (allowIndexed && node.name === 'indexed') {
          node.indexed = true
          node.name = ''
        }
        node.type = verifyType(node.type)

        var child = node
        node = node.parent
        if (!node) {
          throw throwError(i)
        }
        delete child.parent
        node.state.allowParams = false
        node.state.allowName = true
        node.state.allowArray = true
        break

      case ',':
        delete node.state
        if (allowIndexed && node.name === 'indexed') {
          node.indexed = true
          node.name = ''
        }
        node.type = verifyType(node.type)

        var sibling: ParseNode = { type: '', name: '', parent: node.parent, state: { allowType: true } }
        node.parent.components.push(sibling)
        delete node.parent
        node = sibling
        break

      // Hit a space...
      case ' ':
        // If reading type, the type is done and may read a param or name
        if (node.state.allowType) {
          if (node.type !== '') {
            node.type = verifyType(node.type)
            delete node.state.allowType
            node.state.allowName = true
            node.state.allowParams = true
          }
        }

        // If reading name, the name is done
        if (node.state.allowName) {
          if (node.name !== '') {
            if (allowIndexed && node.name === 'indexed') {
              node.indexed = true
              node.name = ''
            } else {
              node.state.allowName = false
            }
          }
        }

        break

      case '[':
        if (!node.state.allowArray) {
          throw throwError(i)
        }

        node.type += c

        node.state.allowArray = false
        node.state.allowName = false
        node.state.readArray = true
        break

      case ']':
        if (!node.state.readArray) {
          throw throwError(i)
        }

        node.type += c

        node.state.readArray = false
        node.state.allowArray = true
        node.state.allowName = true
        break

      default:
        if (node.state.allowType) {
          node.type += c
          node.state.allowParams = true
          node.state.allowArray = true
        } else if (node.state.allowName) {
          node.name += c
          delete node.state.allowArray
        } else if (node.state.readArray) {
          node.type += c
        } else {
          throw throwError(i)
        }
    }
  }

  if (node.parent) {
    throw new Error('unexpected eof')
  }

  delete parent.state

  if (allowIndexed && node.name === 'indexed') {
    node.indexed = true
    node.name = ''
  }

  parent.type = verifyType(parent.type!)

  return parent as AbiInput
}

// @TODO: Better return type
export function parseSignatureEvent(fragment: string): AbiEvent {
  const abi: AbiEvent = {
    anonymous: false,
    inputs: [],
    name: '',
    type: 'event'
  }

  const match = fragment.match(regexParen)
  if (!match) {
    throw new Error('invalid event: ' + fragment)
  }

  abi.name = match[1].trim()

  splitNesting(match[2]).forEach(function (param) {
    param = parseParam(param, true)
    param.indexed = !!param.indexed
    abi.inputs!.push(param)
  })

  match[3].split(' ').forEach(function (modifier) {
    switch (modifier) {
      case 'anonymous':
        abi.anonymous = true
        break
      case '':
        break
    }
  })

  if (abi.name && !abi.name.match(regexIdentifier)) {
    throw new Error('invalid identifier: "' + abi.name + '"')
  }

  return abi
}

function splitNesting(value: string): Array<any> {
  value = value.trim()

  const result: string[] = []
  let accum = ''
  let depth = 0
  for (let offset = 0; offset < value.length; offset++) {
    const c = value[offset]
    if (c === ',' && depth === 0) {
      result.push(accum)
      accum = ''
    } else {
      accum += c
      if (c === '(') {
        depth++
      } else if (c === ')') {
        depth--
        if (depth === -1) {
          throw new Error('unbalanced parenthsis')
        }
      }
    }
  }
  if (accum) {
    result.push(accum)
  }

  return result
}

export function parseSignature(fragment: string): AbiEvent | AbiFunction {
  if (typeof fragment === 'string') {
    // Make sure the "returns" is surrounded by a space and all whitespace is exactly one space
    fragment = fragment.replace(/\(/g, ' (').replace(/\)/g, ') ').replace(/\s+/g, ' ')
    fragment = fragment.trim()

    if (fragment.substring(0, 6) === 'event ') {
      const ret = parseSignatureEvent(fragment.substring(6).trim())

      // check if it throws
      formatSignature(ret)

      return ret
    } else {
      if (fragment.substring(0, 9) === 'function ') {
        fragment = fragment.substring(9)
      }

      const ret = parseSignatureFunction(fragment.trim())

      // check if it throws
      formatSignature(ret)

      return ret
    }
  }

  throw new Error('unknown signature')
}
