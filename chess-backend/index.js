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
const parser = require('./utilities/uploadProfile.js');
const { timeStamp } = require('console');
const Room = require('./models/rooms.model.js');
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
//uploading profile.
app.post('/upload', parser.single('profile'), (req, res) => {
    try {
        const url = req.file.path;
        return res.status(201).json({ profileImageUrl: url });
    } catch (err) {
        return res.status(500).json({ message: "Internal Server Error" });
    }
})
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
        spectators: room.spectators,
        status: room.status,
        createdAt: room.createdAt,
        fen: room.fen,
        whiteId: room.whiteId,
        blackId: room.blackId,
        lastMove: room.lastMove
    }
}

function getPublicState(room) {
    //console.log(room, 'getpublicState');
    return {
        roomCode: room.roomCode,
        fen: room.fen,
        turn: new Chess(room.fen).turn(),
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
    console.log("Running on time out");
    //console.log(result, "Result from backend");
    //Compare the maxWinning before currentWinningStreak becomes 0.
    try {
        const whiteUser = await User.findById(room.whiteId);
        const blackUser = await User.findById(room.blackId);
        //console.log(whiteUser, "whiteUser");
        //console.log(blackUser, "blackUser");
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
const onlineUsers = new Map();
io.on('connection', (socket) => {
    //console.log("A User Connected with socket_id: ", socket.id);
    socket.on('user:online', async (userId) => {
        try {
            const user = await User.findById(userId);
            user.isOnline = true;
            await user.save();
            //await User.findByIdAndUpdate(userId, { isOnline: true });
            //console.log(user, "after login");
        } catch (err) {
            console.log(err);
        }
    });
    socket.on('play:online', async (ack) => {
        try {
            onlineUsers.set(socket.user._id, {
                socket
            });
            if (onlineUsers.size === 2) {
                // console.log(onlineUsers, "online Users");
                let player1, player2;
                let firstPlayer = true;
                for (let [key, value] of onlineUsers.entries()) {
                    if (firstPlayer) {
                        player1 = value;
                        firstPlayer = false;
                        onlineUsers.delete(key);
                    } else {
                        player2 = value;
                        onlineUsers.delete(key);
                    }
                }
                let roomCode;
                while (true) {
                    roomCode = getRoomCode();
                    const roomExists = await Room.findOne({ roomCode });
                    if (!roomExists) {
                        break;
                    }
                }

                const room = new Room({
                    roomCode,
                    players: [{
                        userId: player1.socket.user._id,
                        socketId: player1.socket.id,
                        name: player1.socket.user.name
                    }, {
                        userId: player2.socket.user._id,
                        socketId: player2.socket.id,
                        name: player2.socket.user.name
                    }],
                    whiteId: player1._id,
                    blackId: player2._id,
                    fen: new Chess().fen(),
                    status: 'ready',
                    clock: {
                        whiteMs: 600000,
                        blackMs: 600000,
                        active: 'w',
                        running: true,
                        lastSwitch: Date.now()
                    }
                })
                player1.socket.join(roomCode);
                player2.socket.join(roomCode);
                await room.save();
                io.to(roomCode).emit('start:game', roomCode);
                return ack?.({ ok: true, roomCode });
            }
        } catch (err) {
            return ack?.({ ok: false, message: err.message });
        }
    });
    socket.on("room:create", async (ack) => {
        /*
       Step 1: Create the roomCode
       Step 2: Create the newRoom Object with roomCode,players:[],status:"waiting"
       Step 3: socket.join(roomCode)
       Step 4: Add the player to the newRoom Object's player array with userId,name,socketId
       Step 5: Add the newRoom to rooms map
       Step 6: Send the Ok and newRoom to the frontend using ack() function which is sent from frontend
        */
        try {
            let roomCode;
            //To get the unique room code
            //If the new generated roomCode already exists in the rooms map, then run the loop
            //until you get the unique roomCode which is not there in rooms map.
            while (true) {
                roomCode = getRoomCode();
                const isRoomCodeExists = await Room.exists({ roomCode });
                if (!isRoomCodeExists) {
                    break;
                }
            }
            const room = new Room({ roomCode, status: 'waiting', fen: new Chess().fen() })
            // const newRoom = {
            //     roomCode,
            //     players: [],
            //     status: 'waiting',
            //     createdAt: Date.now(),
            //     game: new Chess(),
            //     fen: new Chess().fen(),
            //     whiteId: null,
            //     blackId: null,
            //     lastMove: null,
            // }
            socket.join(roomCode);
            // newRoom.players.push({
            //     userId: socket.user._id,
            //     socketId: socket.id,
            //     name: socket.user.name,
            //     createdRoom: true
            // })
            room.players.push({
                userId: socket.user._id,
                socketId: socket.id,
                name: socket.user.name,
                createdRoom: true
            })

            //Timers logic
            //const baseMs = 10 * 60 * 1000;
            //newRoom.timeControl = { baseMs, incrementMs };
            // newRoom.clock = {
            //     whiteMs: baseMs,
            //     blackMs: baseMs,
            //     active: "w",
            //     running: false,
            //     lastSwitch: null
            // }
            // room.clock = {
            //     whiteMs: baseMs,
            //     blackMs: baseMs,
            //     active: "w",
            //     running: false,
            //     lastSwitch: null
            // }
            //When the user wants to chat with the other player, those chats will be stored here.
            /*
            [
            {
            userId:socket.user._id, name:socket.user.name, message:text  }
            ]
            */
            //newRoom.chat = [];
            //rooms.set(roomCode, newRoom);
            await room.save();
            // io.to(roomCode).emit("room:presence", newRoom);
            //Sending public room which has no game property.
            //console.log('before');
            io.to(roomCode).emit("room:presence", getPublicRoom(room));
            //console.log('after');
            //console.log(rooms, "Rooms map while creating newRoom");
            return ack?.({ ok: true, room: getPublicRoom(room) });
        } catch (err) {
            console.log(err.message)
            return ack?.({ ok: false, message: err.message || "Failed to create room" });
        }
    })

    socket.on('room:join', async (roomCode, ack) => {
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
            const existingRoomFromDB = await Room.findOne({ roomCode });
            //const existingRoom = rooms.get(roomCode);
            // console.log(existingRoom, "Trying to join the room");
            if (!existingRoomFromDB) {
                console.log(existingRoomFromDB, 'error while joining the room');
                return ack({ ok: false, message: 'Room Not Found' });
            }
            //Case Step 2:
            let alreadyExists = existingRoomFromDB.players.some((player) => {
                return player.userId.toString() === socket.user._id.toString()
            });

            if (!alreadyExists) {
                //console.log('user not exists')
                //console.log(existingRoom, "Checking players.length");
                if (existingRoomFromDB.players.length === 2) {
                    console.log('Room is full');
                    return ack({ ok: false, message: "Room is full" })
                }
                // existingRoom.players.push({
                //     userId: socket.user._id,
                //     socketId: socket.id,
                //     name: socket.user.name
                // })
                existingRoomFromDB.players.push({
                    userId: socket.user._id,
                    socketId: socket.id,
                    name: socket.user.name,
                })

            } else {
                //If the user already in the room, but disconnected and tried to connect with new
                //socketId with same roomCode.
                console.log('User already exits');
                // existingRoom.players = existingRoom.players.map((player) => {
                //     if (player.userId.toString() === socket.user._id.toString()) {
                //         return { ...player, socketId: socket.id };
                //     }
                //     return player;
                // });
                existingRoomFromDB.players = existingRoomFromDB.players.map((p) => {
                    if (p.userId.toString() === socket.user._id.toString()) {
                        return { ...p, socketId: socket.id };
                    }
                    return p;
                });
            }
            //existingRoom.status = existingRoom.players.length === 2 ? "ready" : "waiting";
            //The player who joins the room first, will get the white pieces and player
            //who joins second, will get black pieces.
            if (existingRoomFromDB.players.length === 2) {
                // existingRoom.whiteId = existingRoom.players[0].userId;
                // existingRoom.blackId = existingRoom.players[1].userId;
                // existingRoom.status = "ready";

                existingRoomFromDB.whiteId = existingRoomFromDB.players[0].userId,
                    existingRoomFromDB.blackId = existingRoomFromDB.players[1].userId,
                    existingRoomFromDB.status = "ready";
                //Initializing the clock after two are joined.
                //This event will be emitted when user clicks join room button
                // As well as When User comes Game.jsx so, this will be executed two or three
                // times so that we get the lastest time for lastSwitch.\


                //On every page refresh, this room:join event is getting triggered, so on refresh
                //this code executes, if the if condition is not written, then on every refresh the 
                //the clock.active will be white "w" it should not be the case. That we added the if condition.
                // if (!existingRoomFromDB.clock.running) {
                //     console.log('updating the clock');
                //     // existingRoom.clock.running = true;
                //     // existingRoom.clock.lastSwitch = Date.now();
                //     // existingRoom.clock.active = "w";

                //     existingRoomFromDB.clock.running = true;
                //     existingRoomFromDB.clock.lastSwitch = Date.now();
                //     existingRoomFromDB.clock.active = "w";
                // }
            } else {
                //existingRoom.status = "waiting";

                existingRoomFromDB.status = "waiting";
            }
            socket.join(roomCode);

            await existingRoomFromDB.save();
            io.to(roomCode).emit("clock:update", getPublicClock(existingRoomFromDB));
            io.to(roomCode).emit("room:presence", getPublicRoom(existingRoomFromDB));
            return ack({ ok: true, room: getPublicRoom(existingRoomFromDB) });
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
            console.log(err, "joining error");
            return ack({ ok: false, message: err.message || 'Failed to join Room' });
        }
    });

    socket.on('room:leave', async (roomCode, ack) => {
        try {
            if (!roomCode) {
                return ack?.({ ok: false, message: "Required roomCode" });
            }
            //const leavingRoom = rooms.get(roomCode);
            const leavingRoomFromDB = await Room.findOne({ roomCode });
            //console.log(leavingRoomFromDB);
            if (!leavingRoomFromDB) {
                return ack?.({ ok: false, message: "Invalid roomCode" });
            }
            //Check if the user exists in the room or not. Because, if the room code is leaked, then others might click on
            // leave in which they are not part. That's why user should be in players array of the specific room.
            let userExists = leavingRoomFromDB?.players?.some((player) => player.userId.toString() === socket.user._id.toString());
            if (!userExists) {
                return ack?.({ ok: false, message: "Invalid User" })
            }

            //console.log(rooms, 'Before deleting the player');

            //Removing the user or player from the leavingRoom.
            leavingRoomFromDB.players = leavingRoomFromDB.players.filter((player) => player.userId.toString() !== socket.user._id.toString());
            socket.leave(roomCode);
            //updating the status of the room to waiting after removing the players from the room.
            leavingRoomFromDB.status = "waiting";
            //we need to update the rooms map, because still one player is left the room
            //rooms.set(roomCode, leavingRoom);

            await leavingRoomFromDB.save();

            //console.log(rooms, 'After Deleting the player');
            //If the room is empty then delete the room
            if (leavingRoomFromDB.players.length === 0) {
                //rooms.delete(roomCode);
                //await Room.deleteOne(leavingRoomFromDB);
                await Room.deleteOne(leavingRoomFromDB);
                //console.log(rooms, "After deleting the room itself");
                return ack?.({ ok: true, message: "Room deleted" });
            }
            io.to(roomCode).emit("room:presence", getPublicRoom(leavingRoomFromDB));
            return ack?.({ ok: true, room: getPublicRoom(leavingRoomFromDB) });
        } catch (err) {
            return ack?.({ ok: false, message: err?.message || "Failed to leave room" });
        }
    });

    socket.on('start:game', async (roomCode, ack) => {
        //const room = rooms.get(roomCode);
        try {
            const room = await Room.findOne({ roomCode });
            if (!room && room.players.length !== 2) {
                return ack?.({ ok: false, message: "Room doesn't exists" });
            }
            if (!room.clock.running) {
                room.clock.running = true;
                room.clock.lastSwitch = Date.now();
                room.clock.active = "w";
            }
            await room.save();
            io.to(roomCode).emit('game:started', { ok: true });
            return ack?.({ ok: true, message: "Starting Game" })
        } catch (err) {
            return ack?.({ ok: false, message: err.message || 'Unable to start game' });
        }
    })


    // Game related events
    //Frontend emits these events
    socket.on("game:state", async (roomCode, ack) => {
        try {
            console.log('Game state on every refresh');
            //let room = rooms.get(roomCode);
            const room = await Room.findOne({ roomCode });
            if (!room) {
                return ack?.({ ok: false, message: "Room does not exist" });
            }
            return ack?.({ ok: true, gameState: getPublicState(room), clock: getPublicClock(room) });
        } catch (err) {
            //console.log(err, 'Error from game:state');
            return ack?.({ ok: false, message: err.message });
        }
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
            //const room = rooms.get(roomCode);
            const room = await Room.findOne({ roomCode });
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
            const game = new Chess(room.fen);
            let turn = game.turn();//w or b turn
            if (player !== turn) {
                return ack?.({ ok: false, message: "Not your turn" });
            }
            let move = game.move({
                from,
                to,
                promotion: 'q',
            });
            if (!move) {
                return ack?.({ ok: false, message: "Invalid move" });
            }
            room.fen = game.fen();
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
            await room.save();
            io.to(roomCode).emit("clock:update", getPublicClock(room));
            if (room.clock.whiteMs === 0 || room.clock.blackMs === 0) {
                room.clock.running = false;
                const result = room.clock.whiteMs === 0 ? "black" : "white";
                const reason = "timeout";
                io.to(roomCode).emit("time:out", { result, reason });
                //The game is over, so just saving the game to the database.
                const playingGame = new Game({
                    roomCode,
                    whiteId: room.whiteId,
                    blackId: room.blackId,
                    result,
                    reason,
                    startedAt: new Date(room.createdAt),
                    endedAt: Date.now(),
                    duration: Date.now() - room.createdAt
                });
                await updateUsersWithGameDetails(room, result, reason);
                await playingGame.save();
                await Room.deleteOne(room);
                //Just updating the players stats.
                //emitting the game:over event.
                return;
            }

            //"game:update" is the event emitted from backend to frontend whenever there is an update in a game.
            io.to(roomCode).emit("game:update", getPublicState(room));

            //Checking whether game is completed, the move could checkmate the opponent king.
            if (game.isGameOver()) {
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
                if (game.isCheckmate()) {
                    reason = "checkmate";
                    result = player === "w" ? "white" : "black";
                } else if (game.isThreefoldRepetition()) {
                    reason = "threefold repetition";
                    result = "draw";
                } else if (game.isInsufficientMaterial()) {
                    reason = "insufficient material";
                    result = "draw";
                } else if (game.isStalemate()) {
                    reason = "stalemate";
                    result = "draw";
                } else if (game.isDraw()) {
                    reason = "draw";
                    result = "draw";
                }

                const playingGame = new Game({
                    roomCode,
                    whiteId: room.whiteId,
                    blackId: room.blackId,
                    result,
                    reason,
                    startedAt: new Date(room.createdAt),
                    endedAt: Date.now(),
                    duration: Date.now() - room.createdAt
                })
                await playingGame.save();
                await updateUsersWithGameDetails(room, result, reason);
                await Room.deleteOne(room);
                io.to(roomCode).emit("game:over", { result, reason });
            }
        } catch (err) {
            return ack?.({ ok: false, message: err.message });
        }
    })

    socket.on('send:message', async (roomCode, text, ack) => {
        try {//Check if the room is valid or not.
            //const room = rooms.get(roomCode);
            const room = await Room.findOne({ roomCode });
            if (!room) return ack?.({ ok: false, message: 'Room Not Found' });

            const clean = text.trim();
            if (!clean) return ack?.({ ok: false, message: 'Message Empty' });
            //Checking if the message is sent by the player who is inside in the room or is it 
            // sent by the others
            const isPlayer = room?.players.some((p) => p.userId.toString() === socket.user._id.toString());
            if (!isPlayer) {
                return ack?.({ ok: false, message: 'Invalid User' });
            }
            if (clean.length > 300) {
                return ack?.({ ok: false, message: "Message exceeded 300 characters" });
            }
            const message = {
                userId: socket.user._id,
                name: socket.user.name,
                text: clean,
                timeStamp: Date.now()
            }
            room.chat.push(message);
            if (room.chat.length === 50) {
                room.chat.shift();
            }
            console.log('Message came and sending to the frontend');
            await room.save();
            io.to(roomCode).emit('new:message', message);
            return ack?.({ ok: true, message });
        } catch (err) {
            return ack?.({ ok: false, message: err.message });
        }

    })

    socket.on('chat:history', async (roomCode, ack) => {
        try {
            //const room = rooms.get(roomCode);
            const room = await Room.findOne({ roomCode });
            if (!room) return ack?.({ ok: false, message: "Room Not Found" });
            //Check if the player belongs to this room or not.
            const isPlayer = room.players.some((p) => p.userId.toString() === socket.user._id.toString());
            if (!isPlayer) {
                return ack?.({ ok: false, message: "Invalid Player" });
            }
            return ack?.({ ok: true, messages: room.chat });
        } catch (err) {
            return ack?.({ ok: false, message: err.message });
        }
    })

    socket.on('player:resign', async (roomCode, playerId, ack) => {

        try {
            // const room = rooms.get(roomCode);
            const room = await Room.findOne({ roomCode });
            if (!room) return ack?.({ ok: false, message: "Invalid Room" });
            const isPlayer = room.players.some((p) => p.userId.toString() === playerId.toString());
            if (!isPlayer) {
                return ack?.({ ok: false, message: "Invalid Player" });
            }
            const result = room.whiteId.toString() === playerId.toString() ? "black" : "white";
            const reason = "resign";
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
            await updateUsersWithGameDetails(room, result, reason);
            await Room.deleteOne(room);
            io.to(roomCode).emit('game:over', { result, reason });
        } catch (err) {
            return ack?.({ ok: false, message: err.message });
        }
    })

    socket.on('disconnect', async () => {
        try {
            const user = await User.findById(socket.user._id);
            user.isOnline = false;
            await user.save();
            //console.log(user, "user after log out");
            // await User.findById(socket.user._id, { isOnline: false });
        } catch (err) {
            console.log(err);
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

