const config = require("../config.cjs");

class ApplicantsRepository {
  constructor(db) {
    this.db = db;
  }

  #tableName = config.dynamodb.tables.applicants.tableName;

  async createApplicant({
    applicantId,
    challenge,
    userId,
    userName,
    userDisplayName,
  }) {
    return await this.db
      .put({
        TableName: this.#tableName,
        Item: {
          applicantId,
          challenge,
          userId,
          userName,
          userDisplayName,
          ttl: Math.floor(Date.now() / 1000) + 30,
        },
      })
      .promise();
  }

  async getApplicantById(applicantId) {
    const { Item } = await this.db
      .get({
        TableName: this.#tableName,
        Key: { applicantId },
      })
      .promise();

    return Item;
  }

  async deleteApplicantById(applicantId) {
    return await this.db
      .delete({
        TableName: this.#tableName,
        Key: { applicantId },
      })
      .promise();
  }
}

module.exports = ApplicantsRepository;
