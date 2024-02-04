import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { type APIGatewayProxyEvent, type APIGatewayProxyResult, type Context } from 'aws-lambda'
import { DynamoDBDocumentClient, GetCommand, ScanCommand } from '@aws-sdk/lib-dynamodb'
import { StatusCodes } from 'http-status-codes'
import { notFoundError } from '../error-responses/not-found-response'

// global, to be chared across close calls
const client = new DynamoDBClient({})
const dynamo = DynamoDBDocumentClient.from(client)

export async function handler (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> {
  const id = event.pathParameters?.id
  let response

  if (id != null) {
    const record = await getById(id)

    if (record == null) {
      return notFoundError(`No record foud with id ${id}`)
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
    new ScanCommand({ TableName: process.env.MOVIE_TABLE_URL })
  )

  return output.Items ?? []
}

async function getById (id: string): Promise<Record<string, any> | undefined> {
  const output = await dynamo.send(
    new GetCommand({
      TableName: process.env.MOVIE_TABLE_URL,
      Key: {
        id
      }
    })
  )

  return output.Item
}
