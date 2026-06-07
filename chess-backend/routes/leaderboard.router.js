const express = require('express');
const { getLeaderboard } = require('../controllers/leaderboard.controller');
const { verifyAuth } = require('../middlewares/verifyAuth');

const leaderboardRouter = express.Router();

leaderboardRouter.get("/", verifyAuth, getLeaderboard);

module.exports = { leaderboardRouter };