#!/usr/bin/env node
/* eslint-disable no-new */
import 'source-map-support/register'
import * as cdk from 'aws-cdk-lib'
import { MainStack } from './main-stack'

const app = new cdk.App()

const env = process.env.CURRENT_ENV ?? ''
const validEnvs = ['dev', 'prod']

if (!validEnvs.includes(env)) {
  throw new Error('Invalid env: ' + env)
}

new MainStack(app, `main-stack-${process.env.CURRENT_ENV}`, {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION
  }
})

app.synth()
