module.exports = (err, req, res, next) => {
  const { statusCode, message } = err;
  res.status(statusCode).send({ message: statusCode === 500 ? 'Неизвестная ошибка сервера' : message });
  next();
};
