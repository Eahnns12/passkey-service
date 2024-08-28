const {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} = require("@simplewebauthn/server");
const { isoUint8Array } = require("@simplewebauthn/server/helpers");
const JSONError = require("./json-error.cjs");

const registration = {};
const authentication = {};

registration.generate = async function ({
  rpId,
  rpName,
  userId,
  userName,
  userDisplayName,
  excludeCredentials,
}) {
  try {
    const options = await generateRegistrationOptions({
      rpID: rpId,
      rpName: rpName || rpId,
      userID: isoUint8Array.fromUTF8String(userId || crypto.randomUUID()),
      userName: userName,
      userDisplayName: userDisplayName,
      timeout: 60000,
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

    return options;
  } catch (error) {
    throw new JSONError(error.message, {
      statusCode: 400,
      title: "WebAuthn Error",
    });
  }
};

registration.verify = async function ({
  publicKeyCredential,
  challenge,
  origin,
  rpId,
}) {
  try {
    const { verified, registrationInfo } = await verifyRegistrationResponse({
      response: publicKeyCredential,
      expectedChallenge: challenge,
      expectedRPID: rpId,
      expectedOrigin: origin,
      requireUserVerification: false,
    });

    return { verified, registrationInfo };
  } catch (error) {
    throw new JSONError(error.message, {
      statusCode: 400,
      title: "WebAuthn Error",
    });
  }
};

authentication.generate = async function ({ rpId }) {
  try {
    const options = await generateAuthenticationOptions({
      rpID: rpId,
      timeout: 600000,
    });

    return options;
  } catch (error) {
    throw new JSONError(error.message, {
      statusCode: 400,
      title: "WebAuthn Error",
    });
  }
};

authentication.verify = async function ({
  publicKeyCredential,
  challenge,
  origin,
  rpId,
  credentialId,
  publicKey,
  counter,
  transports,
}) {
  try {
    const { verified, authenticationInfo } = await verifyAuthenticationResponse(
      {
        response: publicKeyCredential,
        expectedChallenge: challenge,
        expectedOrigin: origin,
        expectedRPID: rpId,
        requireUserVerification: false,
        authenticator: {
          credentialID: credentialId,
          credentialPublicKey: publicKey,
          counter: counter,
          transports: transports,
        },
      }
    );

    return { verified, authenticationInfo };
  } catch (error) {
    throw new JSONError(error.message, {
      statusCode: 400,
      title: "WebAuthn Error",
    });
  }
};

module.exports = { registration, authentication };
