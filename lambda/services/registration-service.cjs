const JSONError = require("../utils/json-error.cjs");
const WebAuthnService = require("./webauthn-service.cjs");

class RegistrationService extends WebAuthnService {
  constructor(applicantsRepository, credentialsRepository) {
    super();

    this.#applicantsRepository = applicantsRepository;
    this.#credentialsRepository = credentialsRepository;
  }

  #applicantsRepository = null;
  #credentialsRepository = null;

  async request({ rpId, rpName, userId, userName, userDisplayName }) {
    const validatedData = this.validate("registration", "request", {
      rpId,
      rpName,
      userId,
      userName,
      userDisplayName,
    });

    const excludeCredentials = await this.#getExcludeCredentials(
      validatedData.userId
    );

    const session = this.generateSession();

    const publicKeyCredentialCreationOptions =
      await this.action.registration.generate({
        rpId: validatedData.rpId,
        rpName: validatedData.rpName,
        userId: validatedData.userId,
        userName: validatedData.userName,
        userDisplayName: validatedData.userDisplayName,
        excludeCredentials,
      });

    await this.#applicantsRepository.createApplicant({
      applicantId: session,
      type: "registration",
      challenge: publicKeyCredentialCreationOptions.challenge,
      userId: publicKeyCredentialCreationOptions.user.id,
      userName: publicKeyCredentialCreationOptions.user.name,
      userDisplayName: publicKeyCredentialCreationOptions.user.displayName,
    });

    return { session, publicKeyCredentialCreationOptions };
  }

  async response({ session, rpId, origin, publicKeyCredential }) {
    const validatedData = this.validate("registration", "response", {
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
        instance: "/webauthn/registration/request",
      });
    }

    const { verified, registrationInfo } =
      await this.action.registration.verify({
        publicKeyCredential: validatedData.publicKeyCredential,
        challenge: applicant.challenge,
        origin: validatedData.origin,
        rpId: validatedData.rpId,
      });

    await this.#applicantsRepository.deleteApplicantById(validatedData.session);

    if (!verified) {
      return { verified };
    }

    const userId = Buffer.from(applicant.userId, "base64").toString("utf8");

    await this.#credentialsRepository.createCredential({
      credentialId: registrationInfo.credentialID,
      credentialType: registrationInfo.credentialType,
      publicKey: registrationInfo.credentialPublicKey,
      counter: registrationInfo.counter,
      deviceType: registrationInfo.credentialDeviceType,
      backedUp: registrationInfo.credentialBackedUp,
      transports: publicKeyCredential.response.transports,
      aaguid: registrationInfo.aaguid,
      origin: registrationInfo.origin,
      rpId: registrationInfo.rpID,
      userId: userId,
      userName: applicant.userName,
      userDisplayName: applicant.userDisplayName,
    });

    return { verified, userId };
  }

  async #getExcludeCredentials(userId) {
    const excludeCredentials = [];

    if (!userId) {
      return excludeCredentials;
    }

    const credentials =
      await this.#credentialsRepository.queryCredentialsbyUserId(userId);

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
}

module.exports = RegistrationService;
