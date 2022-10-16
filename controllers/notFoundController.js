const { NotFoundError } = require('../errors/NotFoundError');

module.exports.notFoundController = (req, res, next) => {
  next(new NotFoundError('Страница не найдена'));
};
