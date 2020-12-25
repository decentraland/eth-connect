<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [eth-connect](./eth-connect.md) &gt; [Method](./eth-connect.method.md)

## Method class


<b>Signature:</b>

```typescript
export declare class Method<V> 
```

## Constructors

|  Constructor | Modifiers | Description |
|  --- | --- | --- |
|  [(constructor)(options)](./eth-connect.method._constructor_.md) |  | Constructs a new instance of the <code>Method</code> class |

## Properties

|  Property | Modifiers | Type | Description |
|  --- | --- | --- | --- |
|  [callName](./eth-connect.method.callname.md) |  | string |  |
|  [inputFormatter](./eth-connect.method.inputformatter.md) |  | Function\[\] \| null |  |
|  [outputFormatter](./eth-connect.method.outputformatter.md) |  | (something: any) =&gt; V |  |
|  [params](./eth-connect.method.params.md) |  | number |  |
|  [requestManager](./eth-connect.method.requestmanager.md) |  | [RequestManager](./eth-connect.requestmanager.md) |  |

## Methods

|  Method | Modifiers | Description |
|  --- | --- | --- |
|  [execute(requestManager, args)](./eth-connect.method.execute.md) |  |  |
|  [formatInput(args)](./eth-connect.method.formatinput.md) |  | Should be called to format input args of method |
|  [formatOutput(result)](./eth-connect.method.formatoutput.md) |  | Should be called to format output(result) of method |
|  [toPayload(args)](./eth-connect.method.topayload.md) |  | Should create payload from given input args |
|  [validateArgs(args)](./eth-connect.method.validateargs.md) |  | Should be called to check if the number of arguments is correct |
