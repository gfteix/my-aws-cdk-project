import { StatusCodes } from "http-status-codes";
import { ErrorBase } from "./error-base";

export class NotFoundError extends ErrorBase {
    constructor (functionName: string, message: string) {
      super(
        StatusCodes.NOT_FOUND, 
        functionName, 
        message
      )
    }
}
  