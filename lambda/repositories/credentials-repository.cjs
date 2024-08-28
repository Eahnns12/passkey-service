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
        Item: { ...credential, createdAt: new Date().toISOString() },
      })
      .promise();
  }

  async getCredentialbyId(credentialId) {
    const { Item } = await this.db
      .get({
        TableName: this.#tableName,
        Key: { credentialId },
      })
      .promise();

    return Item;
  }

  async queryCredentialsbyUserId(userId) {
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

  async updateCredentialCounterbyId(credentialId, newCounter) {
    return await this.db.update({
      TableName: this.#tableName,
      Key: { credentialId },
      UpdateExpression: "set counter = :c",
      ExpressionAttributeValues: { ":c": newCounter },
    });
  }
}

module.exports = CredentialsRepository;
