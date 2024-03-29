<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [eth-connect](./eth-connect.md) &gt; [AbstractFilter](./eth-connect.abstractfilter.md)

## AbstractFilter class

**Signature:**

```typescript
export declare abstract class AbstractFilter<ReceivedLog, TransformedLog = ReceivedLog> 
```

## Constructors

|  Constructor | Modifiers | Description |
|  --- | --- | --- |
|  [(constructor)(requestManager)](./eth-connect.abstractfilter._constructor_.md) |  | Constructs a new instance of the <code>AbstractFilter</code> class |

## Properties

|  Property | Modifiers | Type | Description |
|  --- | --- | --- | --- |
|  [callbacks](./eth-connect.abstractfilter.callbacks.md) | <code>protected</code> | ((message: TransformedLog) =&gt; void)\[\] |  |
|  [filterId](./eth-connect.abstractfilter.filterid.md) | <code>protected</code> | [IFuture](./eth-connect.ifuture.md)<!-- -->&lt;[Data](./eth-connect.data.md)<!-- -->&gt; |  |
|  [formatter](./eth-connect.abstractfilter.formatter.md) |  | (x: ReceivedLog) =&gt; TransformedLog |  |
|  [isDisposed](./eth-connect.abstractfilter.isdisposed.md) |  | boolean |  |
|  [isStarted](./eth-connect.abstractfilter.isstarted.md) |  | boolean |  |
|  [requestManager](./eth-connect.abstractfilter.requestmanager.md) |  | [RequestManager](./eth-connect.requestmanager.md) |  |
|  [stopSemaphore](./eth-connect.abstractfilter.stopsemaphore.md) | <code>protected</code> | [IFuture](./eth-connect.ifuture.md)<!-- -->&lt;any&gt; |  |

## Methods

|  Method | Modifiers | Description |
|  --- | --- | --- |
|  [getChanges()](./eth-connect.abstractfilter.getchanges.md) | <p><code>protected</code></p><p><code>abstract</code></p> |  |
|  [getNewFilter()](./eth-connect.abstractfilter.getnewfilter.md) | <p><code>protected</code></p><p><code>abstract</code></p> |  |
|  [start()](./eth-connect.abstractfilter.start.md) |  |  |
|  [stop()](./eth-connect.abstractfilter.stop.md) |  |  |
|  [uninstall()](./eth-connect.abstractfilter.uninstall.md) | <p><code>protected</code></p><p><code>abstract</code></p> |  |
|  [watch(callback)](./eth-connect.abstractfilter.watch.md) |  |  |

