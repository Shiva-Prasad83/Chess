const express = require('express');
const { getUser, recentMatches, findUsers, sendFriendRequest, getFriendRequests, acceptFriendRequest, rejectFriendRequest, getFriends, changeStatus } = require('../controllers/user.controller');
const { verifyAuth } = require('../middlewares/verifyAuth');

const userRouter = express.Router();
userRouter.get('/getUser/:name', verifyAuth, getUser);
userRouter.get('/getMatches/:userId', verifyAuth, recentMatches);
userRouter.get('/search', verifyAuth, findUsers);
//userRouter.get('/getMyFriends', verifyAuth, getMyFriends);
userRouter.post('/sendFriendRequest', verifyAuth, sendFriendRequest);
userRouter.get('/friendRequests', verifyAuth, getFriendRequests);
userRouter.get('/acceptFriendRequest/:friendId', verifyAuth, acceptFriendRequest);
userRouter.get('/rejectFriendRequest/:friendId', verifyAuth, rejectFriendRequest);
userRouter.get('/friends', verifyAuth, getFriends)
userRouter.post('/changeUserStatus', verifyAuth, changeStatus);
module.exports = { userRouter };