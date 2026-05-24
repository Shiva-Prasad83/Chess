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
import Profile from './pages/Profile'
function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchMe());
  }, [dispatch]);
  return <BrowserRouter>
    <Routes>
      <Route element={<Layout />}>
        <Route path='/' element={<Home />} />
        <Route path='/login' element={<Login />} />
        <Route path='/signup' element={<Signup />} />
        <Route element={<ProtectedRoute />}>
          <Route path='/lobby' element={<Lobby />} />
          <Route path='/profile' element={<Profile />} />
        </Route>

      </Route>
    </Routes>
  </BrowserRouter>
}

export default App
