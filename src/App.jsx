
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import { useState } from 'react'

export default function App(){
  const [user, setUser] = useState(localStorage.getItem('jm_user'))

  if(!user){
    return <Login onLogin={setUser} />
  }

  return <Dashboard />
}
