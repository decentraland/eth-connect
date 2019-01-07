[Home](./index) &gt; [eth-connect](./eth-connect.md) &gt; [RequestManager](./eth-connect.requestmanager.md) &gt; [personal\_importRawKey](./eth-connect.requestmanager.personal_importrawkey.md)

# RequestManager.personal\_importRawKey property

Imports the given unencrypted private key (hex string) into the key store, encrypting it with the passphrase. Returns the address of the new account.

**Signature:**
```javascript
personal_importRawKey: (keydata: Data, passPhrase: Data) => Promise<Address>
```
