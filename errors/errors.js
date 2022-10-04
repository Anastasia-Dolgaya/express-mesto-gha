const BAD_REQUEST_CODE = 400;
const NOT_FOUND_CODE = 404;
const SERVER_ERROR_CODE = 500;
const SERVER_ERROR_MESSAGE = 'На сервере произошла ошибка';

class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = 'NotFoundError';
    this.statusCode = NOT_FOUND_CODE;
  }
}

class BadRequestError extends Error {
  constructor(message) {
    super(message);
    this.name = 'BadRequestError';
    this.statusCode = BAD_REQUEST_CODE;
  }
}

module.exports = {
  BAD_REQUEST_CODE,
  NOT_FOUND_CODE,
  SERVER_ERROR_CODE,
  SERVER_ERROR_MESSAGE,
  NotFoundError,
  BadRequestError,
};
