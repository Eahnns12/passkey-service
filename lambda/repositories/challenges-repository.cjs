const { DynamoDB } = require("aws-sdk");

class ChallengesRepository {
  constructor() {
    this.db = new DynamoDB.DocumentClient();
  }

  #tableName = process.env.CHALLENGES_TABLE_NAME;

  async create(session, challenge) {
    const item = {
      challengeID: session,
      challenge,
      ttl: Math.floor(Date.now() / 1000) + 3000,
    };

    return await this.db
      .put({
        TableName: this.#tableName,
        Item: item,
      })
      .promise();
  }

  async get(session) {
    return await this.db
      .get({
        TableName: this.#tableName,
        Key: { challengeID: session },
      })
      .promise();
  }

  async delete(session) {
    return await this.db
      .delete({
        TableName: this.#tableName,
        Key: { challengeID: session },
      })
      .promise();
  }
}

module.exports = ChallengesRepository;
