import { Duration, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { AttributeType, BillingMode, Table } from 'aws-cdk-lib/aws-dynamodb';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';


export class ApplicationStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    new Table(this, "movies-dynamodb", {
      partitionKey: {
        name: "id",
        type: AttributeType.STRING,
      },
      billingMode: BillingMode.PROVISIONED,
      removalPolicy: RemovalPolicy.DESTROY
    });

    new NodejsFunction(this, 'CreateMovie', {
      entry: '',
      functionName: `create-movie-fn`,
      handler: 'handler',
      memorySize: 512,
      environment: {
      //  DATABASE_URL: process.env.DATABASE_URL,
      },
      runtime: Runtime.NODEJS_18_X,
      timeout: Duration.seconds(10),
      bundling: {
        target: 'es2020',
      }
    })
  }
}
