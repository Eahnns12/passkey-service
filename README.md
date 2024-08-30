# WebAuthn API

WebAuthn server-side implementation

## Registration Begin

Initializes the WebAuthn registration process, generating necessary challenges and parameters.

### Request

- Method: `POST`
- Path: `/webauthn/registration/request`
- Content-Type: `application/json`
- Headers: `X-Api-Key`

#### Request Body

| Field           | Type   | Required | Description                                                                        |
| --------------- | ------ | -------- | ---------------------------------------------------------------------------------- |
| userId          | String | no       | Unique identifier for the user MUST NOT contain personally identifying information |
| userName        | String | yes      | User's username or email address                                                   |
| userDisplayName | String | no       | A human-palatable name for the user account, intended only for display             |

### Response

- Content-Type: `application/json`

#### Response Body

| Field                              | Type   | Description                                          |
| ---------------------------------- | ------ | ---------------------------------------------------- |
| session                            | String | Session identifier to track the registration process |
| publicKeyCredentialCreationOptions | Object | Options and challenge for credential creation        |

## Registration Complete

Completes the WebAuthn registration process, verifying and storing the user's public key credential.

### Request

- Method: `POST`
- Path: `/webauthn/registration/response`
- Content-Type: `application/json`
- Headers: `X-Api-Key`

#### Request Body

| Field               | Type   | Required | Description                                          |
| ------------------- | ------ | -------- | ---------------------------------------------------- |
| session             | String | yes      | Session identifier from the registration begin step  |
| publicKeyCredential | Object | yes      | Contains client-generated public key credential info |

### Response

- Content-Type: `application/json`

#### Response Body

| Field    | Type    | Description                                             |
| -------- | ------- | ------------------------------------------------------- |
| verified | boolean | Indicates if the registration was successfully verified |
| userId   | string  | Unique identifier of the registered user                |

## Authentication Begin

Initializes the WebAuthn authentication process, generating authentication challenges and parameters.

### Request

- Method: `POST`
- Path: `/webauthn/authentication/request`
- Content-Type: `application/json`
- Headers: `X-Api-Key`

### Response

- Content-Type: `application/json`

#### Response Body

| Field                             | Type   | Description                                            |
| --------------------------------- | ------ | ------------------------------------------------------ |
| session                           | String | Session identifier to track the authentication process |
| publicKeyCredentialRequestOptions | Object | Options and challenge for authentication request       |

## Authentication Complete

Completes the WebAuthn authentication process, verifying the user's authentication assertion.

### Request

- Method: `POST`
- Path: `/webauthn/authentication/response`
- Content-Type: `application/json`
- Headers: `X-Api-Key`

#### Request Body

| Field               | Type   | Required | Description                                           |
| ------------------- | ------ | -------- | ----------------------------------------------------- |
| session             | String | yes      | Session identifier from the authentication begin step |
| publicKeyCredential | Object | yes      | Contains client-generated authentication assertion    |

### Response

- Content-Type: `application/json`

#### Response Body

| Field    | Type    | Description                                               |
| -------- | ------- | --------------------------------------------------------- |
| verified | boolean | Indicates if the authentication was successfully verified |
| userId   | string  | Unique identifier of the authenticated user               |
