require('dotenv').config();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/users');

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
      // 404
      .orFail(new NotFoundError('Пользователь не найден.'));

    res.send({ data: user });
  } catch (err) {
    if (err.name === 'CastError') {
      // 400
      next(new BadRequestError('Передан некорректный id пользователя.'));
    } else {
      next(err);
    }
  }
};

module.exports.getMyInfo = async (req, res, next) => {
  try {
    const user = await User.findOne(req.user)
      // 404
      .orFail(new NotFoundError('Пользователь не найден.'));
    res.send({ data: user });
  } catch (err) {
    if (err.name === 'CastError') {
      // 400
      next(new BadRequestError('Передан некорректный id пользователя.'));
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

    const user = await User.find({ email });
    if (user.length > 0) {
      throw new ConflictError('Пользователь с таким email уже существует');
    }

    const hash = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      email, password: hash, name, about, avatar,
    });

    res.send({
      data: {
        newUser,
      },
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      // 400
      next(new ValidationError('Введены невалидные данные'));
    } else if (err.code === 11000) {
      // 409
      next(new ConflictError('Пользователь с таким email уже существует'));
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

    const user = await User.findByIdAndUpdate(req.user, { name, about }, {
      new: true,
      runValidators: true,
    })
      // 404
      .orFail(new NotFoundError('Пользователь не найден.'));

    res.send({ data: user });
  } catch (err) {
    next(err);
  }
};

module.exports.updateAvatar = async (req, res, next) => {
  try {
    const { avatar } = req.body;

    const user = await User.findByIdAndUpdate(req.user, { avatar }, {
      new: true,
      runValidators: true,
    })
      // 404
      .orFail(new NotFoundError('Пользователь не найден.'));

    res.send({ data: user });
  } catch (err) {
    if (err.name === 'ValidationError') {
      // 400
      next(new ValidationError('Введены невалидные данные'));
    } else {
      next(err);
    }
  }
};
