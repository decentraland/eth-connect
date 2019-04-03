[Home](./index) &gt; [eth-connect](./eth-connect.md)

# eth-connect package

## Namespaces

|  Namespaces | Description |
|  --- | --- |
|  [`eth`](./eth-connect.eth.md) |  |

## Classes

|  Class | Description |
|  --- | --- |
|  [`Contract`](./eth-connect.contract.md) | Should be called to create new contract instance |
|  [`ContractFactory`](./eth-connect.contractfactory.md) | Should be called to create new ContractFactory instance |
|  [`HTTPProvider`](./eth-connect.httpprovider.md) | HttpProvider should be used to send rpc calls over http |
|  [`Method`](./eth-connect.method.md) |  |
|  [`Property`](./eth-connect.property.md) |  |
|  [`RequestManager`](./eth-connect.requestmanager.md) | It's responsible for passing messages to providers It's also responsible for polling the ethereum node for incoming messages Default poll timeout is 1 second |
|  [`WebSocketProvider`](./eth-connect.websocketprovider.md) |  |

## Functions

|  Function | Returns | Description |
|  --- | --- | --- |
|  [`extractDisplayName`](./eth-connect.extractdisplayname.md) | `string` | Should be called to get display name of contract function |
|  [`extractTypeName`](./eth-connect.extracttypename.md) | `string` | Should be called to get type name of contract function |
|  [`fromAscii`](./eth-connect.fromascii.md) | `string` | Should be called to get hex representation (prefixed by 0x) of ascii string |
|  [`fromDecimal`](./eth-connect.fromdecimal.md) | `string` | Converts value to it's hex representation |
|  [`fromUtf8`](./eth-connect.fromutf8.md) | `string` | Should be called to get hex representation (prefixed by 0x) of utf8 string |
|  [`fromWei`](./eth-connect.fromwei.md) | `string | BigNumberType` | Takes a number of wei and converts it to any other ether unit.<p/>Possible units are: SI Short SI Full Effigy Other - kwei femtoether babbage - mwei picoether lovelace - gwei nanoether shannon nano - -- microether szabo micro - -- milliether finney milli - ether -- -- - kether -- grand - mether - gether - tether |
|  [`getValueOfUnit`](./eth-connect.getvalueofunit.md) | `BigNumberType` | Returns value of unit in Wei |
|  [`isAddress`](./eth-connect.isaddress.md) | `boolean` | Checks if the given string is an address |
|  [`isArray`](./eth-connect.isarray.md) | `boolean` | Returns true if object is array, otherwise false |
|  [`isBigNumber`](./eth-connect.isbignumber.md) | `boolean` | Returns true if object is BigNumberType, otherwise false |
|  [`isBloom`](./eth-connect.isbloom.md) | `boolean` | Returns true if given string is a valid Ethereum block header bloom. |
|  [`isBoolean`](./eth-connect.isboolean.md) | `boolean` | Returns true if object is boolean, otherwise false |
|  [`isChecksumAddress`](./eth-connect.ischecksumaddress.md) | `boolean` | Checks if the given string is a checksummed address |
|  [`isFunction`](./eth-connect.isfunction.md) | `boolean` | Returns true if object is function, otherwise false |
|  [`isHex`](./eth-connect.ishex.md) | `boolean` | Converts value to it's decimal representation in string |
|  [`isJson`](./eth-connect.isjson.md) | `boolean` | Returns true if given string is valid json object |
|  [`isObject`](./eth-connect.isobject.md) | `boolean` | Returns true if object is Objet, otherwise false |
|  [`isStrictAddress`](./eth-connect.isstrictaddress.md) | `boolean` | Checks if the given string is strictly an address |
|  [`isString`](./eth-connect.isstring.md) | `value is string` | Returns true if object is string, otherwise false |
|  [`isTopic`](./eth-connect.istopic.md) | `boolean` | Returns true if given string is a valid log topic. |
|  [`padLeft`](./eth-connect.padleft.md) | `string` | Should be called to pad string to expected length |
|  [`padRight`](./eth-connect.padright.md) | `string` | Should be called to pad string to expected length |
|  [`sha3`](./eth-connect.sha3.md) | `any` |  |
|  [`toAddress`](./eth-connect.toaddress.md) | `any` | Transforms given string to valid 20 bytes-length addres with 0x prefix |
|  [`toArray`](./eth-connect.toarray.md) | `any[]` | Ensures the result will be an array |
|  [`toAscii`](./eth-connect.toascii.md) | `string` | Should be called to get ascii from it's hex representation |
|  [`toBigNumber`](./eth-connect.tobignumber.md) | `BigNumberType` | Takes an input and transforms it into an bignumber |
|  [`toBoolean`](./eth-connect.toboolean.md) | `boolean` | Converts value to it's boolean representation (x != 0) |
|  [`toChecksumAddress`](./eth-connect.tochecksumaddress.md) | `string` | Makes a checksum address |
|  [`toData`](./eth-connect.todata.md) | `string` | Converts value to it's hex representation in string |
|  [`toDecimal`](./eth-connect.todecimal.md) | `number` | Converts value to it's decimal representation in string |
|  [`toHex`](./eth-connect.tohex.md) | `string` | Auto converts any given value into it's hex representation.<p/>And even stringifys objects before. |
|  [`toNullDecimal`](./eth-connect.tonulldecimal.md) | `string | number | BigNumberType` | Converts value to it's decimal representation in string |
|  [`toTwosComplement`](./eth-connect.totwoscomplement.md) | `BigNumberType` | Takes and input transforms it into bignumber and if it is negative value, into two's complement |
|  [`toUtf8`](./eth-connect.toutf8.md) | `any` | Should be called to get utf8 from it's hex representation |
|  [`toWei`](./eth-connect.towei.md) | `string | BigNumberType` | Takes a number of a unit and converts it to wei.<p/>Possible units are: SI Short SI Full Effigy Other - kwei femtoether babbage - mwei picoether lovelace - gwei nanoether shannon nano - -- microether szabo micro - -- milliether finney milli - ether -- -- - kether -- grand - mether - gether - tether |
|  [`transformToFullName`](./eth-connect.transformtofullname.md) | `string` | Should be used to create full function/event name from json abi |

