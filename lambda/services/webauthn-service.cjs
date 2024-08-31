const crypto = require("node:crypto");
const z = require("zod");
const { registration, authentication } = require("../utils/web-authn.cjs");

class WebAuthnService {
  schemas = {
    registration: {
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
    },
    authentication: {
      request: z.object({
        rpId: z.string().min(1),
      }),
      response: z.object({
        session: z.string().min(1),
        rpId: z.string().min(1),
        origin: z.string().min(1),
        publicKeyCredential: z.record(z.unknown()),
      }),
    },
  };

  action = {
    registration: registration,
    authentication: authentication,
  };

  generateSession(length = 10) {
    return crypto.randomBytes(length).toString("base64");
  }
}

module.exports = WebAuthnService;
