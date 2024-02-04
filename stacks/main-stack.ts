import { Duration, RemovalPolicy, Stack, type StackProps } from 'aws-cdk-lib'
import { LambdaIntegration, MethodLoggingLevel, RestApi } from 'aws-cdk-lib/aws-apigateway'
import { AttributeType, BillingMode, Table } from 'aws-cdk-lib/aws-dynamodb'
import { Runtime } from 'aws-cdk-lib/aws-lambda'
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs'
import { type Construct } from 'constructs'
import { config } from 'dotenv'

config()

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

    // https://copyprogramming.com/howto/how-get-path-params-in-cdk-apigateway-lambda
    // https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_apigateway-readme.html

    const movies = restApi.root.addResource('movies')

    movies.addMethod('GET', new LambdaIntegration(
      getMoviesFunction
    ))

    movies.addMethod('POST', new LambdaIntegration(
      upsertMovieFunction
    ))

    movies.addMethod('PUT', new LambdaIntegration(
      upsertMovieFunction
    ))

    const movie = movies.addResource('{id}')

    movie.addMethod('GET', new LambdaIntegration(
      getMoviesFunction
    ))

    movie.addMethod('DELETE', new LambdaIntegration(
      deleteMovieFunction
    ))
  }
}
