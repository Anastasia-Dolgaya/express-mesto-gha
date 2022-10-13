const { AUTH_ERROR_CODE } = require('./errors');

class AuthError extends Error {
  constructor(message) {
    super(message);
    this.name = 'AuthError';
    this.statusCode = AUTH_ERROR_CODE;
  }
}

module.exports = { AuthError };
