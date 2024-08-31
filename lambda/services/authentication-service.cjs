const WebAuthnService = require("./webauthn-service.cjs");
const JSONError = require("../utils/json-error.cjs");

class AuthenticationService extends WebAuthnService {
  #applicantsRepository;
  #credentialsRepository;

  constructor(applicantsRepository, credentialsRepository) {
    super();

    this.#applicantsRepository = applicantsRepository;
    this.#credentialsRepository = credentialsRepository;
  }

  async request({ rpId }) {
    const session = this.generateSession();

    const publicKeyCredentialRequestOptions =
      await this.action.authentication.generate({ rpId });

    await this.#applicantsRepository.createApplicant({
      applicantId: session,
      type: "authentication",
      challenge: publicKeyCredentialRequestOptions.challenge,
    });

    return { session, publicKeyCredentialRequestOptions };
  }

  async response({ origin, rpId, session, publicKeyCredential }) {
    const applicant = await this.#applicantsRepository.getApplicantById(
      session
    );

    if (!applicant) {
      throw new JSONError("applicant not found", {
        statusCode: 404,
        title: "Error",
        instance: "/webauthn/registration/request",
      });
    }

    const credential = await this.#credentialsRepository.getCredentialbyId(
      publicKeyCredential.id
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
        publicKeyCredential,
        challenge: applicant.challenge,
        origin,
        rpId,
        credentialId: credential.credentialId,
        publicKey: credential.publicKey,
        counter: credential.counter,
        transports: credential.transports,
      });

    await this.#applicantsRepository.deleteApplicantById(session);

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
