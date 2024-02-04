import { Duration, RemovalPolicy, Stack, type StackProps } from 'aws-cdk-lib'
import { type RestApi } from 'aws-cdk-lib/aws-apigateway'
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

    dynamoTable.grantReadWriteData(upsertMovieFunction)
    dynamoTable.grantReadData(getMoviesFunction)
    /*
    this.api = new RestApi(this, `ApiGateway-${this.currentEnv}`, {
      restApiName: `movie-api-${this.currentEnv}`,
      deployOptions: {
        metricsEnabled: true,
        loggingLevel: MethodLoggingLevel.INFO,
        dataTraceEnabled: true
      },
      cloudWatchRole: true,
      cloudWatchRoleRemovalPolicy: RemovalPolicy.DESTROY
    })

    this.setEndpoints() */
  }
/*
  private setEndpoints (): void {
    const endpoints: EndpointDefinition[] = [
      {
        functionName: `upsert-movie-fn-${this.currentEnv}`,
        method: 'POST',
        path: 'movies'
      },
      {
        functionName: `delete-movie-fn-${this.currentEnv}`,
        method: 'DELETE',
        path: 'movie'
      },
      {
        functionName: `get-movies-fn-${this.currentEnv}`,
        method: 'GET',
        path: 'movies',
        pathParameters: '{id}'
      }
    ]

    endpoints.forEach(endpoint => {
      const fn = Function.fromFunctionName(this, `import${endpoint.functionName}`, endpoint.functionName)
      let resource = this.api.root.getResource(endpoint.path)

      if (resource == null) {
        resource = this.api.root.addResource(endpoint.path)
      }

      if (endpoint.pathParameters != null) {
        resource.addResource(endpoint.pathParameters)
        resource.addMethod(
          endpoint.method,
          new LambdaIntegration(fn)
        )
      } else {
        resource.addMethod(
          endpoint.method,
          new LambdaIntegration(fn)
        )
      }
    })
  } */
}
