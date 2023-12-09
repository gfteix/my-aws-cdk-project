import { StatusCodes } from 'http-status-codes'


export abstract class ErrorBase extends Error {
    constructor (
      readonly statusCode: StatusCodes,
      readonly message: string,
      readonly functionName: string
    ) {
      super(message)
    }
  }
