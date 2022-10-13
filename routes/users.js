const router = require('express').Router();

const {
  getUsers, getUser, getMyInfo, updateUser, updateAvatar,
} = require('../controllers/users');

const { validateUserUpdate, validateAvatarUpdate, validateUserID } = require('../middlewares/celebrate');

router.get('/', getUsers);
router.get('/me', getMyInfo);
router.get('/:userId', validateUserID, getUser);
router.patch('/me', validateUserUpdate, updateUser);
router.patch('/me/avatar', validateAvatarUpdate, updateAvatar);

module.exports = router;
