import * as errors from './errors';

export function getAddress(address: string): string {
  if (typeof address !== 'string') {
    errors.throwError('invalid address', errors.INVALID_ARGUMENT, { arg: 'address', value: address });
  }

  if (address.trim().match(/^(0x)?[0-9a-fA-F]{40}$/)) {
    // Missing the 0x prefix
    if (address.trim().substring(0, 2) !== '0x') {
      address = '0x' + address;
    }

    return address.trim();
  } else {
    return errors.throwError('invalid address', errors.INVALID_ARGUMENT, { arg: 'address', value: address });
  }
}
