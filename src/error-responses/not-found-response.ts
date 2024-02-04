import { type APIGatewayProxyResult } from 'aws-lambda'
import { StatusCodes } from 'http-status-codes'

export const notFoundError = (message: string): APIGatewayProxyResult => ({
  body: JSON.stringify({
    message
  }),
  statusCode: StatusCodes.NOT_FOUND,
  headers: {
    'content-type': 'application/json'
  }

})
