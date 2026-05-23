const express = require('express');
const { login, signup, fetchMe, refresh } = require('../controllers/user.controller');
const { verifyAuth } = require('../middlewares/verifyAuth');

const authRouter = express.Router();

authRouter.post('/login', login)
authRouter.post('/signup', signup)
authRouter.post('/logout', (req, res) => {
    return res.sendStatus(200);
})
authRouter.get('/me', verifyAuth, fetchMe)
authRouter.post('/refresh', refresh)

module.exports = { authRouter };