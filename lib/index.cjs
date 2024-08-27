const { Stack, Fn, RemovalPolicy } = require("aws-cdk-lib");
const lambda = require("aws-cdk-lib/aws-lambda");
const apigateway = require("aws-cdk-lib/aws-apigateway");
const dynamodb = require("aws-cdk-lib/aws-dynamodb");

class PasskeyServiceStack extends Stack {
  constructor(scope, id, props) {
    super(scope, id, props);

    const challengesTable = new dynamodb.Table(this, "ChallengesTable", {
      partitionKey: {
        name: "challengeID",
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.DESTROY,
      timeToLiveAttribute: "ttl",
    });

    const credentialsTable = new dynamodb.Table(this, "CredentialsTable", {
      partitionKey: {
        name: "credentialID",
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: { name: "userID", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    credentialsTable.addGlobalSecondaryIndex({
      indexName: "userIdIndex",
      partitionKey: { name: "userID", type: dynamodb.AttributeType.STRING },
    });

    const passkeyFunction = new lambda.Function(this, "PasskeyHandler", {
      runtime: lambda.Runtime.NODEJS_20_X,
      code: lambda.Code.fromAsset("lambda"),
      handler: "index.handler",
      environment: {
        CHALLENGES_TABLE_NAME: challengesTable.tableName,
        CREDENTIALS_TABLE_NAME: credentialsTable.tableName,
      },
    });

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

    const passkeyHandler = new apigateway.LambdaIntegration(passkeyFunction);

    passkeyApi.root.addMethod("GET", passkeyHandler);
    passkeyApi.root.addMethod("POST", passkeyHandler);

    const registrationApi = passkeyApi.root.addResource("registration");
    registrationApi.addResource("request").addMethod("POST", passkeyHandler);
    registrationApi.addResource("response").addMethod("POST", passkeyHandler);

    const authenticationApi = passkeyApi.root.addResource("authentication");
    authenticationApi.addResource("request").addMethod("POST", passkeyHandler);
    authenticationApi.addResource("response").addMethod("POST", passkeyHandler);

    challengesTable.grantReadWriteData(passkeyFunction);
    credentialsTable.grantReadWriteData(passkeyFunction);
  }
}

module.exports = { PasskeyServiceStack };
