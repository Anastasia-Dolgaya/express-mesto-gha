const Card = require('../models/cards');
const {
  BAD_REQUEST_CODE,
  NOT_FOUND_CODE,
  BAD_REQUEST_MESSAGE,
} = require('../errors/errors');

const { BadRequestError } = require('../errors/BadRequestError');
const { NotFoundError } = require('../errors/NotFoundError');
const { ConflictError } = require('../errors/ConflictError');

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

    // if (!name || !link) {
    //   throw new BadRequestError();
    // }

    const card = await Card.create({
      name, link, owner: _id,
    });
    res.send({ data: card });
  } catch (err) {
    if (err instanceof BadRequestError || err.name === 'ValidationError') {
      // 400
      res.status(BAD_REQUEST_CODE).send({ message: BAD_REQUEST_MESSAGE });
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
      throw new ConflictError('Пользователь не имеет прав на удаления чужой карточки.');
    }

    await card.delete();
    res.send({ message: 'Карточка удалена.' });
  } catch (err) {
    if (err instanceof NotFoundError) {
      // 404
      res.status(NOT_FOUND_CODE).send({ message: err.message });
    } else if (err.name === 'CastError') {
      // 400
      const BadRequestErr = new BadRequestError('Передан некорректный id карточки.');
      res.status(BAD_REQUEST_CODE).send({ message: BadRequestErr.message });
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
    if (err instanceof NotFoundError) {
      // 404
      res.status(NOT_FOUND_CODE).send({ message: err.message });
    } else if (err.name === 'CastError') {
      // 400
      const BadRequestErr = new BadRequestError('Переданы некорректные данные для постановки лайка.');
      res.status(BAD_REQUEST_CODE).send({ message: BadRequestErr.message });
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
    if (err instanceof NotFoundError) {
      // 404
      res.status(NOT_FOUND_CODE).send({ message: err.message });
    } else if (err.name === 'CastError') {
      // 400
      const BadRequestErr = new BadRequestError('Переданы некорректные данные для снятия лайка.');
      res.status(BAD_REQUEST_CODE).send({ message: BadRequestErr.message });
    } else {
      next(err);
    }
  }
};
