const Card = require('../models/cards');

const { BadRequestError } = require('../errors/BadRequestError');
const { NotFoundError } = require('../errors/NotFoundError');
const { ValidationError } = require('../errors/ValidationError');
const { ForbiddenError } = require('../errors/ForbiddenError');

module.exports.getCards = (req, res, next) => {
  Card.find({})
    .populate('owner')
    .then((cards) => res.send({ data: cards }))
    .catch(next);
};

module.exports.createCard = async (req, res, next) => {
  try {
    const {
      name, link,
    } = req.body;

    const { _id } = req.user;

    const card = await Card.create({
      name, link, owner: _id,
    });
    res.send({ data: card });
  } catch (err) {
    if (err.name === 'ValidationError') {
      // 400
      next(new ValidationError('Переданы невалидные данные'));
    } else {
      next(err);
    }
  }
};

module.exports.deleteCard = async (req, res, next) => {
  try {
    const card = await Card.findById(req.params.cardId)
      .orFail(new NotFoundError('Карточка не найдена.'));

    if (card.owner._id.toString() !== req.user._id) {
      throw new ForbiddenError('Пользователь не имеет прав на удаления чужой карточки.');
    }

    await card.delete();
    res.send({ message: 'Карточка удалена.' });
  } catch (err) {
    if (err.name === 'CastError') {
      // 400
      next(new BadRequestError('Передан некорректный id карточки.'));
    } else {
      next(err);
    }
  }
};

module.exports.likeCard = async (req, res, next) => {
  try {
    const card = await Card.findByIdAndUpdate(
      req.params.cardId,
      { $addToSet: { likes: req.user._id } },
      { new: true },
    ).orFail(new NotFoundError('Карточка не найдена'));
    res.send({ likes: card.likes });
  } catch (err) {
    if (err.name === 'CastError') {
      // 400
      next(new BadRequestError('Переданы некорректные данные для постановки лайка.'));
    } else {
      next(err);
    }
  }
};

module.exports.dislikeCard = async (req, res, next) => {
  try {
    const card = await Card.findByIdAndUpdate(
      req.params.cardId,
      { $pull: { likes: req.user._id } },
      { new: true },
    ).orFail(new NotFoundError('Карточка не найдена'));
    res.send({ likes: card.likes });
  } catch (err) {
    if (err.name === 'CastError') {
      // 400
      next(new BadRequestError('Переданы некорректные данные для снятия лайка.'));
    } else {
      next(err);
    }
  }
};
