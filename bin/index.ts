#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { ApplicationStack } from '../stacks/application-stack';
import { GatewayStack } from '../stacks/gateway-stack';

const app = new cdk.App();

const application = new ApplicationStack(app, 'ApplicationStack', {
  env: { 
    account: process.env.CDK_DEFAULT_ACCOUNT, 
    region: process.env.CDK_DEFAULT_REGION 
  }
});

const gateway = new GatewayStack(app, 'GatewayStack', {
  env: { 
    account: process.env.CDK_DEFAULT_ACCOUNT, 
    region: process.env.CDK_DEFAULT_REGION 
  }
})

gateway.addDependency(application)

app.synth()
