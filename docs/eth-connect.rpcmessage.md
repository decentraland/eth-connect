<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [eth-connect](./eth-connect.md) &gt; [RPCMessage](./eth-connect.rpcmessage.md)

## RPCMessage type

**Signature:**

```typescript
export type RPCMessage = {
    jsonrpc: '2.0';
    id: number;
    method: string;
    params: any[] | {
        [key: string]: any;
    };
};
```
