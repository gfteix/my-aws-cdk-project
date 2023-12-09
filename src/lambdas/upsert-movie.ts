import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { PutCommand, DynamoDBDocumentClient, DeleteCommand, GetCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { myMiddleware } from '../middleware';
import { getValidBody } from '../get-body';
import { Movie, MovieSchema, PartialMovieSchema } from '../types/movie.interface';
import { StatusCodes } from 'http-status-codes';
import { BadRequestError } from '../errors/bad-request-error';


//global, to be chared across close calls
const client = new DynamoDBClient({});
const dynamo = DynamoDBDocumentClient.from(client);
const tableName = "movies-dynamodb";

export async function upsertMovie(event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> {

  const schema = event.httpMethod === 'POST' ? MovieSchema : PartialMovieSchema

  const payload = getValidBody<Movie>(schema, event.body)

    await dynamo.send(
      new PutCommand({
        TableName: tableName,
        Item: payload
      })
    )

    return {
      body: JSON.stringify({
        message: 'Movie Created'
      }),
      statusCode: StatusCodes.OK,
      headers: {
        'content-type': 'application/json'
      }
    }
}

export const handler = myMiddleware(upsertMovie)
