/* eslint-disable no-new */
import { Duration, RemovalPolicy, Stack, type StackProps } from 'aws-cdk-lib'
import { AccessLogFormat, Deployment, LambdaIntegration, LogGroupLogDestination, MethodLoggingLevel, RestApi, Stage } from 'aws-cdk-lib/aws-apigateway'
import { AttributeType, BillingMode, Table } from 'aws-cdk-lib/aws-dynamodb'
import { Runtime } from 'aws-cdk-lib/aws-lambda'
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs'
import { LogGroup } from 'aws-cdk-lib/aws-logs'
import { type Construct } from 'constructs'
import { config } from 'dotenv'

config()

interface MainStackFunctions {
  upsertMovieFunction: NodejsFunction
  getMoviesFunction: NodejsFunction
  deleteMovieFunction: NodejsFunction
}

export class MainStack extends Stack {
  private readonly currentEnv: string
  private readonly api: RestApi

  constructor (scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props)

    this.currentEnv = process.env.CURRENT_ENV ?? 'local'

    const dynamoTable = new Table(this, `movies-dynamodb-${this.currentEnv}`, {
      tableName: `Movies-${this.currentEnv}`,
      partitionKey: {
        name: 'id',
        type: AttributeType.STRING
      },
      billingMode: BillingMode.PROVISIONED,
      removalPolicy: RemovalPolicy.DESTROY,
      readCapacity: 5,
      writeCapacity: 5
    })

    const upsertMovieFunction = new NodejsFunction(this, `UpsertMovie-${this.currentEnv}`, {
      entry: 'src/lambdas/upsert-movie.ts',
      functionName: `upsert-movie-fn-${this.currentEnv}`,
      handler: 'handler',
      memorySize: 512,
      environment: {
        MOVIE_TABLE_URL: dynamoTable.tableName,
        CURRENT_ENV: this.currentEnv
      },
      runtime: Runtime.NODEJS_18_X,
      timeout: Duration.seconds(10),
      bundling: {
        target: 'es2020'
      }
    })

    const getMoviesFunction = new NodejsFunction(this, `GetMovie-${this.currentEnv}`, {
      entry: 'src/lambdas/get-movies.ts',
      functionName: `get-movie-fn-${this.currentEnv}`,
      handler: 'handler',
      memorySize: 512,
      environment: {
        MOVIE_TABLE_URL: dynamoTable.tableName,
        CURRENT_ENV: this.currentEnv
      },
      runtime: Runtime.NODEJS_18_X,
      timeout: Duration.seconds(10),
      bundling: {
        target: 'es2020'
      }
    })

    const deleteMovieFunction = new NodejsFunction(this, `DeleteMovie-${this.currentEnv}`, {
      entry: 'src/lambdas/delete-movie.ts',
      functionName: `delete-movie-fn-${this.currentEnv}`,
      handler: 'handler',
      memorySize: 512,
      environment: {
        MOVIE_TABLE_URL: dynamoTable.tableName,
        CURRENT_ENV: this.currentEnv
      },
      runtime: Runtime.NODEJS_18_X,
      timeout: Duration.seconds(10),
      bundling: {
        target: 'es2020'
      }
    })

    dynamoTable.grantReadWriteData(upsertMovieFunction)
    dynamoTable.grantReadData(getMoviesFunction)
    dynamoTable.grantReadWriteData(deleteMovieFunction)

    this.buildApiGateway({
      getMoviesFunction,
      upsertMovieFunction,
      deleteMovieFunction
    })
  }

  buildApiGateway (functions: MainStackFunctions): void {
    const restApi = new RestApi(this, `ApiGateway-${this.currentEnv}`, {
      restApiName: `movie-api-${this.currentEnv}`,
      deployOptions: {
        metricsEnabled: true,
        loggingLevel: MethodLoggingLevel.INFO,
        dataTraceEnabled: true
      },
      cloudWatchRole: true,
      cloudWatchRoleRemovalPolicy: RemovalPolicy.DESTROY
    })

    const movies = restApi.root.addResource('movies')

    movies.addMethod('GET', new LambdaIntegration(
      functions.getMoviesFunction
    ))

    movies.addMethod('POST', new LambdaIntegration(
      functions.upsertMovieFunction
    ))

    movies.addMethod('PUT', new LambdaIntegration(
      functions.upsertMovieFunction
    ))

    const movie = movies.addResource('{id}')

    movie.addMethod('GET', new LambdaIntegration(
      functions.getMoviesFunction
    ))

    movie.addMethod('DELETE', new LambdaIntegration(
      functions.deleteMovieFunction
    ))

    const deployment = new Deployment(this, 'Deployment', { api: restApi })
    const deploymentLog = new LogGroup(this, `${this.currentEnv}-logs`)

    new Stage(this, this.currentEnv, {
      deployment,
      stageName: this.currentEnv,
      accessLogDestination: new LogGroupLogDestination(deploymentLog),
      accessLogFormat: AccessLogFormat.jsonWithStandardFields({
        caller: false,
        httpMethod: true,
        ip: true,
        protocol: true,
        requestTime: true,
        resourcePath: true,
        responseLength: true,
        status: true,
        user: true
      })
    })
  }
}
