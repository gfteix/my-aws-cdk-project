import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { type APIGatewayProxyEvent, type APIGatewayProxyResult, type Context } from 'aws-lambda'
import { DynamoDBDocumentClient, GetCommand, ScanCommand } from '@aws-sdk/lib-dynamodb'
import { StatusCodes } from 'http-status-codes'

// global, to be chared across close calls
const client = new DynamoDBClient({})
const dynamo = DynamoDBDocumentClient.from(client)
const tableName = process.env.MOVIE_TABLE_URL

export async function handler (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> {
  const id = event.pathParameters?.id
  let response

  if (id != null) {
    const record = await getById(id)

    if (record == null) {
      return {
        body: JSON.stringify({
          message: `No record foud with id ${id}`
        }),
        statusCode: StatusCodes.NOT_FOUND,
        headers: {
          'content-type': 'application/json'
        }
      }
    }

    response = record
  } else {
    response = await getAll()
  }

  return {
    body: JSON.stringify(response),
    statusCode: StatusCodes.OK,
    headers: {
      'content-type': 'application/json'
    }
  }
}

async function getAll (): Promise<Array<Record<string, any>>> {
  const output = await dynamo.send(
    new ScanCommand({ TableName: tableName })
  )

  return output.Items ?? []
}
async function getById (id: string): Promise<Record<string, any> | undefined> {
  const output = await dynamo.send(
    new GetCommand({
      TableName: tableName,
      Key: {
        id
      }
    })
  )

  return output.Item
}
