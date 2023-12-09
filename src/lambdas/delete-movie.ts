import { StatusCodes } from "http-status-codes";
import { myMiddleware } from "../middleware";
import { DeleteCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { BadRequestError } from "../errors/bad-request-error";
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";

//global, to be chared across close calls
const client = new DynamoDBClient({});
const dynamo = DynamoDBDocumentClient.from(client);
const tableName = "movies-dynamodb";

export async function deleteMovie(event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> {
    const id = event.pathParameters?.id

    if(!id) {
        throw new BadRequestError(
            'deleteMovie',
            'No movie id'
        );
    }

    await dynamo.send(
        new DeleteCommand({
          TableName: tableName,
          Key: {
            id
          },
        })
      );


    return {
        body: JSON.stringify({ 
            message: `Movie with id ${ id } successfully deleted` 
        }),
        statusCode: StatusCodes.OK,
        headers: {
            'content-type': 'application/json'
        }
    }
}

export const handler = myMiddleware(deleteMovie)

