const { NotFoundError } = require('../errors/NotFoundError');

const notFoundController = (req, res, next) => {
  next(new NotFoundError('Страница не найдена'));
};

module.exports = { notFoundController };
