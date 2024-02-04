import { StatusCodes } from 'http-status-codes'
import { DeleteCommand, DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { type APIGatewayProxyEvent, type APIGatewayProxyResult, type Context } from 'aws-lambda'

// global, to be chared across close calls
const client = new DynamoDBClient({})
const dynamo = DynamoDBDocumentClient.from(client)

const badRequestResponse = (message: string): APIGatewayProxyResult => ({
  body: JSON.stringify({
    message
  }),
  statusCode: StatusCodes.BAD_REQUEST,
  headers: {
    'content-type': 'application/json'
  }
})

export async function deleteMovie (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> {
  try {
    const id = event.pathParameters?.id

    if (id == null) {
      return badRequestResponse('Invalid Id')
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
    return {
      body: JSON.stringify({
        message: `Internal Error - ${JSON.stringify(error)}`
      }),
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      headers: {
        'content-type': 'application/json'
      }
    }
  }
}
