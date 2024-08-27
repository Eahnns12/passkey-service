const { DynamoDB } = require("aws-sdk");

class CredentialsRepository {
  constructor() {
    this.db = new DynamoDB.DocumentClient();
  }

  #tableName = process.env.CREDENTIALS_TABLE_NAME;

  async createCredential(credential) {
    return await this.db
      .put({
        TableName: this.#tableName,
        Item: { ...credential },
      })
      .promise();
  }

  async queryCredentialbyUserID(userID) {
    return await this.db
      .query({
        TableName: this.#tableName,
        IndexName: "userIdIndex",
        KeyConditionExpression: "userID = :uid",
        ExpressionAttributeValues: {
          ":uid": userID,
        },
      })
      .promise();
  }
}

module.exports = CredentialsRepository;
