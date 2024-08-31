class ApplicantsRepository {
  constructor(client) {
    this.client = client;
  }

  #tableName = process.env.APPLICANTS_TABLE_NAME;

  async createApplicant(applicant) {
    try {
      return await this.client.put({
        TableName: this.#tableName,
        Item: {
          ...applicant,
          createdAt: new Date().toISOString(),
          ttl: Math.floor(Date.now() / 1000) + 60,
        },
      });
    } catch (error) {
      throw new Error("failed to create applicant");
    }
  }

  async getApplicantById(applicantId) {
    try {
      const { Item } = await this.client.get({
        TableName: this.#tableName,
        Key: { applicantId },
      });

      return Item;
    } catch (error) {
      throw new Error("failed to get applicant");
    }
  }

  async deleteApplicantById(applicantId) {
    try {
      return await this.client.delete({
        TableName: this.#tableName,
        Key: { applicantId },
      });
    } catch (error) {
      throw new Error("failed to delete applicant");
    }
  }
}

module.exports = ApplicantsRepository;
