const { Stack, Fn, RemovalPolicy } = require("aws-cdk-lib");
const lambda = require("aws-cdk-lib/aws-lambda");
const apigateway = require("aws-cdk-lib/aws-apigateway");
const dynamodb = require("aws-cdk-lib/aws-dynamodb");

class PasskeyServiceStack extends Stack {
  constructor(scope, id, props) {
    super(scope, id, props);

    const applicantsTable = new dynamodb.Table(this, "ApplicantsTable", {
      partitionKey: {
        name: "applicantId",
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.DESTROY,
      timeToLiveAttribute: "ttl",
    });

    const credentialsTable = new dynamodb.Table(this, "CredentialsTable", {
      partitionKey: {
        name: "credentialId",
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: { name: "userId", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    credentialsTable.addGlobalSecondaryIndex({
      indexName: "userIdIndex",
      partitionKey: { name: "userId", type: dynamodb.AttributeType.STRING },
    });

    const passkeyFunction = new lambda.Function(this, "PasskeyHandler", {
      runtime: lambda.Runtime.NODEJS_20_X,
      code: lambda.Code.fromAsset("lambda"),
      handler: "main.handler",
      environment: {
        APPLICANTS_TABLE_NAME: applicantsTable.tableName,
        CREDENTIALS_TABLE_NAME: credentialsTable.tableName,
      },
    });

    const passkeyHandler = new apigateway.LambdaIntegration(passkeyFunction);

    applicantsTable.grantReadWriteData(passkeyFunction);
    credentialsTable.grantReadWriteData(passkeyFunction);

    const passkeyApi = new apigateway.RestApi(this, "PasskeyApi", {
      restApiName: "Passkey Service Api",
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowHeaders: apigateway.Cors.DEFAULT_HEADERS,
        allowMethods: ["POST"],
        allowCredentials: true,
      },
      deployOptions: {
        stageName: "dev",
      },
      removeDefaultStage: true,
    });

    passkeyApi.root.addMethod("GET", passkeyHandler);
    passkeyApi.root.addMethod("POST", passkeyHandler);

    const registrationApi = passkeyApi.root.addResource("registration");
    registrationApi.addResource("request").addMethod("POST", passkeyHandler);
    registrationApi.addResource("response").addMethod("POST", passkeyHandler);

    const authenticationApi = passkeyApi.root.addResource("authentication");
    authenticationApi.addResource("request").addMethod("POST", passkeyHandler);
    authenticationApi.addResource("response").addMethod("POST", passkeyHandler);
  }
}

module.exports = { PasskeyServiceStack };
