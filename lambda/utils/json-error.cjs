class JSONError extends Error {
  constructor(message, { statusCode, title, type, instance }) {
    super(message);

    this.title = title;
    this.statusCode = statusCode;
    this.detail = message;
    this.type = type;
    this.instance = instance;
  }
}

module.exports = JSONError;
