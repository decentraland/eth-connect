import { HTTPProvider, HTTPProviderOptions } from '../src/providers/HTTPProvider'

type SendResult = { err: Error | null; result: any }

function sendAsync(provider: HTTPProvider, payload: any): Promise<SendResult> {
  return new Promise((resolve) => {
    provider.sendAsync(payload, (err, result) => resolve({ err: err ?? null, result }))
  })
}

describe('when sending an async request through the HTTPProvider', () => {
  let fetchMock: jest.Mock
  let provider: HTTPProvider
  let payload: any

  beforeEach(() => {
    payload = { id: 1, method: 'eth_chainId', params: [] }
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('and the response is not ok', () => {
    describe('and the body can be read', () => {
      let text: jest.Mock

      beforeEach(() => {
        text = jest.fn().mockResolvedValue('{"error":"rate limited"}')
        fetchMock = jest.fn().mockResolvedValue({ ok: false, status: 429, text })
        provider = new HTTPProvider('http://localhost:8545', { fetch: fetchMock })
      })

      it('should drain the response body to release the connection', async () => {
        await sendAsync(provider, payload)

        expect(text).toHaveBeenCalledTimes(1)
      })

      it('should call back with an error carrying the response status', async () => {
        const { err } = await sendAsync(provider, payload)

        expect(err?.message).toContain('429')
      })

      it('should surface the server error detail in the error message', async () => {
        const { err } = await sendAsync(provider, payload)

        expect(err?.message).toContain('rate limited')
      })
    })

    describe('and reading the body fails', () => {
      let text: jest.Mock

      beforeEach(() => {
        text = jest.fn().mockRejectedValue(new Error('connection reset'))
        fetchMock = jest.fn().mockResolvedValue({ ok: false, status: 500, text })
        provider = new HTTPProvider('http://localhost:8545', { fetch: fetchMock })
      })

      it('should still call back with an error carrying the status', async () => {
        const { err } = await sendAsync(provider, payload)

        expect(err?.message).toContain('500')
      })
    })

    describe('and the fetch response has no text method', () => {
      beforeEach(() => {
        fetchMock = jest.fn().mockResolvedValue({ ok: false, status: 503 })
        provider = new HTTPProvider('http://localhost:8545', { fetch: fetchMock })
      })

      it('should still call back with an error carrying the status', async () => {
        const { err } = await sendAsync(provider, payload)

        expect(err?.message).toContain('503')
      })
    })
  })

  describe('and the response is ok', () => {
    let json: jest.Mock
    let text: jest.Mock

    beforeEach(() => {
      json = jest.fn().mockResolvedValue({ jsonrpc: '2.0', id: 1, result: '0x1' })
      text = jest.fn()
      fetchMock = jest.fn().mockResolvedValue({ ok: true, status: 200, json, text })
      provider = new HTTPProvider('http://localhost:8545', { fetch: fetchMock })
    })

    it('should consume the body via json', async () => {
      await sendAsync(provider, payload)

      expect(json).toHaveBeenCalledTimes(1)
    })

    it('should not read the body as text', async () => {
      await sendAsync(provider, payload)

      expect(text).not.toHaveBeenCalled()
    })

    it('should call back with the parsed result', async () => {
      const { result } = await sendAsync(provider, payload)

      expect(result.result).toBe('0x1')
    })
  })
})

describe('when configuring the fetch option', () => {
  describe('and the global native fetch is supplied', () => {
    it('should be accepted without a cast', () => {
      // This compiles only if the global native fetch (same WHATWG signature on web and
      // server) is assignable to the fetch option — the point of this change.
      const options: HTTPProviderOptions = { fetch: globalThis.fetch }

      expect(typeof options.fetch).toBe('function')
    })
  })

  describe('and a native-fetch component is supplied', () => {
    it('should be accepted without a cast', () => {
      // Mirrors the shape of native-fetch components such as @dcl/fetch-component.
      const fetchComponent: (url: string, init?: RequestInit) => Promise<Response> = globalThis.fetch
      const options: HTTPProviderOptions = { fetch: fetchComponent }

      expect(typeof options.fetch).toBe('function')
    })
  })
})
