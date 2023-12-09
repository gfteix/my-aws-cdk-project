import { Stack, StackProps } from 'aws-cdk-lib';
import { LambdaIntegration, MethodLoggingLevel, RestApi } from 'aws-cdk-lib/aws-apigateway';
import { Function } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';


interface EndpointDefinition {
    functionName: string;
    path: string;
    method: string;
}

export class GatewayStack extends Stack {
    private api: RestApi

    constructor(scope: Construct, id: string, props?: StackProps) {
      super(scope, id, props);
  
      this.api = new RestApi(this, `ApiGateway`, {
        restApiName: `movie-api`,
        deployOptions: {
          metricsEnabled: true,
          loggingLevel: MethodLoggingLevel.INFO,
          dataTraceEnabled: true,
        },
        cloudWatchRole: true,
      })

      this.setEndpoints()
    }

    private setEndpoints(): void {
        const endpoints: EndpointDefinition[] = [
            {
              functionName: 'create-movie-fn',
              method: 'POST',
              path: 'movies'
            }
        ]

        endpoints.forEach(endpoint => {
            const fn =  Function.fromFunctionName(this, `import${endpoint.functionName}`, endpoint.functionName)        
            const resource = this.api.root.addResource(endpoint.path);
            resource.addMethod(
                endpoint.method,
                new LambdaIntegration(fn)
            );
        })
    }
  }
  