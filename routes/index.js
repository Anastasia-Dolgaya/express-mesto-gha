const router = require('express').Router();
const userRouter = require('./users');
const cardRouter = require('./cards');
const auth = require('../middlewares/auth');
const { notFoundController } = require('../controllers/notFoundController');
const { createUser, login, logout } = require('../controllers/users');
const { validateNewUser, validateSignin } = require('../middlewares/celebrate');

router.post('/signin', validateSignin, login);
router.post('/signup', validateNewUser, createUser);

router.use(auth);

router.get('/signout', logout);
router.use('/users', userRouter);
router.use('/cards', cardRouter);

router.use('*', notFoundController);

module.exports = { router };
