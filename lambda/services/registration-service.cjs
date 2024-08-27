const crypto = require("node:crypto");
const z = require("zod");
const { registration } = require("../utils/web-authn.cjs");
const JSONError = require("../utils/json-error.cjs");

class RegistrationService {
  constructor(applicantsRepository, credentialsRepository) {
    this.#applicantsRepository = applicantsRepository;
    this.#credentialsRepository = credentialsRepository;
  }

  #applicantsRepository = null;
  #credentialsRepository = null;

  #schemas = {
    request: z.object({
      rpId: z.string().min(1),
      rpName: z.string().nullable().default(null),
      userId: z.string().nullable().default(null),
      userName: z.string().min(1),
      userDisplayName: z.string().nullable().optional().default(null),
    }),
    response: z.object({
      session: z.string().min(1),
      rpId: z.string().min(1),
      origin: z.string().min(1),
      publicKeyCredential: z.record(z.unknown()),
    }),
  };

  async request({ rpId, rpName, userId, userName, userDisplayName }) {
    const validatedData = this.#validate("request", {
      rpId,
      rpName,
      userId,
      userName,
      userDisplayName,
    });

    const excludeCredentials = await this.#getExcludeCredentials(
      validatedData.userId
    );

    const session = this.#generateSeesion();

    const publicKeyCredentialCreationOptions = await registration.generate({
      rpId: validatedData.rpId,
      rpName: validatedData.rpName,
      userId: validatedData.userId,
      userName: validatedData.userName,
      userDisplayName: validatedData.userDisplayName,
      excludeCredentials,
    });

    await this.#applicantsRepository.createApplicant({
      applicantId: session,
      challenge: publicKeyCredentialCreationOptions.challenge,
      userId: publicKeyCredentialCreationOptions.user.id,
      userName: publicKeyCredentialCreationOptions.user.name,
      userDisplayName: publicKeyCredentialCreationOptions.user.displayName,
    });

    return { session, publicKeyCredentialCreationOptions };
  }

  async response({ session, rpId, origin, publicKeyCredential }) {
    const validatedData = this.#validate("response", {
      session,
      rpId,
      origin,
      publicKeyCredential,
    });

    const applicant = await this.#applicantsRepository.getApplicantById(
      validatedData.session
    );

    if (!applicant) {
      throw new JSONError("applicant not found", {
        statusCode: 404,
        title: "Error",
        instance: "/registration/request",
      });
    }

    const { verified, registrationInfo } = await registration.verify({
      publicKeyCredential: validatedData.publicKeyCredential,
      challenge: applicant.challenge,
      origin: validatedData.origin,
      rpId: validatedData.rpId,
    });

    await this.#applicantsRepository.deleteApplicantById(validatedData.session);

    if (verified) {
      await this.#credentialsRepository.createCredential({
        credentialId: registrationInfo.credentialID,
        publicKey: registrationInfo.credentialPublicKey,
        counter: registrationInfo.counter,
        deviceType: registrationInfo.credentialDeviceType,
        backedUp: registrationInfo.credentialBackedUp,
        transports: publicKeyCredential.response.transports,
        userId: Buffer.from(applicant.userId, "base64").toString("utf8"),
        userName: applicant.userName,
        userDisplayName: applicant.userDisplayName,
      });
    }

    return { verified };
  }

  #generateSeesion(length = 8) {
    return crypto.randomBytes(length).toString("base64");
  }

  async #getExcludeCredentials(userId) {
    const excludeCredentials = [];

    if (!userId) {
      return excludeCredentials;
    }

    const credentials =
      await this.#credentialsRepository.queryCredentialbyUserId(userId);

    if (credentials.length) {
      for (const credential of credentials) {
        excludeCredentials.push({
          id: credential.credentialId,
          type: "public-key",
          transports: credential.transports,
        });
      }
    }

    return excludeCredentials;
  }

  #validate(schema, data) {
    try {
      return this.#schemas[schema].parse(data);
    } catch (error) {
      throw new JSONError(error.message, {
        statusCode: 400,
        title: "Validation Error",
      });
    }
  }
}

module.exports = RegistrationService;
