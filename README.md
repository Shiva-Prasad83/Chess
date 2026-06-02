Chess-Game Project Flow:

-> user1 gets login and redirected to /lobby page.user1 has two options create room or join room
-> Joining requires roomCode.
-> user2 gets login and redirected to /lobby page.user2 has two options create room or join room

Lets say, user1 created the room,one player object is created in the backend with properties like 
{name,userId,socketId,createdRoom:true} here createdRoom is extra for the player who creates the room.So that in the frontend, if the user._id of the user from redux slice and userId from the room.players matches, he can only start the Game.

-> After creating the room, the user gets navigate to the 'room/:roomCode' url,
In this component, inside useEffect(), socket.emits("room:join") event again even though room created user is already part of the room, because backend is listening to "room:join" event in which the backend emits the "room:presence" event to the entire room  to the frontend which every useful because, this event returns the updated room to the frontend, that room is stored using setRoom().
So, the users in the room, gets the live updates.

Now, user2 joins the room by entering the roomCode, In the backend, new player object is created and pushed into the room.players array. Now, this room:join event emits the 'room:presence' event to to the entire room with the updated room to the frontend.
Now, in this room there are user1 and user2. So the room status will be ready.
user1 will get the Start Game button.

-> user1 clicks the start game button, onclick of this socket.emits() game:start event from frontend, backend listens to it and emit the one more event to the entire room called game:started
with updated room.
-> and return ack({ok:true,message:"Starting Game"})
-> frontend if ok then navigates to Game Component. in this Game component again inside useEffect() socket.emit('room':'join') to the updated room, in this component Chessboard will integrated and 
the actual game starts here.


******************************************* Code Structure ******************************************

Backend:
-> Create a user Schema using mongoose.
-> Create signup controller to validate the data, hash the password using bcrypt and store in the database.
-> While logging in, create accessToken store it in res.cookie(), and create refreshToken store it in res.cookie() but path is /refresh
-> In Logout controller clear the cookies.
-> To hit fetchme api , write the middlware verify the accessToken, if accessToken is not present or expired after 15mins send 401 error, so that axios interceptor hits the refresh end point, that creates new accessToken if the refreshToken is present.

Frontend:
-> create user slice and store using redux toolkit. 
-> create login and signup components. Onclick of signup or login buttons, collect the data from those forms, call the login and signup functions using useDispatch,which are created and exported from userSlice.js.
-> Those functions are created using createAsyncThunk, to hit the backend api from userSlice.
-> Handle error using thunkAPI.rejectWithValue.
-> Same for logout, fetchMe, refresh endpoints also
-> use useSelector() hook to access the state from authReducer.
-> {user} = useSelector((state)=>state.authReducer);

Socket connection:
-> used packages: socket.io in backend and socket.io-client in frontend

From Frontend:

"room:create"
After login, Two options are there -> create room or join room.
OnClick of create room, socket connection will be established, 
and "room:create" event emitted from the frontend, backend listens to the event, create room with room code joins the player into the room and stores that room inside rooms map().
and one room is created and stored in rooms map in the backend , in the frontend on successfull room creation user will be navigated to the room component to start the game.

"room:join"
OnClick of join room, socket connection will be established, 
and "room:join" event will be emitted from the frontend and backend listens to the event and join the player into the room by given roomCode
on succesfully joining of the room,user will be navigated to the room component

users can the details of players inside the room, for now the room is size is 2 only.

"room:leave"
OnClick of leave button inside the room component, "room:leave" event will be emitted from the frontend, backend is listening to that event, deletes the player from the room and sets the status to waiting.
If the both players want to leave room, then that room will be deleted from the rooms map().


From Backend:
"room:presence", while creating the room "room:presence" event will be emitted from backend
frontend listens to it because it returns the update information about the room.

This "room:presence" event emitted to current only by using io.to(roomCode).emit("room:presence",room) 
While joining the room also it will be emitted, because the new player has the joined, by emitting this event the room will be updated, so this event returns the updated room to the frontend

-> Same for leave room also.

//Room related events.

rooms={
    //each room structure
    roomCode:{
        roomCode,
        players:[{userId,socketId,name}],
        status:"waiting"||"ready",
        createdAt,
        game:new Chess(),// very big size can't send to frontend so, getPublicRoom(room) function takes room removes the game property and returns remaining object.
        //Every time we send room to the frontend, we call this getPublicRoom(room) with the room.
        fen:new Chess().fen(),
        whiteId,
        blackId,
        lastMove
    }
}

1) room:create --> creates the room, calls the getPublicRoom() returns the room object using ack function passed from the frontend.

2) room:join --> Checks if the player is already part of the room, if not, joins the player into the room. Otherwise, it means he/she was already part of the room, may be disconnected, so new socketId will be put into the players array.

3) room:leave --> Exit the player from the room object, if the room.players.length==0, deletes the room from the rooms map().

4) room:presence --> is the event emitted from backend to the entire room, whenever there is an update inside the room object.

Game related events.
game:update
Whenever the player makes a move, this event will trigger
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
