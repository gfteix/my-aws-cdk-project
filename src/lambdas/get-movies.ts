

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { myMiddleware } from '../middleware';
import { StatusCodes } from 'http-status-codes';

//global, to be chared across close calls
const client = new DynamoDBClient({});
const dynamo = DynamoDBDocumentClient.from(client);
const tableName = "movies-dynamodb";

export async function getMovies(event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> {
    const output = await dynamo.send(
        new ScanCommand({ TableName: tableName })
    );

    return {
      body: JSON.stringify(output.Items),
      statusCode: StatusCodes.OK,
      headers: {
        'content-type': 'application/json'
      }
    }
}

export const handler = myMiddleware(getMovies)
