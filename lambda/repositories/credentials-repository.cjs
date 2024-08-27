const config = require("../config.cjs");

class CredentialsRepository {
  constructor(db) {
    this.db = db;
  }

  #tableName = config.dynamodb.tables.credentials.tableName;

  async createCredential(credential) {
    return await this.db
      .put({
        TableName: this.#tableName,
        Item: { ...credential },
      })
      .promise();
  }

  async queryCredentialbyUserId(userId) {
    const { Items } = await this.db
      .query({
        TableName: this.#tableName,
        IndexName: "userIdIndex",
        KeyConditionExpression: "userId = :uid",
        ExpressionAttributeValues: {
          ":uid": userId,
        },
      })
      .promise();

    return Items;
  }
}

module.exports = CredentialsRepository;
