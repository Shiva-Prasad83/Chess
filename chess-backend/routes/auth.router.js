const express = require('express');
const { login, signup, fetchMe, refresh, logout, getUser, recentMatches, getMyFriends } = require('../controllers/auth.controller');
const { verifyAuth } = require('../middlewares/verifyAuth');

const authRouter = express.Router();

authRouter.post('/login', login);
authRouter.post('/signup', signup);
authRouter.post('/logout', logout);
authRouter.get('/me', verifyAuth, fetchMe);
authRouter.post('/refresh', refresh);

module.exports = { authRouter };