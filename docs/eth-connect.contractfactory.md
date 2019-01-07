[Home](./index) &gt; [eth-connect](./eth-connect.md) &gt; [ContractFactory](./eth-connect.contractfactory.md)

# ContractFactory class

Should be called to create new ContractFactory instance

## Properties

|  Property | Access Modifier | Type | Description |
|  --- | --- | --- | --- |
|  [`abi`](./eth-connect.contractfactory.abi.md) |  | `any[]` |  |
|  [`requestManager`](./eth-connect.contractfactory.requestmanager.md) |  | `RequestManager` |  |

## Methods

|  Method | Access Modifier | Returns | Description |
|  --- | --- | --- | --- |
|  [`constructor(requestManager, abi)`](./eth-connect.contractfactory.constructor.md) |  |  | Constructs a new instance of the [ContractFactory](./eth-connect.contractfactory.md) class |
|  [`at(address)`](./eth-connect.contractfactory.at.md) |  | `Promise<Contract>` | Should be called to get access to existing contract on a blockchain |
|  [`deploy(param1, param2, options)`](./eth-connect.contractfactory.deploy.md) |  | `Promise<Contract>` | Should be called to create new contract on a blockchain |
|  [`getData(args)`](./eth-connect.contractfactory.getdata.md) |  | `Promise<Data>` | Gets the data, which is data to deploy plus constructor params |

