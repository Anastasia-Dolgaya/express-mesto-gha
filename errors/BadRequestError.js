const { BAD_REQUEST_CODE } = require('./errors');

class BadRequestError extends Error {
  constructor(message) {
    super(message);
    this.name = 'BadRequestError';
    this.statusCode = BAD_REQUEST_CODE;
  }
}

module.exports = { BadRequestError };
