const config = {
  dynamodb: {
    tables: {
      applicants: { tableName: process.env.APPLICANTS_TABLE_NAME },
      credentials: { tableName: process.env.CREDENTIALS_TABLE_NAME },
    },
    region: "",
  },
};

module.exports = config;
