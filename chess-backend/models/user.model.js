const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    passwordHash: { type: String, required: true },
    role: { type: String, default: "USER", enum: ["USER", "ADMIN"] },
    avatar: { type: String, default: "" },
    stats: {
        rating: { type: Number, default: 1200 },
        wins: { type: Number, default: 0 },
        loses: { type: Number, default: 0 },
        draws: { type: Number, default: 0 },
        gamesPlayed: { type: Number, default: 0 },
        currentWinningStreak: { type: Number, default: 0 },
        maxWinningStreak: { type: Number, default: 0 }
    }
}, {
    timestamps: true
})

const User = mongoose.model('User', userSchema);

module.exports = User;