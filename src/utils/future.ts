export type IFuture<T> = Promise<T> & {
  resolve: (x: T) => void
  reject: (x: Error) => void
  finally: (fn: () => void) => void
  isPending: boolean
}

export function future<T = any>(): IFuture<T> {
  let resolver: (x: T) => void = (_: T) => {
    throw new Error('Error initilizing mutex')
  }
  let rejecter: (x: Error) => void = (x: Error) => {
    throw x
  }

  const promise: any = new Promise((ok, err) => {
    resolver = ok
    rejecter = err
  })

  promise.then(() => (promise.isPending = false))
  promise.catch(() => (promise.isPending = false))

  promise.resolve = resolver
  promise.reject = rejecter

  if (!('finally' in promise)) {
    promise.finally = fn => {
      promise.then(fn)
      promise.catch(fn)
    }
  }

  promise.isPending = true

  return promise as IFuture<T>
}
