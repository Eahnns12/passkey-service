const { Stack } = require("aws-cdk-lib");
const lambda = require("aws-cdk-lib/aws-lambda");
const apigateway = require("aws-cdk-lib/aws-apigateway");
const dynamodb = require("aws-cdk-lib/aws-dynamodb");

class PasskeyServiceStack extends Stack {
  constructor(scope, id, props) {
    super(scope, id, props);

    const table = new dynamodb.Table(this, "CredencialsTable", {
      partitionKey: { name: "id", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    });

    const handler = new lambda.Function(this, "PasskeyHandler", {
      runtime: lambda.Runtime.NODEJS_20_X,
      code: lambda.Code.fromAsset("lambda"),
      handler: "index.handler",
      environment: {
        CREDENCIALS_TABLE_NAME: table.tableName,
      },
    });

    const lambdaFunction = new apigateway.LambdaIntegration(handler);

    const api = new apigateway.RestApi(this, "PasskeyApi", {
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowHeaders: apigateway.Cors.DEFAULT_HEADERS,
        allowMethods: ["POST"],
        allowCredentials: false,
      },
    });

    const registration = api.root.addResource("registration");
    registration.addResource("request").addMethod("POST", lambdaFunction);
    registration.addResource("response").addMethod("POST", lambdaFunction);

    const authentication = api.root.addResource("authentication");
    authentication.addResource("request").addMethod("POST", lambdaFunction);
    authentication.addResource("response").addMethod("POST", lambdaFunction);

    table.grantReadWriteData(handler);
  }
}

module.exports = { PasskeyServiceStack };
