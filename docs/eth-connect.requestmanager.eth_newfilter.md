<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [eth-connect](./eth-connect.md) &gt; [RequestManager](./eth-connect.requestmanager.md) &gt; [eth\_newFilter](./eth-connect.requestmanager.eth_newfilter.md)

## RequestManager.eth\_newFilter property

Creates a filter object, based on filter options, to notify when the state changes (logs). To check if the state has changed, call eth\_getFilterChanges.

A note on specifying topic filters: Topics are order-dependent. A transaction with a log with topics \[A, B\] will be matched by the following topic filters:

\[\] "anything" \[A\] "A in first position (and anything after)" \[null, B\] "anything in first position AND B in second position (and anything after)" \[A, B\] "A in first position AND B in second position (and anything after)" \[\[A, B\], \[A, B\]\] "(A OR B) in first position AND (A OR B) in second position (and anything after)"

**Signature:**

```typescript
eth_newFilter: (options: FilterOptions) => Promise<Data>;
```
