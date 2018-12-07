process.on('unhandledRejection', (reason, promise) => {
  promise.catch((e: Error) => {
    console.error('unhandledRejection:', reason.toString())
    console.error('exception:', e)
    console.error('stack:', e.stack)
  })
})
