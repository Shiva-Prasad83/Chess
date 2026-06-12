const express = require('express');
const { authRouter } = require('./routes/auth.router.js');
const { Chess } = require('chess.js');
const cors = require('cors');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const { Server } = require('socket.io');
const cookie = require('cookie');
const jwt = require('jsonwebtoken');
const http = require('http');
const User = require('./models/user.model.js');
const { Game } = require('./models/game.model.js');
const { leaderboardRouter } = require('./routes/leaderboard.router.js');
require('dotenv').config();
const app = express();
const PORT = process.env.PORT;
const MONGODB_URI = process.env.MONGODB_URI;

app.use(cors({
    origin: ["http://localhost:5173"],
    credentials: true
}))
app.use(express.json());
app.use(cookieParser());
app.use("/auth", authRouter);
app.use("/leaderboard", leaderboardRouter);
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5173"],
        credentials: true
    }
})

//socket.io middleware to check whether the accessToken is present.
io.use(async (socket, next) => {
    try {
        const cookieHeader = socket.handshake.headers.cookie || "";
        //console.log(cookieHeader, 'cookieHeader');
        //console.log(typeof cookieHeader, "Cookies Header");
        /*
        cookieHeader=accessToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...; refreshToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
        const cookiesArray=cookieHeader.split(";").map((str)=>str.trim());
        */
        const accessToken = cookie.parse(cookieHeader).accessToken;
        //console.log(accessToken);
        if (!accessToken) {
            return next(new Error('Missing accessToken'));
        }
        const payload = jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET);
        const user = await User.findById(payload.sub).select("-passwordHash");
        if (!user) {
            return next('Unable to find the User');
        }
        socket.user = user;
        next();
    } catch (err) {
        return next(new Error(err.message));
    }
})

function getRoomCode(len = 6) {
    const alphabets = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let roomCode = "";
    for (let i = 0; i < len; i++) {
        roomCode += alphabets[Math.floor(Math.random() * 26)];
    }
    return roomCode;
}

//Another helper function to remove game property from the room, because its length is very big
//so can't send that room object with game property:new Chess().
//We have to remove the game property from that room and return the new object.

function getPublicRoom(room) {
    //Removed the game property, because its size is very big.
    //now this object will be sent to the client or frontend from wherever we are emitting the event
    //and return room from ack() funtion.
    return {
        roomCode: room.roomCode,
        players: room.players,
        status: room.status,
        createdAt: room.createdAt,
        fen: room.fen,
        whiteId: room.whiteId,
        blackId: room.blackId,
        lastMove: room.lastMove
    }
}

function getPublicState(room) {
    return {
        roomCode: room.roomCode,
        fen: room.game.fen(),
        turn: room.game.turn(),
        whiteId: room.whiteId,
        blackId: room.blackId,
        lastMove: room.lastMove
    }
}

function getPublicClock(room) {
    return {
        ...room.clock,
        roomCode: room.roomCode
    }
}


//All rooms that are created will be stored in rooms map.
let rooms = new Map();
console.log(rooms, 'All Rooms');
/*Structure -->
 roomCode:{
 roomCode,
 players:[{userId,socketId,name}],
 status:'waiting'||'ready',
 createdAt,
 game:new Chess(),
 fen:new Chess().fen(),
 whiteId:null,
 blackId:null,
 lastMove:null
 }
 We need to handle timers for both white users and black users, so the logic will be like this
 const baseMs=5*60*1000;
 const incrementMs=0; 
 newRoom.timeControl={baseMs,incrementMs};
 newRoom.clock={
 whiteMs:baseMs,
 blackMs:baseMs,
 active:"w",
 running:false,
 lastSwitch:null
 }
*/
async function updateUsersWithGameDetails(room, result, reason) {
    console.log(result, "Result from backend");
    //Compare the maxWinning before currentWinningStreak becomes 0.
    try {
        const whiteUser = await User.findById(room.whiteId);
        const blackUser = await User.findById(room.blackId);
        console.log(whiteUser, "whiteUser");
        console.log(blackUser, "blackUser");
        if (result === "draw") {
            whiteUser.stats.gamesPlayed += 1;
            whiteUser.stats.draws += 1;
            // whiteUser.stats.maxWinningStreak = Math.max(whiteUser.stats.currentWinningStreak, whiteUser.stats.maxWinningStreak);
            whiteUser.stats.currentWinningStreak = 0;

            blackUser.stats.gamesPlayed += 1;
            blackUser.stats.draws += 1;
            //blackUser.stats.maxWinningStreak = Math.max(blackUser.stats.currenWinningStreak, blackUser.stats.maxWinningStreak);
            blackUser.stats.currentWinningStreak = 0;
        } else if (result === "white") {
            whiteUser.stats.gamesPlayed += 1;
            whiteUser.stats.wins += 1;
            whiteUser.stats.currentWinningStreak += 1;
            whiteUser.stats.maxWinningStreak = Math.max(whiteUser.stats.currentWinningStreak, whiteUser.stats.maxWinningStreak);
            //rating works like now white won, if the black's rating is higher than the white, then white will get +12
            //else +8 rating.
            whiteUser.stats.rating += whiteUser.stats.rating <= blackUser.stats.rating ? 12 : 8;

            blackUser.stats.gamesPlayed += 1;
            blackUser.stats.loses += 1;
            blackUser.stats.maxWinningStreak = Math.max(blackUser.stats.currentWinningStreak, blackUser.stats.maxWinningStreak);
            blackUser.stats.currentWinningStreak = 0
            //black lost here, if black's rating is higher than the white, then black loses -12
            //else -8 rating.
            blackUser.stats.rating -= blackUser.stats.rating >= whiteUser.stats.rating ? 12 : 8;
        } else if (result === "black") {
            console.log("Saving Black player details");
            blackUser.stats.wins += 1;
            blackUser.stats.gamesPlayed += 1;
            blackUser.stats.currentWinningStreak += 1;
            blackUser.stats.maxWinningStreak = Math.max(blackUser.stats.currentWinningStreak, blackUser.stats.maxWinningStreak);
            blackUser.stats.rating += blackUser.stats.rating <= whiteUser.stats.rating ? 12 : 8;


            whiteUser.stats.loses += 1;
            whiteUser.stats.gamesPlayed += 1;
            whiteUser.stats.maxWinningStreak = Math.max(whiteUser.stats.currentWinningStreak, whiteUser.stats.maxWinningStreak);
            whiteUser.stats.currentWinningStreak = 0;
            whiteUser.stats.rating -= whiteUser.stats.rating >= blackUser.stats.rating ? 12 : 8;
        }

        await whiteUser.save();
        await blackUser.save();
    } catch (err) {
        console.log(err, "This is the error")
        //throw new Error("Unable to update user with game details");
    }
}
io.on('connection', (socket) => {
    console.log("A User Connected with socket_id: ", socket.id);
    socket.on("room:create", (ack) => {
        /*
       Step 1: Create the roomCode
       Step 2: Create the newRoom Object with roomCode,players:[],status:"waiting"
       Step 3: socket.join(roomCode)
       Step 4: Add the player to the newRoom Object's player array with userId,name,socketId
       Step 5: Add the newRoom to rooms map
       Step 6: Send the Ok and newRoom to the frontend using ack() function which is sent from frontend
        */
        try {
            let roomCode = getRoomCode();
            //To get the unique room code
            //If the new generated roomCode already exists in the rooms map, then run the loop
            //until you get the unique roomCode which is not there in rooms map.
            while (rooms.has(roomCode)) {
                roomCode = getRoomCode();
            }
            const newRoom = {
                roomCode,
                players: [],
                status: 'waiting',
                createdAt: Date.now(),
                game: new Chess(),
                fen: new Chess().fen(),
                whiteId: null,
                blackId: null,
                lastMove: null,
            }
            socket.join(roomCode);
            newRoom.players.push({
                userId: socket.user._id,
                socketId: socket.id,
                name: socket.user.name,
                createdRoom: true
            })

            //Timers logic
            const baseMs = 10 * 60 * 1000;
            //newRoom.timeControl = { baseMs, incrementMs };
            newRoom.clock = {
                whiteMs: baseMs,
                blackMs: baseMs,
                active: "w",
                running: false,
                lastSwitch: null
            }

            rooms.set(roomCode, newRoom);

            // io.to(roomCode).emit("room:presence", newRoom);
            //Sending public room which has no game property.
            io.to(roomCode).emit("room:presence", getPublicRoom(newRoom));
            //console.log(rooms, "Rooms map while creating newRoom");
            return ack?.({ ok: true, room: getPublicRoom(newRoom) });
        } catch (err) {
            return ack?.({ ok: false, message: err.message || "Failed to create room" });
        }
    })

    socket.on('room:join', (roomCode, ack) => {
        /*
        Get the roomCode and ack function from the frontend
        Step 1:Check if the room exists in the rooms with rooms.get(roomCode)
        Step 2:Check if the user is already in the room.(This case is possible when the user joined
        the room and somehow the socket connection is disconnected and user tries to join the room
        again with same roomCode. In this case we need to change the socketId of the user.Because
        in players array, the user will have disconnected socketId.
        )
        Step 3:If the user is part of the room, then check the length of players array, if the
        length ==2 then, return ack({ok:false,message:"Room is full"}).
        Step 4:Else, join the user to the room and update the status to "ready"
        */
        try {
            const existingRoom = rooms.get(roomCode);
            // console.log(existingRoom, "Trying to join the room");
            if (!existingRoom) {
                return ack({ ok: false, message: 'Room Not Found' });
            }
            //Case Step 2:
            let alreadyExists = existingRoom.players.some((player) => {
                return player.userId.toString() === socket.user._id.toString()
            });

            if (!alreadyExists) {
                //console.log('user not exists')
                //console.log(existingRoom, "Checking players.length");
                if (existingRoom.players.length === 2) {
                    console.log('Room is full');
                    return ack({ ok: false, message: "Room is full" })
                }
                existingRoom.players.push({
                    userId: socket.user._id,
                    socketId: socket.id,
                    name: socket.user.name
                })

            } else {
                //If the user already in the room, but disconnected and tried to connect with new
                //socketId with same roomCode.
                console.log('User already exits');
                existingRoom.players = existingRoom.players.map((player) => {
                    if (player.userId.toString() === socket.user._id.toString()) {
                        return { ...player, socketId: socket.id };
                    }
                    return player;
                })
            }
            //existingRoom.status = existingRoom.players.length === 2 ? "ready" : "waiting";
            //The player who joins the room first, will get the white pieces and player
            //who joins second, will get black pieces.
            if (existingRoom.players.length === 2) {
                existingRoom.whiteId = existingRoom.players[0].userId;
                existingRoom.blackId = existingRoom.players[1].userId;
                existingRoom.status = "ready";

                //Initializing the clock after two are joined.
                //This event will be emitted when user clicks join room button
                // As well as When User comes Game.jsx so, this will be executed two or three
                // times so that we get the lastest time for lastSwitch.
                existingRoom.clock.running = true;
                existingRoom.clock.lastSwitch = Date.now();
                existingRoom.clock.active = "w";
            } else {
                existingRoom.status = "waiting";
            }
            socket.join(roomCode);
            io.to(roomCode).emit("clock:update", getPublicClock(existingRoom));
            io.to(roomCode).emit("room:presence", getPublicRoom(existingRoom));
            return ack({ ok: true, room: getPublicRoom(existingRoom) });
            //Own Understanding Code but some edge cases are missing.
            // if (existingRoom.players.length >= 2) {
            //     return ack({ ok: false, message: "Room is full" });
            // }
            // socket.join(roomCode);
            // existingRoom.players.push({
            //     userId: socket.user._id,
            //     socketId: socket.id,
            //     name: socket.user.name
            // });
            // existingRoom.status = 'ready';
            // return ack({ ok: true, room });
        } catch (err) {
            return ack({ ok: false, message: err.message || 'Failed to join Room' });
        }
    });

    socket.on('room:leave', (roomCode, ack) => {
        try {
            if (!roomCode) {
                return ack?.({ ok: false, message: "Required roomCode" });
            }
            const leavingRoom = rooms.get(roomCode);
            if (!leavingRoom) {
                return ack?.({ ok: false, message: "Invalid roomCode" });
            }
            //Check if the user exists in the room or not. Because, if the room code is leaked, then others might click on
            // leave in which they are not part. That's why user should be in players array of the specific room.
            let userExists = leavingRoom?.players?.some((player) => player.userId.toString() === socket.user._id.toString());
            if (!userExists) {
                return ack?.({ ok: false, message: "Invalid User" })
            }

            //console.log(rooms, 'Before deleting the player');

            //Removing the user or player from the leavingRoom.
            leavingRoom.players = leavingRoom.players.filter((player) => player.userId.toString() !== socket.user._id.toString());
            socket.leave(roomCode);
            //updating the status of the room to waiting after removing the players from the room.
            leavingRoom.status = "waiting";
            //we need to update the rooms map, because still one player is left the room
            rooms.set(roomCode, leavingRoom);
            //console.log(rooms, 'After Deleting the player');
            //If the room is empty then delete the room
            if (leavingRoom.players.length === 0) {
                rooms.delete(roomCode);
                //console.log(rooms, "After deleting the room itself");
                return ack?.({ ok: true, message: "Room deleted" });
            }
            io.to(roomCode).emit("room:presence", getPublicRoom(leavingRoom));
            return ack?.({ ok: true, room: getPublicRoom(leavingRoom) });
        } catch (err) {
            return ack?.({ ok: false, message: err?.message || "Failed to leave room" });
        }
    });

    socket.on('start:game', (roomCode, ack) => {
        const room = rooms.get(roomCode);
        if (!room && room.players.length !== 2) {
            return ack?.({ ok: false, message: "Room doesn't exists" });
        }
        io.to(roomCode).emit('game:started', { ok: true });
        return ack?.({ ok: true, message: "Starting Game" })
    })


    // Game related events
    //Frontend emits these events
    socket.on("game:state", (roomCode, ack) => {
        let room = rooms.get(roomCode);
        if (!room) {
            return ack?.({ ok: false, message: "Room does not exist" });
        }
        return ack?.({ ok: true, gameState: getPublicState(room), clock: getPublicClock(room) });
    })

    //Whenever the player makes a move, this event will trigger
    /*
    "game:move" event will be triggered when the piece on the chessboard is moved or dragged.
     Steps:
     here room.game:new Chess() which has all the information about the game, like whose turn it is currently, is the game over, is the game drawn etc.
    1. we have to know which player has moved the piece, check the socket.user._id === room.whiteId or room.blackId
    2. we have to check whether the player who has moved the pieces, is it really his turn or not. Check this using room.game.turn -> this gives w or b
    if player is w and turn is b then that is invalid move because it is not his turn.
    3. we need to pass the move made by player to the room.game.move() function so that it calculate whether the move made by user valid or not
    ex:let move=room.game.move({from,to,promotion:'q'})
    if move is invalid then throw error message using ack function.
    4.store the lastMove={from,to};
    5.emit the "game:update" event from the backend and the updated room state to the frontend, based on the FEN String inside the room
    frontend updates the board.
    6. We need to check whether the move made is checkmate or Draw (could be stalemate) and we need send the winnner to the frontend
    by emitting the "game:over" event from backend.
    */
    socket.on("game:move", async (roomCode, from, to, promotion, ack) => {
        try {
            const room = rooms.get(roomCode);
            if (!room) return ack?.({ ok: false, message: "Room not found" });
            let player = "none";
            if (socket.user._id.toString() === room.whiteId.toString()) {
                player = "w";
            } else if (socket.user._id.toString() === room.blackId.toString()) {
                player = "b";
            }
            if (player === "none") {
                return ack?.({ ok: false, message: "Invalid Player" });
            }
            let turn = room.game.turn()//w or b turn
            if (player !== turn) {
                return ack?.({ ok: false, message: "Not your turn" });
            }
            let move = room.game.move({
                from,
                to,
                promotion: 'q',
            })
            if (!move) {
                return ack?.({ ok: false, message: "Invalid move" });
            }
            room.lastMove = {
                from,
                to
            }
            let now = Date.now();
            let timeCompleted = now - room.clock.lastSwitch;
            if (room.clock.active === "w") {
                room.clock.whiteMs -= timeCompleted;
                room.clock.active = "b";
                room.clock.lastSwitch = now;
            } else {
                room.clock.blackMs -= timeCompleted;
                room.clock.active = "w";
                room.clock.lastSwitch = now;
            }

            //check if the timer of any player has become to zero and become - values
            //If any player's timer reaches to zero or minus values then we need to end the game
            //by emitting the game:over event
            room.clock.whiteMs = Math.max(0, room.clock.whiteMs);
            room.clock.blackMs = Math.max(0, room.clock.blackMs);
            io.to(roomCode).emit("clock:update", getPublicClock(room));
            if (room.clock.whiteMs === 0 || room.clock.blackMs === 0) {
                room.clock.running = false;
                const result = room.clock.whiteMs === 0 ? "black" : "white";
                const reason = "Time out";
                io.to(roomCode).emit("time:out", { result, reason });
                //The game is over, so just saving the game to the database.
                const game = new Game({
                    roomCode,
                    whiteId: room.whiteId,
                    blackId: room.blackId,
                    result,
                    reason,
                    startedAt: new Date(room.createdAt),
                    endedAt: Date.now(),
                    duration: Date.now() - room.createdAt
                });
                await game.save();
                //Just updating the players stats.
                updateUsersWithGameDetails(room, result, reason);
                //emitting the game:over event.
                return;
            }

            //"game:update" is the event emitted from backend to frontend whenever there is an update in a game.
            io.to(roomCode).emit("game:update", getPublicState(room));

            //Checking whether game is completed, the move could checkmate the opponent king.
            if (room.game.isGameOver()) {
                let reason = "others"
                let result = "Draw";
                // if (room.game.isCheckmate()) {
                //     reason = "checkmate";
                //     result = player == "w" ? "white" : "black";// room.game.turn()
                // } else if (room.game.isDraw()) {
                //     reason = "Draw";
                //     result = "Draw"
                // } else if (room.game.isStalemate()) {
                //     reason = "Draw"
                //     result = "Stalemate"
                // } else if (room.game.isThreefoldRepetition()) {
                //     reason = "Draw";
                //     result = "Draw By Repetition"
                //     console.log("Draw by repetition");
                // } else if (room.game.isInsufficientMaterial()) {
                //     reason = "Draw"
                //     result = "Draw By Insufficient Material"
                // }
                if (room.game.isCheckmate()) {
                    reason = "checkmate";
                    result = player === "w" ? "white" : "black";
                } else if (room.game.isThreefoldRepetition()) {
                    reason = "threefold repetition";
                    result = "draw";
                } else if (room.game.isInsufficientMaterial()) {
                    reason = "insufficient material";
                    result = "draw";
                } else if (room.game.isStalemate()) {
                    reason = "stalemate";
                    result = "draw";
                } else if (room.game.isDraw()) {
                    reason = "draw";
                    result = "draw";
                }

                const game = new Game({
                    roomCode,
                    whiteId: room.whiteId,
                    blackId: room.blackId,
                    result,
                    reason,
                    startedAt: new Date(room.createdAt),
                    endedAt: Date.now(),
                    duration: Date.now() - room.createdAt
                })
                await game.save();
                updateUsersWithGameDetails(room, result, reason);
                io.to(roomCode).emit("game:over", { result, reason });
            }
        } catch (err) {
            return ack?.({ ok: false, message: err.message });
        }
    })
})

server.listen(PORT, () => {
    console.log('Server is running on port 5000');
})

mongoose
    .connect(MONGODB_URI)
    .then(() => {
        console.log('Connected to DB');
    })
    .catch((er) => {
        console.log('Error while connecting to DB');
    })

