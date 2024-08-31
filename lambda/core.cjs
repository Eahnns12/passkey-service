const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocument } = require("@aws-sdk/lib-dynamodb");
const {
  RegistrationService,
  AuthenticationService,
} = require("./services/index.cjs");
const {
  ApplicantsRepository,
  CredentialsRepository,
} = require("./repositories/index.cjs");

let db = null;
const instances = new WeakMap();
const repositories = new WeakMap();
const serviceDependencies = new Map([
  [RegistrationService, [ApplicantsRepository, CredentialsRepository]],
  [AuthenticationService, [ApplicantsRepository, CredentialsRepository]],
]);

function getInstance(service) {
  if (!db) {
    db = DynamoDBDocument.from(new DynamoDBClient());
  }

  if (!serviceDependencies.has(service)) {
    throw new Error(`unknown service: ${service.name}`);
  }

  if (!instances.has(service)) {
    const dependencies = serviceDependencies.get(service).map((repository) => {
      if (!repositories.has(repository)) {
        repositories.set(repository, new repository(db));
      }

      return repositories.get(repository);
    });

    const instance = new service(...dependencies);

    instances.set(service, instance);
  }

  return instances.get(service);
}

module.exports = { getInstance, RegistrationService, AuthenticationService };
