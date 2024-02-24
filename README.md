# AWS CDK application

This repository contains a simple API that allows CRUD operations on a Dynamodb table.

Technologies:
- AWS CDK as an IaC tool
- Node/Typescript
- AWS Lambda
- Dynamodb
- API Gateway

CI/CD Ready:
Every commit on any branch triggers unit tests and lint validation. Any commit to the dev or main branch triggers a deployment to AWS. Each environment has its own CDK stack.


Tasks:
- [x] Github Actions to deploy applications to AWS
- [x] Github Actions to run unit tests and lint for each commit
- [x] Improve deployment pipeline:
    - Merge into Dev Branch -> Deploy into Dev env
    - Merge into main branch -> Deploy to Prod environment
    - Requires approval to deploy to production
- [x] API Gateway
- [] Samples to run locally
- [] Unit tests
- [] Update deployment action to use OIDC instead of plain secrets