import { useState } from 'react'
import { login } from '../services/auth'

export default function Login({ onSuccess }){
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('jm123')
  const [error, setError] = useState('')

  function submit(e){
    e.preventDefault()
    const res = login(username.trim(), password)
    if(!res.ok){
      setError(res.error || 'Erro ao entrar.')
      return
    }
    onSuccess?.(res.session)
  }

  return (
    <div className="login">
      <form className="loginbox" onSubmit={submit}>
        <div className="top">
          <img src="/assets/logo.png" alt="JM Cookies" />
          <div>
            <h2>Entrar no Caixa</h2>
            <p>Controle de compras, vendas e lucro — do jeito certo.</p>
          </div>
        </div>

        <div className="fields">
          <div>
            <label>Usuário</label>
            <input value={username} onChange={(e)=>setUsername(e.target.value)} placeholder="admin" />
          </div>
          <div>
            <label>Senha</label>
            <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="jm123" />
          </div>
          {error ? <div className="notice"><b>Ops:</b> {error}</div> : null}
          <button className="btn primary" type="submit">Entrar</button>
          <div className="footerhint">Padrão: <b>admin</b> / <b>jm123</b> (troque depois no arquivo de auth).</div>
        </div>
      </form>
    </div>
  )
}
