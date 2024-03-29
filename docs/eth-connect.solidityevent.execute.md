<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [eth-connect](./eth-connect.md) &gt; [SolidityEvent](./eth-connect.solidityevent.md) &gt; [execute](./eth-connect.solidityevent.execute.md)

## SolidityEvent.execute() method

Should be used to create new filter object from event

**Signature:**

```typescript
execute(indexed: Record<string, any>, options?: FilterOptions): Promise<EthFilter<LogObject>>;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  indexed | Record&lt;string, any&gt; |  |
|  options | [FilterOptions](./eth-connect.filteroptions.md) | _(Optional)_ |

**Returns:**

Promise&lt;[EthFilter](./eth-connect.ethfilter.md)<!-- -->&lt;[LogObject](./eth-connect.logobject.md)<!-- -->&gt;&gt;

