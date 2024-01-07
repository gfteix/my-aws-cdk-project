/* eslint-disable n/handle-callback-err */
import { type Context } from 'aws-lambda'

const mockedContext: Context = {
  callbackWaitsForEmptyEventLoop: false,
  functionName: 'mocked',
  functionVersion: 'mocked',
  invokedFunctionArn: 'mocked',
  memoryLimitInMB: 'mocked',
  awsRequestId: 'mocked',
  logGroupName: 'mocked',
  logStreamName: 'mocked',
  getRemainingTimeInMillis (): number {
    return 999
  },
  done (error?: Error, result?: any): void {},
  fail (error: Error | string): void {},
  succeed (messageOrObject: any): void {}
}

export { mockedContext }
