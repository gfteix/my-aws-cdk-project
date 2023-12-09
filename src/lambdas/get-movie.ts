import { StatusCodes } from "http-status-codes";
import { myMiddleware } from "../middleware";
import { DeleteCommand, DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";
import { BadRequestError } from "../errors/bad-request-error";
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import { NotFoundError } from "../errors/not-found-error";

//global, to be chared across close calls
const client = new DynamoDBClient({});
const dynamo = DynamoDBDocumentClient.from(client);
const tableName = "movies-dynamodb";

export async function getMovie(event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> {
    const id = event.pathParameters?.id

    if(!id) {
        throw new BadRequestError(
            'deleteMovie',
            'No movie id'
        );
    }

    const output = await dynamo.send(
        new GetCommand({
          TableName: tableName,
          Key: {
            id
          },
        })
      );


      if(!output.Item) {
        throw new NotFoundError(
            'getMovie',
            'No item found'
        );
      }

    return {
        body: JSON.stringify(output.Item),
        statusCode: StatusCodes.OK,
        headers: {
            'content-type': 'application/json'
        }
    }
}

export const handler = myMiddleware(getMovie)

