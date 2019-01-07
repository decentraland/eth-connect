[Home](./index) &gt; [eth-connect](./eth-connect.md) &gt; [Contract](./eth-connect.contract.md)

# Contract class

Should be called to create new contract instance

## Properties

|  Property | Access Modifier | Type | Description |
|  --- | --- | --- | --- |
|  [`abi`](./eth-connect.contract.abi.md) |  | `any[]` |  |
|  [`address`](./eth-connect.contract.address.md) |  | `string` |  |
|  [`allEvents`](./eth-connect.contract.allevents.md) |  | `(options: FilterOptions) => Promise<EthFilter>` |  |
|  [`events`](./eth-connect.contract.events.md) |  | `{`<p/>`        [key: string]: EventFilterCreator;`<p/>`    }` |  |
|  [`requestManager`](./eth-connect.contract.requestmanager.md) |  | `RequestManager` |  |
|  [`transactionHash`](./eth-connect.contract.transactionhash.md) |  | `string` |  |

## Methods

|  Method | Access Modifier | Returns | Description |
|  --- | --- | --- | --- |
|  [`constructor(requestManager, abi, address)`](./eth-connect.contract.constructor.md) |  |  | Constructs a new instance of the [Contract](./eth-connect.contract.md) class |

