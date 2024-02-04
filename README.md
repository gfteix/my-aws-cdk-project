# AWS CDK Application

Provisioning of a DynamoDB table and some lambdas for the CRUD operations
Allow deployment of resources to different environments by creating one Stack for each environment based on the CURRENT_ENV variable.

TODO: 
- (DONE) Github actions to deploy application to 
- (DONE) Github actions to run unit tests and lint for every commit pushed
- (DONE) Improve deploy pipeline:
    - Merge on Dev Branch -> Deploy on Dev env
    - Merge on Main Branch -> Deploy on prod env
    - Requires Approval to deploy to prod
- API Gateway
- Unit Tests
- Update Deploy action to use OIDC instead of plain secrets
