const {
  generateRegistrationOptions,
  verifyRegistrationResponse,
} = require("@simplewebauthn/server");
const { isoUint8Array } = require("@simplewebauthn/server/helpers");
const { default: JSONError } = require("./json-error.cjs");

const registration = {};

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

module.exports = { registration };
