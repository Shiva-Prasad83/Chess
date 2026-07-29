import { useEffect, useState } from 'react'
import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Lobby from './pages/Lobby';
import { useDispatch } from 'react-redux'
import { fetchMe } from './slices/authSlice'
import Profile from './components/Profile'
import Room from './pages/Room'
import Game from './pages/Game'
import Leaderboard from './pages/Leaderboard'
import PlayOnline from './pages/PlayOnline'
import Play_With_Friends from './pages/Play_With_Friends'
import Friends from './pages/Friends'
import { socket } from './socket'
import { gotInvite } from './slices/friendInviteSlice'
function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchMe());
  }, [dispatch]);

  useEffect(() => {
    //Multiple Friends can invite one friend.So we have to maintain one array of invites.
    socket.on('invite', (inviteDetails) => {
      console.log('Friend is inviting');
      dispatch(gotInvite(inviteDetails));
    })
    return () => {
      socket.disconnect();
    }
  }, [])
  return <BrowserRouter>
    <Routes>
      <Route element={<Layout />}>
        <Route path='/' element={<Home />} />
        <Route path='/login' element={<Login />} />
        <Route path='/signup' element={<Signup />} />
        <Route element={<ProtectedRoute />}>
          <Route path='/lobby' element={<Lobby />} />
          <Route path='/play_with_friends' element={<Play_With_Friends />} />
          <Route path='/profile/:name' element={<Profile />} />
          <Route path='/leaderboard' element={<Leaderboard />} />
          <Route path='/friends' element={<Friends />} />
        </Route>
      </Route>
      <Route path='/game/:roomCode' element={<Game />} />
      <Route path='/rooms/:roomCode' element={<Room />} />
      <Route path='/online' element={<PlayOnline />} />
    </Routes>
  </BrowserRouter>
}

export default App;
