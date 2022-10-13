require('dotenv').config();
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/users');

const {
  BAD_REQUEST_CODE,
  NOT_FOUND_CODE,
  BAD_REQUEST_MESSAGE,
} = require('../errors/errors');

const { NODE_ENV, JWT_SECRET } = process.env;

const { BadRequestError } = require('../errors/BadRequestError');
const { NotFoundError } = require('../errors/NotFoundError');
const { ConflictError } = require('../errors/ConflictError');
const { ValidationError } = require('../errors/ValidationError');

module.exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find({});
    res.send({ data: users });
  } catch (err) {
    next(err);
  }
};

module.exports.getUser = async (req, res, next) => {
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
      next(err);
    }
  }
};

module.exports.getMyInfo = async (req, res, next) => {
  try {
    const user = await User.findOne(req.user)
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
      next(err);
    }
  }
};

module.exports.createUser = async (req, res, next) => {
  try {
    const {
      email, password, name, about, avatar,
    } = req.body;

    // if (!email || !password) {
    //   throw new BadRequestError();
    // }

    if (!validator.isEmail(email)) {
      throw new ValidationError('Введите валидный email');
    }

    const dublicate = await User.find({ email });
    if (dublicate.length > 0) {
      throw new ConflictError('Пользователь с таким email уже существует');
    }

    const hash = await bcrypt.hash(password, 10);

    await User.create({
      email, password: hash, name, about, avatar,
    });

    res.send({
      data: {
        email, name, about, avatar,
      },
    });
  } catch (err) {
    if (err instanceof BadRequestError || err.name === 'ValidationError') {
      // 400
      res.status(BAD_REQUEST_CODE).send({ message: BAD_REQUEST_MESSAGE });
    } else {
      next(err);
    }
  }
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;

  return User.findUserByCredentials(email, password)
    .then((user) => {
      // создадим токен
      const token = jwt.sign(
        { _id: user._id },
        NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret',
        { expiresIn: '7d' },
      );

      res
        .cookie('jwt', token, {
          maxAge: 3600000 * 24 * 7,
          httpOnly: true,
          sameSite: true,
        })
        .end();
    })
    .catch(next);
};

module.exports.updateUser = async (req, res, next) => {
  try {
    const { name, about } = req.body;

    // if (!name || !about) {
    //   throw new BadRequestError('Не указано имя пользователя или описание.');
    // }

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
      next(err);
    }
  }
};

module.exports.updateAvatar = async (req, res, next) => {
  try {
    const { avatar } = req.body;

    // if (!avatar) {
    //   throw new BadRequestError('Не указана ссылка на аватар пользователя.');
    // }

    const user = await User.findByIdAndUpdate(req.user, { avatar }, {
      new: true,
      runValidators: true,
    })
      .orFail(new NotFoundError('Пользователь не найден.'));

    res.send({ data: user });
  } catch (err) {
    if (err instanceof BadRequestError || err.name === 'ValidationError') {
      // 400
      res.status(BAD_REQUEST_CODE).send({ message: err.message });
    } else if (err instanceof NotFoundError) {
      // 404
      res.status(NOT_FOUND_CODE).send({ message: err.message });
    } else {
      next(err);
    }
  }
};
