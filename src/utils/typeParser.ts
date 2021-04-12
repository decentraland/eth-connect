// AST Node parser state
type ParseState = {
  allowArray?: boolean
  allowName?: boolean
  allowParams?: boolean
  allowType?: boolean
  readArray?: boolean
}

// AST Node
type ParseNode = {
  parent?: any
  type: string
  name: string
  state?: ParseState
  indexed?: boolean
  components?: Array<ParseNode>
}

let ModifiersBytes: { [name: string]: boolean } = { calldata: true, memory: true, storage: true }
let ModifiersNest: { [name: string]: boolean } = { calldata: true, memory: true }

function checkModifier(type: string, name: string): boolean {
  if (type === 'bytes' || type === 'string') {
    if (ModifiersBytes[name]) {
      return true
    }
  } else if (type === 'address') {
    if (name === 'payable') {
      return true
    }
  } else if (type.indexOf('[') >= 0 || type === 'tuple') {
    if (ModifiersNest[name]) {
      return true
    }
  }
  if (ModifiersBytes[name] || name === 'payable') {
    throw new Error('Invalid modifier: ' + name)
  }
  return false
}

// @TODO: Make sure that children of an indexed tuple are marked with a null indexed
export function parseParamType(param: string, allowIndexed: boolean): ParseNode {
  let originalParam = param
  function throwError(i: number) {
    throw new Error(`unexpected character at position ${i} in param ${param}`)
  }
  param = param.replace(/\s/g, ' ')

  function newNode(parent: ParseNode): ParseNode {
    let node: ParseNode = { type: '', name: '', parent: parent, state: { allowType: true } }
    if (allowIndexed) {
      node.indexed = false
    }
    return node
  }

  let parent: ParseNode = { type: '', name: '', state: { allowType: true } }
  let node = parent

  for (let i = 0; i < param.length; i++) {
    let c = param[i]
    switch (c) {
      case '(':
        if (node.state!.allowType && node.type === '') {
          node.type = 'tuple'
        } else if (!node.state!.allowParams) {
          throwError(i)
        }
        node.state!.allowType = false
        node.type = verifyType(node.type)
        node.components = [newNode(node)]
        node = node.components[0]
        break

      case ')':
        delete node.state

        if (node.name === 'indexed') {
          if (!allowIndexed) {
            throwError(i)
          }
          node.indexed = true
          node.name = ''
        }

        if (checkModifier(node.type, node.name)) {
          node.name = ''
        }

        node.type = verifyType(node.type)

        let child = node
        node = node.parent
        if (!node) {
          throwError(i)
        }
        delete child.parent
        node.state!.allowParams = false
        node.state!.allowName = true
        node.state!.allowArray = true
        break

      case ',':
        delete node.state

        if (node.name === 'indexed') {
          if (!allowIndexed) {
            throwError(i)
          }
          node.indexed = true
          node.name = ''
        }

        if (checkModifier(node.type, node.name)) {
          node.name = ''
        }

        node.type = verifyType(node.type)

        let sibling: ParseNode = newNode(node.parent)
        //{ type: "", name: "", parent: node.parent, state: { allowType: true } };
        node.parent.components.push(sibling)
        delete node.parent
        node = sibling
        break

      // Hit a space...
      case ' ':
        // If reading type, the type is done and may read a param or name
        if (node.state!.allowType) {
          if (node.type !== '') {
            node.type = verifyType(node.type)
            delete node.state!.allowType
            node.state!.allowName = true
            node.state!.allowParams = true
          }
        }

        // If reading name, the name is done
        if (node.state!.allowName) {
          if (node.name !== '') {
            if (node.name === 'indexed') {
              if (!allowIndexed) {
                throwError(i)
              }
              if (node.indexed) {
                throwError(i)
              }
              node.indexed = true
              node.name = ''
            } else if (checkModifier(node.type, node.name)) {
              node.name = ''
            } else {
              node.state!.allowName = false
            }
          }
        }

        break

      case '[':
        if (!node.state!.allowArray) {
          throwError(i)
        }

        node.type += c

        node.state!.allowArray = false
        node.state!.allowName = false
        node.state!.readArray = true
        break

      case ']':
        if (!node.state!.readArray) {
          throwError(i)
        }

        node.type += c

        node.state!.readArray = false
        node.state!.allowArray = true
        node.state!.allowName = true
        break

      default:
        if (node.state!.allowType) {
          node.type += c
          node.state!.allowParams = true
          node.state!.allowArray = true
        } else if (node.state!.allowName) {
          node.name += c
          delete node.state!.allowArray
        } else if (node.state!.readArray) {
          node.type += c
        } else {
          throwError(i)
        }
    }
  }

  if (node.parent) {
    throw new Error('unexpected end of input: ' + param)
  }

  delete parent.state

  if (node.name === 'indexed') {
    if (!allowIndexed) {
      throwError(originalParam.length - 7)
    }
    if (node.indexed) {
      throwError(originalParam.length - 7)
    }
    node.indexed = true
    node.name = ''
  } else if (checkModifier(node.type, node.name)) {
    node.name = ''
  }

  parent.type = verifyType(parent.type)

  return parent
}

function verifyType(type: string): string {
  // These need to be transformed to their full description
  if (type.match(/^uint($|[^1-9])/)) {
    type = 'uint256' + type.substring(4)
  } else if (type.match(/^int($|[^1-9])/)) {
    type = 'int256' + type.substring(3)
  }

  return type
}
