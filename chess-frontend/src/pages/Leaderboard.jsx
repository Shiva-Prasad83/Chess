import React from 'react'
import api from '../api/client';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
function Leaderboard() {
    const [leaderboardPlayers, setLeaderboardPlayers] = useState([]);
    const { user } = useSelector((state) => state.authReducer);
    async function getLeaboard() {
        const data = await api.get('/leaderboard');
        //console.log(data.data.players);
        setLeaderboardPlayers(data.data.players);
    }
    useEffect(() => {
        getLeaboard();
    }, [])
    return (
        <div>
            <h1>Leaderboard</h1>
            <table>
                <thead>
                    <tr>
                        <th>Rank</th>
                        <th>Player</th>
                        <th>Games Played</th>
                        <th>Wins</th>
                        <th>Loses</th>
                        <th>Rating</th>
                        <th>Max Streak</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        leaderboardPlayers?.map((player, index) =>
                            <tr className={user._id.toString() === player._id.toString() ? "bg-blue-400" : ""}>
                                <td>#{index + 1}</td>
                                <td>{player._id.toString() === user._id.toString() ? `${player.name} (Me)` : player.name}</td>
                                <td>{player.stats.gamesPlayed}</td>
                                <td>{player.stats.wins}</td>
                                <td>{player.stats.loses}</td>
                                <td>{player.stats.rating}</td>
                                <td>{player.stats.maxWinningStreak}</td>
                            </tr>
                        )
                    }
                </tbody>
            </table>
        </div>
    )
}

export default Leaderboard;