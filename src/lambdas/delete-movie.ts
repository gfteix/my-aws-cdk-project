import { StatusCodes } from 'http-status-codes'
import { DeleteCommand, DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { type APIGatewayProxyEvent, type APIGatewayProxyResult, type Context } from 'aws-lambda'
import { badRequestError } from '../error-responses/bad-request-response'
import { internalError } from '../error-responses/internal-error-response'

// global, to be chared across close calls
const client = new DynamoDBClient({})
const dynamo = DynamoDBDocumentClient.from(client)

export async function deleteMovie (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> {
  try {
    const id = event.pathParameters?.id

    if (id == null) {
      return badRequestError('Invalid Id')
    }

    await dynamo.send(
      new DeleteCommand({
        TableName: process.env.MOVIE_TABLE_URL,
        Key: {
          id
        }
      })
    )

    return {
      body: JSON.stringify({
        message: `Movie with id ${id} successfully deleted`
      }),
      statusCode: StatusCodes.ACCEPTED,
      headers: {
        'content-type': 'application/json'
      }
    }
  } catch (error) {
    return internalError(`Internal Error - ${JSON.stringify(error)}`)
  }
}
