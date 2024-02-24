/* eslint-disable no-new */
import { Duration, RemovalPolicy, Stack, type StackProps } from 'aws-cdk-lib'
import { ApiKey, LambdaIntegration, MethodLoggingLevel, RestApi, UsagePlan } from 'aws-cdk-lib/aws-apigateway'
import { AttributeType, BillingMode, Table } from 'aws-cdk-lib/aws-dynamodb'
import { Runtime } from 'aws-cdk-lib/aws-lambda'
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs'
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
    const upsertIntegration = new LambdaIntegration(functions.upsertMovieFunction)
    const getIntegration = new LambdaIntegration(functions.getMoviesFunction)
    const deleteIntegration = new LambdaIntegration(functions.deleteMovieFunction)

    const apiKey = new ApiKey(this, `ApiKey${this.currentEnv}`, {
      apiKeyName: `movies-api-key-${this.currentEnv}`
    })

    const restApi = new RestApi(this, `ApiGateway-${this.currentEnv}`, {
      restApiName: `movie-api-${this.currentEnv}`,
      deployOptions: {
        metricsEnabled: true,
        loggingLevel: MethodLoggingLevel.ERROR,
        dataTraceEnabled: true,
        stageName: this.currentEnv
      },
      cloudWatchRole: true,
      cloudWatchRoleRemovalPolicy: RemovalPolicy.DESTROY
    })

    const usagePlan = new UsagePlan(this, `UsagePlan-${this.currentEnv}`, {
      name: `Usage Plan-${this.currentEnv}`,
      apiStages: [
        {
          api: restApi,
          stage: restApi.deploymentStage
        }
      ]
    })

    usagePlan.addApiKey(apiKey)

    const movies = restApi.root.addResource('movies')

    movies.addMethod('GET', getIntegration, { apiKeyRequired: true })
    movies.addMethod('POST', upsertIntegration, { apiKeyRequired: true })
    movies.addMethod('PUT', upsertIntegration, { apiKeyRequired: true })

    const movie = movies.addResource('{id}')

    movie.addMethod('GET', getIntegration, { apiKeyRequired: true })
    movie.addMethod('DELETE', deleteIntegration, { apiKeyRequired: true })
  }
}
