import { type APIGatewayProxyEventPathParameters, type APIGatewayProxyEvent } from 'aws-lambda'

const mockedEvent = (body?: string, pathParameters?: APIGatewayProxyEventPathParameters): APIGatewayProxyEvent => ({
  body: body ?? null,
  headers: {},
  multiValueHeaders: {},
  httpMethod: 'POST',
  isBase64Encoded: false,
  path: '/path/to/resource',
  pathParameters: pathParameters ?? null,
  queryStringParameters: null,
  multiValueQueryStringParameters: null,
  stageVariables: null,
  requestContext: {
    accountId: '123456789012',
    apiId: '1234567890',
    authorizer: {},
    protocol: 'HTTP/1.1',
    httpMethod: 'POST',
    identity: {
      accessKey: null,
      accountId: null,
      apiKey: null,
      apiKeyId: null,
      caller: null,
      clientCert: null,
      cognitoAuthenticationProvider: null,
      cognitoAuthenticationType: null,
      cognitoIdentityId: null,
      cognitoIdentityPoolId: null,
      principalOrgId: null,
      sourceIp: '127.0.0.1',
      userArn: null,
      userAgent: 'Custom User Agent String',
      user: null
    },
    path: '/prod/path/to/resource',
    stage: 'prod',
    requestId: 'c6af9ac6-7b61-11e6-9a41-93e8deadbeef',
    requestTime: '09/Apr/2015:12:34:56 +0000',
    requestTimeEpoch: 1428582896000,
    resourceId: '123456',
    resourcePath: '/{proxy+}'
  },
  resource: '/{proxy+}'
})

export { mockedEvent }
