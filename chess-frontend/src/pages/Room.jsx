import React, { useEffect } from 'react'
import { socket } from '../socket'

function Room() {
    useEffect(() => {
        return () => {
            socket.disconnect();
        }
    }, [])
    return (
        <div>Room</div>
    )
}

export default Room;