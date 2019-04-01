[Home](./index) &gt; [eth-connect](./eth-connect.md) &gt; [Method](./eth-connect.method.md)

# Method class

## Properties

|  Property | Access Modifier | Type | Description |
|  --- | --- | --- | --- |
|  [`callName`](./eth-connect.method.callname.md) |  | `string` |  |
|  [`inputFormatter`](./eth-connect.method.inputformatter.md) |  | `Function[] | null` |  |
|  [`outputFormatter`](./eth-connect.method.outputformatter.md) |  | `(something: any) => V` |  |
|  [`params`](./eth-connect.method.params.md) |  | `number` |  |
|  [`requestManager`](./eth-connect.method.requestmanager.md) |  | `RequestManager` |  |

## Methods

|  Method | Access Modifier | Returns | Description |
|  --- | --- | --- | --- |
|  [`constructor(options)`](./eth-connect.method.constructor.md) |  |  | Constructs a new instance of the [Method](./eth-connect.method.md) class |
|  [`execute(requestManager, args)`](./eth-connect.method.execute.md) |  | `Promise<V>` |  |
|  [`formatInput(args)`](./eth-connect.method.formatinput.md) |  | `any[]` | Should be called to format input args of method |
|  [`formatOutput(result)`](./eth-connect.method.formatoutput.md) |  | `V` | Should be called to format output(result) of method |
|  [`toPayload(args)`](./eth-connect.method.topayload.md) |  | `{`<p/>`        method: string;`<p/>`        params: any[];`<p/>`    }` | Should create payload from given input args |
|  [`validateArgs(args)`](./eth-connect.method.validateargs.md) |  | `void` | Should be called to check if the number of arguments is correct |

