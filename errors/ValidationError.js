const { AUTH_ERROR_CODE } = require('./errors');

class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
    this.statusCode = AUTH_ERROR_CODE;
  }
}

module.exports = { ValidationError };
