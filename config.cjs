const config = {
  dynamodb: {
    applicantsTable: {
      name: "WebAuthnApplicantsTable",
      partitionKey: { name: "applicantId" },
      timeToLiveAttribute: "ttl",
    },
    credentialsTable: {
      name: "WebAuthnCredentialsTable",
      partitionKey: { name: "credentialId" },
      gsi: { name: "userIdIndex", partitionKey: { name: "userId" } },
    },
  },
  lambda: {
    name: "WebAuthnLambdaFunction",
  },
  apiGateway: {
    name: "WebAuthnApiGateway",
    description: "WebAuthn Service API",
    cors: { allowHeaders: ["x-api-key"] },
  },
  apiKey: {
    name: "WebAuthnApiKey",
    description: "API Key for WebAuthn Service",
  },
  usagePlan: {
    name: "WebAuthnUsagePlan",
    description: "Standard usage plan for WebAuthn Service",
    throttle: {
      rateLimit: 10,
      burstLimit: 2,
    },
    quota: { limit: 1000 },
  },
};

module.exports = config;
