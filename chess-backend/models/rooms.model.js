const mongoose = require('mongoose');

const roomSchema = mongoose.Schema({
    roomCode: { type: String, required: true },
    players: {
        type: [Object],
        default: []
    },
    status: { type: String, required: true },
    whiteId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    blackId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    // game: { type: Object, required: true },
    fen: { type: String, required: true },
    lastMove: { type: Object, default: {} },
    clock: {
        whiteMs: { type: Number, default: 600000 },
        blackMs: { type: Number, default: 600000 },
        running: { type: Boolean, default: false },
        active: { type: String, default: "w" },
        lastSwitch: { type: Date, default: null }
    },
    chat: {
        type: [Object],
        default: []
    }
}, { timestamps: true });

const Room = mongoose.model("Rooms", roomSchema);

module.exports = Room;