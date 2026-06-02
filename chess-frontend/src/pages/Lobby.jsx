import React, { useState } from 'react';
import { connectSocket, socket } from '../socket';
import { useNavigate } from 'react-router-dom';

function Lobby() {
    const [roomCode, setRoomCode] = useState("");
    const navigate = useNavigate();
    function createRoom() {
        connectSocket();
        //This callback function is passed as an argument to the backend.
        //Socket which is listening to room:create -> socket.on('room:create',(argument)=>{
        //this argument is called the callback function we are passing from frontend
        //argument('response');
        //This is response we get to the frontend.
        //})
        socket.emit('room:create', (response) => {
            if (!response.ok) {
                return alert(response.message || "Failed to create room");
            }
            navigate(`/rooms/${response.room.roomCode}`);
        })
    }

    function joinRoom() {
        connectSocket();
        //Here roomCode is the state variable which has the input value.
        socket.emit('room:join', roomCode, (response) => {
            console.log(response, "Join Room Response");
            if (!response.ok) {
                return alert(response.message || "Failed to join room");
            }
            navigate(`/rooms/${roomCode}`);
        })
    }
    return (
        <div className='flex gap-4 items-center'>
            <button className='bg-yellow-400 text-white rounded-lg cursor-pointer p-2'
                onClick={createRoom}
            >Create Room</button>
            <p>OR</p>
            <input type="text" placeholder='Enter Room Code'
                className='border p-2 rounded-lg'
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
            />
            < button className='bg-green-500 p-2 rounded-lg cursor-pointer'
                onClick={joinRoom}
            >Join Room</button>
        </div>
    )
}

export default Lobby