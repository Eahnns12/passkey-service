const cdk = require("aws-cdk-lib");
const { WebAuthnServiceStack } = require("../lib/stack.cjs");

const app = new cdk.App();
const stage = app.node.tryGetContext("stage") || "dev";
const suffix = stage === "dev" ? "Dev" : "Prod";

new WebAuthnServiceStack(app, `WebAuthnServiceStack-${suffix}`, {
  stage,
  suffix,
});
