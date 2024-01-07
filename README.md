# AWS CDK Application

Provisioning of a DynamoDB table and some lambdas.
Allow deployment of resources to different environments (create one stack for each env based on the CURRENT_ENV variable)

TODO: 
- (DONE) Github actions to deploy every time a PR is merged with main
- API Gateway
- Unit Tests
- Update Deploy action to use OIDC instead of plain secrets
- Github actions to run unit tests and lint for every commit pushed
