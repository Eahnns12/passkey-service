const assert = require("node:assert");
const test = require("node:test");
const { App } = require("aws-cdk-lib");
const { Template } = require("aws-cdk-lib/assertions");
const { WebAuthnServiceStack } = require("../lib/stack.cjs");

test("WebAuthnServiceStack", async (t) => {
  const app = new App();
  const stack = new WebAuthnServiceStack(app, "MyTestStack");
  const template = Template.fromStack(stack);

  await t.test("DynamoDB Tables Created", (t) => {
    template.resourceCountIs("AWS::DynamoDB::Table", 2);

    template.hasResourceProperties("AWS::DynamoDB::Table", {
      KeySchema: [
        {
          AttributeName: "applicantId",
          KeyType: "HASH",
        },
      ],
      AttributeDefinitions: [
        {
          AttributeName: "applicantId",
          AttributeType: "S",
        },
      ],
      BillingMode: "PAY_PER_REQUEST",
      TimeToLiveSpecification: {
        AttributeName: "ttl",
        Enabled: true,
      },
    });

    template.hasResourceProperties("AWS::DynamoDB::Table", {
      KeySchema: [
        {
          AttributeName: "credentialId",
          KeyType: "HASH",
        },
      ],
      AttributeDefinitions: [
        {
          AttributeName: "credentialId",
          AttributeType: "S",
        },
        {
          AttributeName: "userId",
          AttributeType: "S",
        },
      ],
      BillingMode: "PAY_PER_REQUEST",
      GlobalSecondaryIndexes: [
        {
          IndexName: "userIdIndex",
          KeySchema: [
            {
              AttributeName: "userId",
              KeyType: "HASH",
            },
          ],
          Projection: {
            ProjectionType: "ALL",
          },
        },
      ],
    });
  });

  await t.test("Lambda Function Created", (t) => {
    template.resourceCountIs("AWS::Lambda::Function", 1);

    template.hasResourceProperties("AWS::Lambda::Function", {
      Runtime: "nodejs20.x",
      Handler: "main.handler",
    });
  });

  await t.test("API Gateway Created", (t) => {
    template.resourceCountIs("AWS::ApiGateway::RestApi", 1);

    template.hasResourceProperties("AWS::ApiGateway::RestApi", {
      Name: "WebAuthn Service API",
    });
  });

  await t.test("API Gateway Resources Created", (t) => {
    template.resourceCountIs("AWS::ApiGateway::Resource", 5);
  });

  await t.test("API Gateway Methods Created", (t) => {
    template.resourceCountIs("AWS::ApiGateway::Method", 4);

    template.hasResourceProperties("AWS::ApiGateway::Method", {
      HttpMethod: "POST",
      ApiKeyRequired: true,
    });
  });

  await t.test("API Key Created", (t) => {
    template.resourceCountIs("AWS::ApiGateway::ApiKey", 1);

    template.hasResourceProperties("AWS::ApiGateway::ApiKey", {
      Name: "WebAuthn Service API Key",
    });
  });

  await t.test("Usage Plan Created", (t) => {
    template.resourceCountIs("AWS::ApiGateway::UsagePlan", 1);

    template.hasResourceProperties("AWS::ApiGateway::UsagePlan", {
      UsagePlanName: "WebAuthn Standard Usage Plan",
      Throttle: {
        RateLimit: 10,
        BurstLimit: 2,
      },
      Quota: {
        Limit: 1000,
        Period: "WEEK",
      },
    });
  });
});
