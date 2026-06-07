const User = require("../models/user.model");
async function getLeaderboard(req, res) {
    try {
        const players = await User.find({}).select("-passwordHash").limit(50);
        //sorting in descending order.
        const leaderboardPlayers = players.sort((a, b) => b.stats.rating - a.stats.rating);
        //console.log(leaderboardPlayers,"learderboardPlayers");
        return res.status(200).json({ players });
    } catch (err) {
        return res.status(500).json({ message: err?.message || "Internal Server Error" });
    }
}
module.exports = { getLeaderboard };
