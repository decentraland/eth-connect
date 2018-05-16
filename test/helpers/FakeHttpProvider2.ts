import { FakeHttpProvider } from './FakeHttpProvider'

export class FakeHttpProvider2 extends FakeHttpProvider {
  counter = 0
  resultList = []

  constructor() {
    super()
    this.counter = 0
    this.resultList = []
  }

  injectResultList(list) {
    this.resultList = list
  }

  getResponse() {
    let result = this.resultList[this.counter]
    this.counter++

    // add fallback result value
    if (!result) {
      result = {
        result: undefined
      }
    }

    if (result.type === 'batch') {
      this.injectBatchResults(result.result)
    } else {
      this.injectResult(result.result)
    }

    this.counter = 0

    return this.response
  }
}
