const User = require('../models/users');
const {
  SERVER_ERROR_CODE,
  SERVER_ERROR_MESSAGE,
  BadRequestError,
  BAD_REQUEST_CODE,
  NOT_FOUND_CODE,
  NotFoundError,
  BAD_REQUEST_MESSAGE,
} = require('../errors/errors');

module.exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({});
    res.send({ data: users });
  } catch {
    res.status(SERVER_ERROR_CODE).send({ message: SERVER_ERROR_MESSAGE });
  }
};

module.exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .orFail(new NotFoundError('Пользователь не найден.'));

    res.send({ data: user });
  } catch (err) {
    if (err instanceof NotFoundError) {
      // 404
      res.status(NOT_FOUND_CODE).send({ message: err.message });
    } else if (err.name === 'CastError') {
      // 400
      const BadRequestErr = new BadRequestError('Передан некорректный id пользователя.');
      res.status(BAD_REQUEST_CODE).send({ message: BadRequestErr.message });
    } else {
      res.status(SERVER_ERROR_CODE).send({ message: SERVER_ERROR_MESSAGE });
    }
  }
};

module.exports.createUser = async (req, res) => {
  try {
    const { name, about, avatar } = req.body;
    if (!name || !about || !avatar) {
      throw new BadRequestError();
    }
    const user = await User.create({ name, about, avatar });
    res.send({ data: user });
  } catch (err) {
    if (err instanceof BadRequestError || err.name === 'ValidationError') {
      // 400
      res.status(BAD_REQUEST_CODE).send({ message: BAD_REQUEST_MESSAGE });
    } else {
      res.status(SERVER_ERROR_CODE).send({ message: SERVER_ERROR_MESSAGE });
    }
  }
};

module.exports.updateUser = async (req, res) => {
  try {
    const { name, about } = req.body;

    if (!name || !about) {
      throw new BadRequestError('Не указано имя пользователя или описание.');
    }

    const user = await User.findByIdAndUpdate(req.user, { name, about }, {
      new: true,
      runValidators: true,
    })
      .orFail(new NotFoundError('Пользователь не найден.'));

    res.send({ data: user });
  } catch (err) {
    if (err instanceof BadRequestError) {
      // 400
      res.status(BAD_REQUEST_CODE).send({ message: err.message });
    } else if (err instanceof NotFoundError) {
      // 404
      res.status(NOT_FOUND_CODE).send({ message: err.message });
    } else {
      res.status(SERVER_ERROR_CODE).send({ message: SERVER_ERROR_MESSAGE });
    }
  }
};

module.exports.updateAvatar = async (req, res) => {
  try {
    const { avatar } = req.body;

    if (!avatar) {
      throw new BadRequestError('Не указана ссылка на аватар пользователя.');
    }

    const user = await User.findByIdAndUpdate(req.user, { avatar }, {
      new: true,
      runValidators: true,
    })
      .orFail(new NotFoundError('Пользователь не найден.'));

    res.send({ data: user });
  } catch (err) {
    if (err instanceof BadRequestError) {
      // 400
      res.status(BAD_REQUEST_CODE).send({ message: err.message });
    } else if (err instanceof NotFoundError) {
      // 404
      res.status(NOT_FOUND_CODE).send({ message: err.message });
    } else {
      res.status(SERVER_ERROR_CODE).send({ message: SERVER_ERROR_MESSAGE });
    }
  }
};
