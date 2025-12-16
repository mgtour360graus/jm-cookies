import { useState } from 'react'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import { getSession, logout } from './services/auth'

export default function App(){
  const [session, setSession] = useState(()=>getSession())

  if(!session){
    return <Login onSuccess={setSession} />
  }

  return (
    <Dashboard
      session={session}
      onLogout={()=>{
        logout()
        setSession(null)
      }}
    />
  )
}
