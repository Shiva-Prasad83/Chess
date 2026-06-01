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
*/
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
            console.log(existingRoom, "Trying to join the room");
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
            } else {
                existingRoom.status = "waiting";
            }
            socket.join(roomCode);
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
    socket.on("game:state", (roomCode, ack) => {
        let room = rooms.get(roomCode);
        if (!room) {
            return ack?.({ ok: false, message: "Room does not exist" });
        }
        return ack?.({ ok: true, room: getPublicRoom(room) });
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

