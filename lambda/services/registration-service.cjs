const crypto = require("node:crypto");
const {
  generateRegistrationOptions,
  verifyRegistrationResponse,
} = require("@simplewebauthn/server");
const {
  isoUint8Array,
  isoBase64URL,
} = require("@simplewebauthn/server/helpers");
const z = require("zod");
const ChallengesRepository = require("../repositories/challenges-repository.cjs");
const CredentialsRepository = require("../repositories/credentials-repository.cjs");

class RegistrationService {
  constructor() {
    this.#challengesRepository = new ChallengesRepository();
    this.#credentialsRepository = new CredentialsRepository();
  }

  #challengesRepository = null;

  #credentialsRepository = null;

  #schemas = {
    request: z.object({
      rpID: z.string().min(1),
      userID: z.string().nullable().default(null),
      userName: z.string().min(1),
      userDisplayName: z.string().nullable().optional().default(null),
    }),
    response: z.object({
      session: z.string().min(1),
      rpID: z.string().min(1),
      origin: z.string().min(1),
      publicKeyCredential: z.record(z.unknown()),
      user: z.object({
        id: z.string().min(1),
        name: z.string().min(1),
        displayName: z.string().nullable(),
      }),
    }),
  };

  async request({ rpID, userID, userName, userDisplayName }) {
    const data = this.#validate("request", {
      rpID,
      userID,
      userName,
      userDisplayName,
    });

    const excludeCredentials = [];

    if (userID) {
      const { Items: items, Count: count } =
        await this.#credentialsRepository.queryCredentialbyUserID(userID);

      if (count) {
        for (const item of items) {
          excludeCredentials.push({
            id: item.credentialID,
            type: "public-key",
            transports: item.transports,
          });
        }
      }
    }

    const session = crypto.randomBytes(8).toString("base64");

    const publicKeyCredentialCreationOptions =
      await generateRegistrationOptions({
        rpID: data.rpID,
        rpName: data.rpID,
        userID: isoUint8Array.fromUTF8String(
          data.userID || crypto.randomUUID()
        ),
        userName: data.userName,
        userDisplayName: data.userDisplayName,
        timeout: 30000,
        excludeCredentials,
        attestationType: "none",
        authenticatorSelection: {
          authenticatorAttachment: "platform",
          requireResidentKey: false,
          residentKey: "preferred",
          userVerification: "preferred",
        },
        extensions: null,
      });

    await this.#challengesRepository.create(
      session,
      publicKeyCredentialCreationOptions.challenge
    );

    return { session, publicKeyCredentialCreationOptions };
  }

  async response({ session, rpID, origin, publicKeyCredential, user }) {
    const data = this.#validate("response", {
      session,
      rpID,
      origin,
      publicKeyCredential,
      user,
    });

    const record = await this.#challengesRepository.get(data.session);

    const { verified, registrationInfo } = await verifyRegistrationResponse({
      response: data.publicKeyCredential,
      expectedChallenge: record.Item.challenge,
      expectedRPID: data.rpID,
      expectedOrigin: data.origin,
      requireUserVerification: false,
    });

    if (!verified) {
      throw new Error("Failed to vreify");
    }

    const credential = {
      credentialID: registrationInfo.credentialID,
      publicKey: registrationInfo.credentialPublicKey,
      counter: registrationInfo.counter,
      deviceType: registrationInfo.credentialDeviceType,
      backedUp: registrationInfo.credentialBackedUp,
      transports: publicKeyCredential.response.transports,
      userID: Buffer.from(user.id, "base64").toString("utf8"),
      userName: user.name,
      userDisplayName: user.displayName,
    };

    await this.#credentialsRepository.createCredential(credential);

    await this.#challengesRepository.delete(data.session);

    return { verified };
  }

  #validate(schema, data) {
    try {
      return this.#schemas[schema].parse(data);
    } catch (error) {
      const validateError = new Error();
      validateError.statusCode = 400;
      validateError.name = "Type Error";
      validateError.message = error.message;
      validateError.detail = error.issues;

      throw validateError;
    }
  }
}

module.exports = RegistrationService;
