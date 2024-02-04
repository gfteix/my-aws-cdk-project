import { type APIGatewayProxyResult } from 'aws-lambda'
import { StatusCodes } from 'http-status-codes'

export const badRequestError = (message: string): APIGatewayProxyResult => ({
  body: JSON.stringify({
    message
  }),
  statusCode: StatusCodes.BAD_REQUEST,
  headers: {
    'content-type': 'application/json'
  }
})
