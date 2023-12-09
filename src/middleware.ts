import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import { ErrorBase } from "./errors/error-base";

type Handler = (event: APIGatewayProxyEvent, context: Context) => Promise<APIGatewayProxyResult>

export const myMiddleware = (handler: Handler) => async (event: APIGatewayProxyEvent, context: Context) => {
    let response: APIGatewayProxyResult = {
        statusCode: 500,
        body: 'Unhandled Error',
        headers: {
            'content-type': 'application/josn'
        }
    }

    try {
        console.log(event)

        const { body, statusCode } = await handler(event, context)

        response.body = body
        response.statusCode = statusCode

    } catch(error) {
        console.log(error)

        if(error instanceof ErrorBase) {
            response.statusCode = error.statusCode
            response.body = error.message
        }
    }

    console.log(response)

    return response
}