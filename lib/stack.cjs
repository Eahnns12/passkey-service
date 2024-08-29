const { Stack, RemovalPolicy } = require("aws-cdk-lib");
const lambda = require("aws-cdk-lib/aws-lambda");
const apigateway = require("aws-cdk-lib/aws-apigateway");
const dynamodb = require("aws-cdk-lib/aws-dynamodb");
const config = require("../config.cjs");

class WebAuthnServiceStack extends Stack {
  constructor(scope, id, props) {
    super(scope, id, props);

    const { env } = props;

    const applicantsTable = new dynamodb.Table(
      this,
      config.dynamodb.applicantsTable.name + env.stage,
      {
        partitionKey: {
          name: config.dynamodb.applicantsTable.partitionKey.name,
          type: dynamodb.AttributeType.STRING,
        },
        billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
        removalPolicy: RemovalPolicy.DESTROY,
        timeToLiveAttribute:
          config.dynamodb.applicantsTable.timeToLiveAttribute,
      }
    );

    const credentialsTable = new dynamodb.Table(
      this,
      config.dynamodb.credentialsTable.name + env.stage,
      {
        partitionKey: {
          name: config.dynamodb.credentialsTable.partitionKey.name,
          type: dynamodb.AttributeType.STRING,
        },
        billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
        removalPolicy: RemovalPolicy.DESTROY,
      }
    );

    credentialsTable.addGlobalSecondaryIndex({
      indexName: config.dynamodb.credentialsTable.gsi.name,
      partitionKey: {
        name: config.dynamodb.credentialsTable.gsi.partitionKey.name,
        type: dynamodb.AttributeType.STRING,
      },
    });

    const lambdaFunction = new lambda.Function(
      this,
      config.lambda.name + env.stage,
      {
        runtime: lambda.Runtime.NODEJS_20_X,
        code: lambda.Code.fromAsset("lambda"),
        handler: "main.handler",
        environment: {
          APPLICANTS_TABLE_NAME: applicantsTable.tableName,
          CREDENTIALS_TABLE_NAME: credentialsTable.tableName,
        },
      }
    );

    applicantsTable.grantReadWriteData(lambdaFunction);
    credentialsTable.grantReadWriteData(lambdaFunction);

    const lambdaIntegration = new apigateway.LambdaIntegration(lambdaFunction);

    const apiGateway = new apigateway.RestApi(
      this,
      config.apiGateway.name + env.stage,
      {
        restApiName: config.apiGateway.description,
        defaultCorsPreflightOptions: {
          allowOrigins: apigateway.Cors.ALL_ORIGINS,
          allowHeaders: [
            ...apigateway.Cors.DEFAULT_HEADERS,
            ...config.apiGateway.cors.allowHeaders,
          ],
          allowMethods: apigateway.Cors.ALL_METHODS,
          allowCredentials: true,
        },
        deployOptions: {
          stageName: env.stage,
        },
        removeDefaultStage: true,
      }
    );

    const webAuthnResource = apiGateway.root.addResource("webauthn");

    const registrationResource = webAuthnResource.addResource("registration");

    registrationResource
      .addResource("request")
      .addMethod("POST", lambdaIntegration, { apiKeyRequired: true });

    registrationResource
      .addResource("response")
      .addMethod("POST", lambdaIntegration, { apiKeyRequired: true });

    const authenticationResource =
      webAuthnResource.addResource("authentication");

    authenticationResource
      .addResource("request")
      .addMethod("POST", lambdaIntegration, { apiKeyRequired: true });

    authenticationResource
      .addResource("response")
      .addMethod("POST", lambdaIntegration, { apiKeyRequired: true });

    const apiKey = apiGateway.addApiKey(config.apiKey.name, {
      apiKeyName: config.apiKey.name,
      description: config.apiKey.description,
    });

    const usagePlan = apiGateway.addUsagePlan(config.usagePlan.name, {
      name: config.usagePlan.name,
      description: config.usagePlan.description,
      apiStages: [{ api: apiGateway, stage: apiGateway.deploymentStage }],
      throttle: {
        rateLimit: config.usagePlan.throttle.rateLimit,
        burstLimit: config.usagePlan.throttle.burstLimit,
      },
      quota: {
        limit: config.usagePlan.quota.limit,
        period: apigateway.Period.WEEK,
      },
    });

    usagePlan.addApiKey(apiKey);
  }
}

module.exports = { WebAuthnServiceStack };
