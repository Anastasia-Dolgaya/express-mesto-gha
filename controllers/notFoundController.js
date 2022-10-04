const { NOT_FOUND_CODE } = require('../errors/errors');

module.exports.notFoundController = (req, res) => {
  res.status(NOT_FOUND_CODE).send({ message: 'Страница не найдена' });
};
