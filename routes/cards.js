const router = require('express').Router();

const {
  getCards, createCard, deleteCard, likeCard, dislikeCard,
} = require('../controllers/cards');

const { validateNewCard, validateCardID } = require('../middlewares/celebrate');

router.get('/', getCards);
router.post('/', validateNewCard, createCard);
router.delete('/:cardId', validateCardID, deleteCard);
router.put('/:cardId/likes', validateCardID, likeCard);
router.delete('/:cardId/likes', validateCardID, dislikeCard);

module.exports = router;
