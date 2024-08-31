class CredentialsRepository {
  #tableName = process.env.CREDENTIALS_TABLE_NAME;

  constructor(client) {
    this.client = client;
  }

  async createCredential(credential) {
    try {
      return await this.client.put({
        TableName: this.#tableName,
        Item: {
          ...credential,
          createdAt: new Date().toISOString(),
          lastUsedAt: new Date().toISOString(),
        },
      });
    } catch (error) {
      throw new Error("failed to create credential");
    }
  }

  async getCredentialbyId(credentialId) {
    try {
      const { Item } = await this.client.get({
        TableName: this.#tableName,
        Key: { credentialId },
      });

      return Item;
    } catch (error) {
      throw new Error("failed to get credential");
    }
  }

  async queryCredentialsbyUserId(userId) {
    try {
      const { Items } = await this.client.query({
        TableName: this.#tableName,
        IndexName: "userIdIndex",
        KeyConditionExpression: "userId = :uid",
        ExpressionAttributeValues: {
          ":uid": userId,
        },
      });

      return Items;
    } catch (error) {
      throw new Error("failed to query credentials");
    }
  }

  async updateCredentialCounterbyId(credentialId, newCounter) {
    try {
      return await this.client.update({
        TableName: this.#tableName,
        Key: { credentialId },
        UpdateExpression: "set #c = :c, lastUsedAt = :l",
        ExpressionAttributeNames: { "#c": "counter" },
        ExpressionAttributeValues: {
          ":c": newCounter,
          ":l": new Date().toISOString(),
        },
      });
    } catch (error) {
      throw new Error("failed to update credential counter");
    }
  }
}

module.exports = CredentialsRepository;
