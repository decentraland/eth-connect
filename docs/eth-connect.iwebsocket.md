<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [eth-connect](./eth-connect.md) &gt; [IWebSocket](./eth-connect.iwebsocket.md)

## IWebSocket interface

**Signature:**

```typescript
export interface IWebSocket 
```

## Properties

|  Property | Modifiers | Type | Description |
|  --- | --- | --- | --- |
|  [onclose](./eth-connect.iwebsocket.onclose.md) |  | ((this: this, ev: any) =&gt; any) \| null |  |
|  [onerror](./eth-connect.iwebsocket.onerror.md) |  | ((this: this, ev: any) =&gt; any) \| null |  |
|  [onmessage](./eth-connect.iwebsocket.onmessage.md) |  | ((this: this, ev: any) =&gt; any) \| null |  |
|  [onopen](./eth-connect.iwebsocket.onopen.md) |  | ((this: this, ev: any) =&gt; any) \| null |  |

## Methods

|  Method | Description |
|  --- | --- |
|  [close(code, reason)](./eth-connect.iwebsocket.close.md) | Closes the WebSocket connection, optionally using code as the the WebSocket connection close code and reason as the the WebSocket connection close reason. |
|  [send(data)](./eth-connect.iwebsocket.send.md) | Transmits data using the WebSocket connection. data can be a string, a Blob, an ArrayBuffer, or an ArrayBufferView. |

