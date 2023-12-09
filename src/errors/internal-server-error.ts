import { StatusCodes } from "http-status-codes";
import { ErrorBase } from "./error-base";

export class InternalServerError extends ErrorBase {
    constructor (functionName: string, message: string) {
      super(
        StatusCodes.INTERNAL_SERVER_ERROR, 
        functionName, 
        message
      )
    }
  }
  