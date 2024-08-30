const WebAuthnService = require("./webauthn-service.cjs");
const JSONError = require("../utils/json-error.cjs");

class AuthenticationService extends WebAuthnService {
  constructor(applicantsRepository, credentialsRepository) {
    super();

    this.#applicantsRepository = applicantsRepository;
    this.#credentialsRepository = credentialsRepository;
  }

  #applicantsRepository = null;
  #credentialsRepository = null;

  async request({ rpId }) {
    const validatedData = this.validate("authentication", "request", { rpId });

    const session = this.generateSession();

    const publicKeyCredentialRequestOptions =
      await this.action.authentication.generate({
        rpId: validatedData.rpId,
      });

    await this.#applicantsRepository.createApplicant({
      applicantId: session,
      type: "authentication",
      challenge: publicKeyCredentialRequestOptions.challenge,
    });

    return { session, publicKeyCredentialRequestOptions };
  }

  async response({ session, rpId, origin, publicKeyCredential }) {
    const validatedData = this.validate("authentication", "response", {
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

    const credential = await this.#credentialsRepository.getCredentialbyId(
      validatedData.publicKeyCredential.id
    );

    if (!credential) {
      throw new JSONError("credential not found", {
        statusCode: 404,
        title: "Error",
        instance: "/webauthn/authentication/response",
      });
    }

    const { verified, authenticationInfo } =
      await this.action.authentication.verify({
        publicKeyCredential: validatedData.publicKeyCredential,
        challenge: applicant.challenge,
        origin: validatedData.origin,
        rpId: validatedData.rpId,
        credentialId: credential.credentialId,
        publicKey: credential.publicKey,
        counter: credential.counter,
        transports: credential.transports,
      });

    await this.#applicantsRepository.deleteApplicantById(validatedData.session);

    if (!verified) {
      return { verified };
    }

    await this.#credentialsRepository.updateCredentialCounterbyId(
      credential.credentialId,
      authenticationInfo.newCounter
    );

    return { verified, userId: credential.userId };
  }
}
module.exports = AuthenticationService;
