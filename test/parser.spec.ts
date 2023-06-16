import { AbiEvent, AbiFunction } from '../src'
import { parseSignature } from '../src/abi/parser'

const suite: Record<string, AbiFunction | AbiEvent> = {
  'event BaseURI(string _oldBaseURI, string _newBaseURI)': {
    anonymous: false,
    inputs: [
      { type: 'string', name: '_oldBaseURI', indexed: false },
      { type: 'string', name: '_newBaseURI', indexed: false }
    ],
    name: 'BaseURI',
    type: 'event'
  },
  'event SetGlobalMinter(address indexed _minter, bool _value)': {
    anonymous: false,
    inputs: [
      { type: 'address', name: '_minter', indexed: true },
      { type: 'bool', name: '_value', indexed: false }
    ],
    name: 'SetGlobalMinter',
    type: 'event'
  },
  'event SetGlobalManager(address indexed _manager, bool _value)': {
    anonymous: false,
    inputs: [
      { type: 'address', name: '_manager', indexed: true },
      { type: 'bool', name: '_value', indexed: false }
    ],
    name: 'SetGlobalManager',
    type: 'event'
  },
  'event SetItemMinter(uint256 indexed _itemId, address indexed _minter, bool _value)': {
    anonymous: false,
    inputs: [
      { type: 'uint256', name: '_itemId', indexed: true },
      { type: 'address', name: '_minter', indexed: true },
      { type: 'bool', name: '_value', indexed: false }
    ],
    name: 'SetItemMinter',
    type: 'event'
  },
  'event SetItemManager(uint256 indexed _itemId, address indexed _manager, bool _value)': {
    anonymous: false,
    inputs: [
      { type: 'uint256', name: '_itemId', indexed: true },
      { type: 'address', name: '_manager', indexed: true },
      { type: 'bool', name: '_value', indexed: false }
    ],
    name: 'SetItemManager',
    type: 'event'
  },
  'event AddItem(uint256 indexed _itemId, tuple(uint256) _item)': {
    anonymous: false,
    inputs: [
      { type: 'uint256', name: '_itemId', indexed: true },
      {
        type: 'tuple',
        name: '_item',
        indexed: false,
        components: [
          {
            name: '',
            type: 'uint256'
          }
        ]
      }
    ],
    name: 'AddItem',
    type: 'event'
  },
  'event RescueItem(uint256 indexed _itemId, bytes32 _contentHash, string _metadata)': {
    anonymous: false,
    inputs: [
      { type: 'uint256', name: '_itemId', indexed: true },
      { type: 'bytes32', name: '_contentHash', indexed: false },
      { type: 'string', name: '_metadata', indexed: false }
    ],
    name: 'RescueItem',
    type: 'event'
  },
  'event Issue(address indexed _beneficiary, uint256 indexed _tokenId, uint256 indexed _itemId, uint256 _issuedId)': {
    anonymous: false,
    inputs: [
      { type: 'address', name: '_beneficiary', indexed: true },
      { type: 'uint256', name: '_tokenId', indexed: true },
      { type: 'uint256', name: '_itemId', indexed: true },
      { type: 'uint256', name: '_issuedId', indexed: false }
    ],
    name: 'Issue',
    type: 'event'
  },
  'event UpdateItemSalesData(uint256 indexed _itemId, uint256 _price, address _beneficiary)': {
    anonymous: false,
    inputs: [
      { type: 'uint256', name: '_itemId', indexed: true },
      { type: 'uint256', name: '_price', indexed: false },
      { type: 'address', name: '_beneficiary', indexed: false }
    ],
    name: 'UpdateItemSalesData',
    type: 'event'
  },
  'event UpdateItemMetadata(uint256 indexed _itemId, string _metadata)': {
    anonymous: false,
    inputs: [
      { type: 'uint256', name: '_itemId', indexed: true },
      { type: 'string', name: '_metadata', indexed: false }
    ],
    name: 'UpdateItemMetadata',
    type: 'event'
  },
  'event CreatorshipTransferred(address indexed _previousCreator, address indexed _newCreator)': {
    anonymous: false,
    inputs: [
      { type: 'address', name: '_previousCreator', indexed: true },
      { type: 'address', name: '_newCreator', indexed: true }
    ],
    name: 'CreatorshipTransferred',
    type: 'event'
  },
  'event SetApproved(bool _previousValue, bool _newValue)': {
    anonymous: false,
    inputs: [
      { type: 'bool', name: '_previousValue', indexed: false },
      { type: 'bool', name: '_newValue', indexed: false }
    ],
    name: 'SetApproved',
    type: 'event'
  },
  'event SetEditable(bool _previousValue, bool _newValue)': {
    anonymous: false,
    inputs: [
      { type: 'bool', name: '_previousValue', indexed: false },
      { type: 'bool', name: '_newValue', indexed: false }
    ],
    name: 'SetEditable',
    type: 'event'
  },
  'event Complete()': { anonymous: false, inputs: [], name: 'Complete', type: 'event' },
  'function issueTokens(address[] _beneficiaries, uint256[] _itemIds) external virtual': {
    constant: false,
    inputs: [
      {
        name: '_beneficiaries',
        type: 'address[]'
      },
      {
        name: '_itemIds',
        type: 'uint256[]'
      }
    ],
    name: 'issueTokens',
    outputs: [],
    payable: false,
    type: 'function'
  },
  'function getRarityName(tuple(uint256) _rarity) public pure returns (string memory)': {
    constant: true,
    inputs: [
      {
        type: 'tuple',
        name: '_rarity',
        components: [
          {
            name: '',
            type: 'uint256'
          }
        ]
      }
    ],
    name: 'getRarityName',
    outputs: [{ type: 'string', name: 'memory' }],
    payable: false,
    type: 'function',
    stateMutability: 'pure'
  },
  'function isMintingAllowed() public view returns (bool)': {
    constant: true,
    inputs: [],
    name: 'isMintingAllowed',
    outputs: [{ type: 'bool', name: '' }],
    payable: false,
    type: 'function',
    stateMutability: 'view'
  },
  'function tokenURI(uint256 _tokenId) public view virtual override returns (string memory)': {
    constant: true,
    inputs: [{ type: 'uint256', name: '_tokenId' }],
    name: 'tokenURI',
    outputs: [{ type: 'string', name: 'memory' }],
    payable: false,
    type: 'function',
    stateMutability: 'view'
  },
  'function batchTransferFrom(address _from, address _to, uint256[] _tokenIds) public': {
    constant: false,
    inputs: [
      {
        name: '_from',
        type: 'address'
      },
      {
        name: '_to',
        type: 'address'
      },
      {
        name: '_tokenIds',
        type: 'uint256[]'
      }
    ],
    name: 'batchTransferFrom',
    outputs: [],
    payable: false,
    type: 'function'
  },
  // TODO: test this with real ABI and integration tests
  'function decodeTokenId(uint256 _id) public pure returns (uint256 itemId, uint256 issuedId)': {
    constant: true,
    inputs: [{ type: 'uint256', name: '_id' }],
    name: 'decodeTokenId',
    outputs: [
      { type: 'uint256', name: 'itemId' },
      { type: 'uint256', name: 'issuedId' }
    ],
    payable: false,
    type: 'function',
    stateMutability: 'pure'
  },
  // TODO: test this with real ABI and integration tests
  'function bar(tuple(uint256,uint256)) returns (tuple(bool a,bool b))': {
    constant: false,
    inputs: [
      {
        components: [
          {
            name: '',
            type: 'uint256'
          },
          {
            name: '',
            type: 'uint256'
          }
        ],
        name: '',
        type: 'tuple'
      }
    ],
    name: 'bar',
    outputs: [
      {
        components: [
          {
            name: 'a',
            type: 'bool'
          },
          {
            name: 'b',
            type: 'bool'
          }
        ],
        name: '',
        type: 'tuple'
      }
    ],
    payable: false,
    type: 'function'
  }
}

describe('parser', function () {
  for (let test in suite) {
    it(`converts "${test}" to an object`, () => {
      expect(parseSignature(test)).toEqual(suite[test])
    })
  }
})
